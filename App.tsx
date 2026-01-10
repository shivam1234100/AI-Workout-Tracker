import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation';

import "./global.css"

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

export default function App() {

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DefaultTheme}>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
