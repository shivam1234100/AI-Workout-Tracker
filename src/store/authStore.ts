import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../constants/api';

interface User {
    id: string;
    email: string;
    name: string;
    height?: number | null;
    weight?: number | null;
    gender?: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string) => Promise<void>;
    signOut: () => void;
    updateProfile: (data: { height?: number; weight?: number; gender?: string; name?: string }) => Promise<void>;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            signIn: async (email, password) => {
                try {
                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await response.json();

                    if (!response.ok) throw new Error(data.error || 'Login failed');

                    set({
                        isAuthenticated: true,
                        user: data.user,
                        token: data.token
                    });
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
            signUp: async (email, password, firstName) => {
                try {
                    const response = await fetch(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, name: firstName }),
                    });
                    const data = await response.json();

                    if (!response.ok) throw new Error(data.error || 'Signup failed');

                    set({
                        isAuthenticated: true,
                        user: data.user,
                        token: data.token
                    });
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
            signOut: () => {
                set({ isAuthenticated: false, user: null, token: null });
            },
            updateProfile: async (data) => {
                const { token, user } = get();
                if (!token) throw new Error('Not authenticated');
                try {
                    const response = await fetch(`${API_URL}/auth/profile`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                    });
                    const updated = await response.json();
                    if (!response.ok) throw new Error(updated.error || 'Update failed');
                    set({ user: { ...user, ...updated } as User });
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
            fetchProfile: async () => {
                const { token, user } = get();
                if (!token) return;
                try {
                    const response = await fetch(`${API_URL}/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await response.json();
                    if (response.ok) {
                        set({ user: { ...user, ...data } as User });
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
