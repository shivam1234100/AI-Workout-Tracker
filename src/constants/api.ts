import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, specific IP for physical device
export const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://192.168.56.1:3000'; // Replace with your LAN IP if this doesn't work
