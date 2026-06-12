import { useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHealthStore } from '../store/healthStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useAuthStore } from '../store/authStore';
import { restingCaloriesSoFar, caloriesFromSteps } from './healthCalc';

/**
 * Hook that manages real pedometer subscription and calorie calculations.
 * Call this once in App.tsx or a top-level component.
 */
export function useHealthSync() {
    const subscriptionRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const {
        updateTodaySteps,
        updateTodayCalories,
        fetchPedometerHistory,
        syncDayReset,
        setInitialized,
        todaySteps,
    } = useHealthStore();

    const { history: workoutHistory } = useWorkoutStore();
    const { user } = useAuthStore();

    // Sync calorie data based on real steps + real workout data
    const syncCalories = () => {
        const currentSteps = useHealthStore.getState().todaySteps;
        const userProfile = useAuthStore.getState().user;
        const allWorkouts = useWorkoutStore.getState().history;

        // Resting energy burned so far today (personalized BMR scaled by elapsed day)
        const dailyResting = restingCaloriesSoFar(userProfile || {});

        // Active calories from steps, personalized by body weight
        const stepsCalories = caloriesFromSteps(currentSteps, userProfile?.weight);

        // Workout calories from today's workouts
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayWorkouts = allWorkouts.filter((w: any) => {
            const d = new Date(w.date || w.endTime);
            return d >= todayStart;
        });

        const exerciseMinutes = todayWorkouts.reduce((acc: number, w: any) => {
            if (w.startTime && w.endTime) {
                return acc + Math.round((w.endTime - w.startTime) / 60000);
            }
            return acc + 30; // estimate 30 min if no time data
        }, 0);

        // Workout-based active calories (based on volume: weight × reps × 0.005 kcal)
        const workoutCalories = todayWorkouts.reduce((acc: number, w: any) => {
            return acc + (w.exercises?.reduce((a: number, e: any) =>
                a + (Array.isArray(e.sets) ? e.sets.reduce((s: number, set: any) =>
                    s + ((set.weight || 0) * (set.reps || 0) * 0.005), 0) : 0), 0) || 0);
        }, 0);

        const totalActive = stepsCalories + Math.round(workoutCalories);

        // Stand hours — estimate based on how much of the day has passed
        // Simple heuristic: if you've taken steps, you've been standing
        const hoursPassed = new Date().getHours() + new Date().getMinutes() / 60;
        const standHours = Math.min(Math.max(Math.round(hoursPassed * 0.6), currentSteps > 0 ? 1 : 0), 24);

        updateTodayCalories({
            active: totalActive,
            resting: dailyResting,
            exercise: exerciseMinutes,
            stand: standHours,
        });
    };

    // Initialize pedometer and set up real-time tracking
    const initPedometer = async () => {
        if (Platform.OS === 'web') {
            setInitialized(false);
            return;
        }

        try {
            const { Pedometer } = await import('expo-sensors');
            const available = await Pedometer.isAvailableAsync();
            setInitialized(available);

            if (!available) return;

            // 1. Get today's step count from the pedometer
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const result = await Pedometer.getStepCountAsync(todayStart, new Date());
            updateTodaySteps(result.steps);

            // 2. Fetch past 30 days of step data from device
            await fetchPedometerHistory(30);

            // 3. Subscribe to live step updates
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }
            subscriptionRef.current = Pedometer.watchStepCount(() => {
                // On each step event, re-fetch today's total from pedometer
                // (watchStepCount gives incremental data, but getStepCountAsync gives accurate total)
                (async () => {
                    try {
                        const start = new Date();
                        start.setHours(0, 0, 0, 0);
                        const res = await Pedometer.getStepCountAsync(start, new Date());
                        updateTodaySteps(res.steps);
                    } catch {}
                })();
            });
        } catch {
            setInitialized(false);
        }
    };

    // Refresh step count (called on app foreground)
    const refreshSteps = async () => {
        if (Platform.OS === 'web') return;
        try {
            const { Pedometer } = await import('expo-sensors');
            const available = await Pedometer.isAvailableAsync();
            if (!available) return;

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const result = await Pedometer.getStepCountAsync(todayStart, new Date());
            updateTodaySteps(result.steps);
        } catch {}
    };

    useEffect(() => {
        // Purge old/stale health storage keys from previous versions
        AsyncStorage.multiRemove(['health-storage', 'health-storage-v2']).catch(() => {});

        // Reset if new day
        syncDayReset();

        // Initialize pedometer
        initPedometer();

        // Sync calories immediately and every 30 seconds
        syncCalories();
        intervalRef.current = setInterval(() => {
            syncCalories();
        }, 30000);

        // Refresh steps when app comes to foreground
        const appStateListener = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                syncDayReset();
                refreshSteps();
                syncCalories();
            }
        });

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            appStateListener.remove();
        };
    }, []);

    // Re-sync calories when workout history or steps change
    useEffect(() => {
        syncCalories();
    }, [workoutHistory, todaySteps]);
}
