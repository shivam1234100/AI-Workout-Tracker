import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
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
            signIn: async (email, password) => {
                // Mock API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                set({
                    isAuthenticated: true,
                    user: { id: 'mock-user-id', email, name: email.split('@')[0] }
                });
            },
            signUp: async (email, password) => {
                // Mock API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                set({
                    isAuthenticated: true,
                    user: { id: 'mock-user-id', email, name: email.split('@')[0] }
                });
            },
            signOut: () => {
                set({ isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
