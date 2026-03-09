import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import "./global.css"

import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    primary: '#2563eb',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    border: '#f3f4f6',
    primary: '#2563eb',
  },
};

function AppContent() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
