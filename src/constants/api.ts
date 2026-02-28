import { Platform } from 'react-native';

// Use your Mac's local IP so the phone (Expo Go) can reach the backend
// Android Emulator uses 10.0.2.2, physical devices use Mac's IP
// Web uses localhost directly
const LOCAL_IP = '192.168.5.216';
export const API_URL = Platform.OS === 'web'
    ? 'http://localhost:3000'
    : `http://${LOCAL_IP}:3000`;

