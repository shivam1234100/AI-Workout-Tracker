import React, { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '../store/themeStore';

interface ThemeColors {
    background: string;
    card: string;
    cardGlass: string;
    cardElevated: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    borderInput: string;
    inputBg: string;
    tabBar: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
}

const darkColors: ThemeColors = {
    background: '#0a0e1a',
    card: '#111827',
    cardGlass: 'rgba(17, 24, 39, 0.8)',
    cardElevated: '#1a2332',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    border: '#374151',
    borderLight: '#1f2937',
    borderInput: '#1f2937',
    inputBg: '#1a1f2e',
    tabBar: '#0f1420',
    tabBarBorder: '#1f2937',
    tabBarActive: '#22c55e',
    tabBarInactive: '#6b7280',
};

const lightColors: ThemeColors = {
    background: '#f9fafb',
    card: '#ffffff',
    cardGlass: 'rgba(255, 255, 255, 0.85)',
    cardElevated: '#ffffff',
    text: '#111827',
    textSecondary: '#4b5563',
    textTertiary: '#9ca3af',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderInput: '#e5e7eb',
    inputBg: '#f9fafb',
    tabBar: '#ffffff',
    tabBarBorder: '#e5e7eb',
    tabBarActive: '#22c55e',
    tabBarInactive: '#9ca3af',
};

export const accent = {
    green: '#22c55e',
    greenBg: 'rgba(34, 197, 94, 0.12)',
    greenDark: '#16a34a',
    red: '#ef4444',
    redBg: 'rgba(239, 68, 68, 0.12)',
    amber: '#f59e0b',
    amberBg: 'rgba(245, 158, 11, 0.12)',
    indigo: '#6366f1',
    indigoBg: 'rgba(99, 102, 241, 0.12)',
    blue: '#3b82f6',
    blueBg: 'rgba(59, 130, 246, 0.12)',
    cyan: '#06b6d4',
    cyanBg: 'rgba(6, 182, 212, 0.12)',
    purple: '#a855f7',
    purpleBg: 'rgba(168, 85, 247, 0.12)',
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    }),
};

interface ThemeContextValue {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        return { isDark: true, colors: darkColors, toggleTheme: () => {} };
    }
    return ctx;
}
