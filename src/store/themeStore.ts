import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

interface ThemeState {
    colorScheme: 'light' | 'dark' | 'system';
    setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
    toggleColorScheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            colorScheme: 'system',
            setColorScheme: (scheme) => set({ colorScheme: scheme }),
            toggleColorScheme: () => {
                const current = get().colorScheme;
                set({ colorScheme: current === 'dark' ? 'light' : 'dark' });
            }
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
