import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../constants/api';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null, // Initialize token
            signIn: async (email, password) => {
                try {
                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await response.json();

                    if (!response.ok) throw new Error(data.error || 'Login failed');

                    // Store token in AsyncStorage (handled by persist middleware mostly, but good to be explicit if separating token)
                    // For now, we store the whole user object including token if needed, or just rely on persist
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
            signUp: async (email, password) => {
                try {
                    const response = await fetch(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, name: email.split('@')[0] }),
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
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
