import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface DaySteps {
    date: string; // YYYY-MM-DD
    steps: number;
}

export interface DayCalories {
    date: string;
    active: number;
    resting: number;
    exercise: number; // minutes
    stand: number; // hours
}

// Bump this version to force a wipe of stale/mock history data
const HEALTH_DATA_VERSION = 3;

interface HealthState {
    _dataVersion: number;

    stepGoal: number;
    calorieGoal: number;
    exerciseGoal: number; // minutes
    standGoal: number; // hours

    stepsHistory: DaySteps[];
    caloriesHistory: DayCalories[];

    todaySteps: number;
    todayCalories: DayCalories;

    isPedometerAvailable: boolean;
    isInitialized: boolean;

    setStepGoal: (goal: number) => void;
    setCalorieGoal: (goal: number) => void;
    setExerciseGoal: (goal: number) => void;
    setStandGoal: (goal: number) => void;

    updateTodaySteps: (steps: number) => void;
    updateTodayCalories: (data: Partial<DayCalories>) => void;
    syncDayReset: () => void;
    setInitialized: (available: boolean) => void;

    // Fetch real historical step data from the Pedometer API for past N days
    fetchPedometerHistory: (days: number) => Promise<void>;

    getStepsForRange: (days: number) => DaySteps[];
    getCaloriesForRange: (days: number) => DayCalories[];
    getAverageSteps: (days: number) => number;
    getAverageCalories: (days: number) => number;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const emptyDayCalories = (): DayCalories => ({
    date: todayStr(),
    active: 0,
    resting: 0,
    exercise: 0,
    stand: 0,
});

export const useHealthStore = create<HealthState>()(
    persist(
        (set, get) => ({
            _dataVersion: HEALTH_DATA_VERSION,

            stepGoal: 10000,
            calorieGoal: 500,
            exerciseGoal: 30,
            standGoal: 12,

            stepsHistory: [],
            caloriesHistory: [],
            todaySteps: 0,
            todayCalories: emptyDayCalories(),

            isPedometerAvailable: false,
            isInitialized: false,

            setStepGoal: (goal) => set({ stepGoal: goal }),
            setCalorieGoal: (goal) => set({ calorieGoal: goal }),
            setExerciseGoal: (goal) => set({ exerciseGoal: goal }),
            setStandGoal: (goal) => set({ standGoal: goal }),

            setInitialized: (available) => set({ isPedometerAvailable: available, isInitialized: true }),

            updateTodaySteps: (steps) => {
                const d = todayStr();
                set((state) => {
                    const hist = state.stepsHistory.filter((h) => h.date !== d);
                    hist.push({ date: d, steps });
                    return { todaySteps: steps, stepsHistory: hist };
                });
            },

            updateTodayCalories: (data) => {
                const d = todayStr();
                set((state) => {
                    const updated = { ...state.todayCalories, ...data, date: d };
                    const hist = state.caloriesHistory.filter((h) => h.date !== d);
                    hist.push(updated);
                    return { todayCalories: updated, caloriesHistory: hist };
                });
            },

            // Reset today's data if the date has changed (new day)
            syncDayReset: () => {
                const d = todayStr();
                const state = get();
                if (state.todayCalories.date !== d) {
                    set({
                        todaySteps: 0,
                        todayCalories: emptyDayCalories(),
                    });
                }
            },

            // Fetch REAL step data from device Pedometer for the past N days
            fetchPedometerHistory: async (days: number) => {
                if (Platform.OS === 'web') return;

                try {
                    const { Pedometer } = await import('expo-sensors');
                    const available = await Pedometer.isAvailableAsync();
                    if (!available) return;

                    const state = get();

                    for (let i = 0; i < days; i++) {
                        const dayStart = new Date();
                        dayStart.setDate(dayStart.getDate() - i);
                        dayStart.setHours(0, 0, 0, 0);

                        const dayEnd = new Date();
                        dayEnd.setDate(dayEnd.getDate() - i);
                        dayEnd.setHours(23, 59, 59, 999);

                        // Don't re-fetch if we already have data for this day (except today)
                        const dateStr = dayStart.toISOString().split('T')[0];
                        if (i > 0 && state.stepsHistory.find((h) => h.date === dateStr && h.steps > 0)) {
                            continue;
                        }

                        try {
                            const result = await Pedometer.getStepCountAsync(dayStart, i === 0 ? new Date() : dayEnd);
                            const steps = result.steps;

                            set((s) => {
                                const hist = s.stepsHistory.filter((h) => h.date !== dateStr);
                                hist.push({ date: dateStr, steps });
                                if (i === 0) {
                                    return { todaySteps: steps, stepsHistory: hist };
                                }
                                return { stepsHistory: hist };
                            });
                        } catch {
                            // Some days may not have data (device was off, etc.)
                        }
                    }
                } catch {
                    // expo-sensors not available
                }
            },

            getStepsForRange: (days) => {
                const state = get();
                const result: DaySteps[] = [];
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const found = state.stepsHistory.find((h) => h.date === dateStr);
                    result.push(found || { date: dateStr, steps: 0 });
                }
                return result;
            },

            getCaloriesForRange: (days) => {
                const state = get();
                const result: DayCalories[] = [];
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const found = state.caloriesHistory.find((h) => h.date === dateStr);
                    result.push(found || { date: dateStr, active: 0, resting: 0, exercise: 0, stand: 0 });
                }
                return result;
            },

            getAverageSteps: (days) => {
                const data = get().getStepsForRange(days);
                const withData = data.filter((d) => d.steps > 0);
                if (withData.length === 0) return 0;
                return Math.round(withData.reduce((a, b) => a + b.steps, 0) / withData.length);
            },

            getAverageCalories: (days) => {
                const data = get().getCaloriesForRange(days);
                const withData = data.filter((d) => d.active > 0);
                if (withData.length === 0) return 0;
                return Math.round(withData.reduce((a, b) => a + b.active, 0) / withData.length);
            },
        }),
        {
            // Bump this key to force a complete wipe of old/stale health data
            name: 'health-storage-v3',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
