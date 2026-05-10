import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import * as Notifications from 'expo-notifications';

import "./global.css"

import { DefaultTheme, DarkTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { requestNotificationPermissions, scheduleAllNotifications } from './src/lib/notifications';
import { useNotificationStore } from './src/store/notificationStore';
import FloatingAIButton from './src/components/FloatingAIButton';

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

const navigationRef = createNavigationContainerRef<any>();

function AppContent() {
  const { isDark } = useTheme();
  const { prefs, setPermissionGranted } = useNotificationStore();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const navRef = useRef(navigationRef);

  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);
      if (granted) {
        await scheduleAllNotifications(prefs);
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={isDark ? CustomDarkTheme : CustomLightTheme}>
      <RootNavigator />
      <FloatingAIButton navRef={navRef} />
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
