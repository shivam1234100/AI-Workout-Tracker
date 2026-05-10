import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPrefs } from '../lib/notifications';

interface NotificationStore {
  prefs: NotificationPrefs;
  permissionGranted: boolean;
  setPrefs: (prefs: Partial<NotificationPrefs>) => void;
  setPermissionGranted: (granted: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      prefs: {
        enabled: false,
        motivation: true,
        workoutReminder: true,
        quirkyFacts: true,
        dietTips: true,
        reminderTime: '18:00',
      },
      permissionGranted: false,
      setPrefs: (partial) =>
        set((state) => ({ prefs: { ...state.prefs, ...partial } })),
      setPermissionGranted: (granted) => set({ permissionGranted: granted }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
