import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

interface User {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    height?: number | null;
    weight?: number | null;
    gender?: string | null;
    age?: number | null;
}

interface LoginInput {
    email?: string;
    phone?: string;
    password: string;
}

interface RegisterInput {
    email?: string;
    phone?: string;
    password: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (input: LoginInput | string, password?: string) => Promise<{ success: boolean; error?: string }>;
    register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
    signUp: (emailOrInput: string | RegisterInput, password?: string, name?: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    fetchProfile: () => Promise<void>;
}

// 90s default: the backend runs on a free Render instance that spins down after
// inactivity. Render warns a cold start "can delay requests by 50 seconds or
// more" (measured ~33s). A shorter timeout aborts the very first login of the
// day before the server has finished starting.
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 90000): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (input, maybePassword) => {
                // Support both old signature (email, password) and new ({ email|phone, password })
                let body: any;
                if (typeof input === 'string') {
                    body = { email: input, password: maybePassword };
                } else {
                    body = {};
                    if (input.email) body.email = input.email;
                    if (input.phone) body.phone = input.phone;
                    body.password = input.password;
                }

                set({ isLoading: true });
                try {
                    const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        set({ isLoading: false });
                        return { success: false, error: data.error || 'Login failed' };
                    }
                    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } catch (e: any) {
                    set({ isLoading: false });
                    return { success: false, error: e?.message || 'Network error' };
                }
            },

            register: async (input) => {
                set({ isLoading: true });
                try {
                    const body: any = { name: input.name, password: input.password };
                    if (input.email) body.email = input.email;
                    if (input.phone) body.phone = input.phone;

                    const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        set({ isLoading: false });
                        return { success: false, error: data.error || 'Registration failed' };
                    }
                    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } catch (e: any) {
                    set({ isLoading: false });
                    return { success: false, error: e?.message || 'Network error' };
                }
            },

            // Compatibility wrapper for existing SignupScreen code
            signUp: async (emailOrInput, password, name) => {
                const input: RegisterInput = typeof emailOrInput === 'string'
                    ? { email: emailOrInput, password: password!, name: name! }
                    : emailOrInput;
                const result = await get().register(input);
                if (!result.success) {
                    throw new Error(result.error || 'Sign up failed');
                }
            },

            logout: () => set({ user: null, token: null, isAuthenticated: false }),

            updateProfile: async (data) => {
                const token = get().token;
                if (!token) return;
                try {
                    const res = await fetchWithTimeout(`${API_URL}/auth/profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(data),
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        set({ user: updated });
                    }
                } catch (e) {
                    console.error('updateProfile failed:', e);
                }
            },

            fetchProfile: async () => {
                const token = get().token;
                if (!token) return;
                try {
                    const res = await fetchWithTimeout(`${API_URL}/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const user = await res.json();
                        set({ user });
                    }
                } catch (e: any) {
                    const msg = e?.message || '';
                    if (!msg.includes('Aborted') && !msg.includes('Network request failed')) {
                        console.error('fetchProfile failed:', e);
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
