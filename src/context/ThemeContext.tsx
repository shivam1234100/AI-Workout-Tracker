import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';

// ─── Color Palette ───
const lightColors = {
    background: '#f9fafb',       // gray-50
    card: '#ffffff',
    cardAlt: '#f3f4f6',          // gray-100
    text: '#111827',             // gray-900
    textSecondary: '#6b7280',    // gray-500
    textTertiary: '#9ca3af',     // gray-400
    border: '#f3f4f6',           // gray-100
    borderInput: '#d1d5db',      // gray-300
    inputBg: '#f9fafb',          // gray-50
    tabBar: '#ffffff',
    tabBarBorder: '#f3f4f6',
    tabBarInactive: '#9ca3af',
};

const darkColors = {
    background: '#111827',       // gray-900
    card: '#1f2937',             // gray-800
    cardAlt: '#374151',          // gray-700
    text: '#f9fafb',             // gray-50
    textSecondary: '#9ca3af',    // gray-400
    textTertiary: '#6b7280',     // gray-500
    border: '#374151',           // gray-700
    borderInput: '#4b5563',      // gray-600
    inputBg: '#1f2937',          // gray-800
    tabBar: '#1f2937',
    tabBarBorder: '#374151',
    tabBarInactive: '#6b7280',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextValue {
    isDark: boolean;
    colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
    isDark: false,
    colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { colorScheme: themePreference } = useThemeStore();
    const deviceColorScheme = useDeviceColorScheme();

    const isDark = useMemo(() => {
        if (themePreference === 'system') {
            return deviceColorScheme === 'dark';
        }
        return themePreference === 'dark';
    }, [themePreference, deviceColorScheme]);

    const value = useMemo(() => ({
        isDark,
        colors: isDark ? darkColors : lightColors,
    }), [isDark]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
