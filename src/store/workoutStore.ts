import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { useAuthStore } from './authStore';
import { ProgramDayExercise } from '../constants/coachPrograms';

// Helper: fetch with a timeout so we fail fast if the backend is unreachable
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
};

export interface Set {
    id: string;
    reps: number;
    weight: number;
    completed: boolean;
}

export interface WorkoutExercise {
    id: string; // unique instance id
    exerciseId: string;
    name: string;
    sets: Set[];
}

export interface WorkoutState {
    activeWorkout: {
        startTime: number | null;
        exercises: WorkoutExercise[];
    } | null;

    history: any[];

    startWorkout: () => void;
    finishWorkout: (name?: string) => Promise<void>;
    fetchHistory: () => Promise<void>;
    addExercise: (exercise: any) => void;
    removeExercise: (exerciseIndex: number) => void;
    addSet: (exerciseIndex: number) => void;
    updateSet: (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => void;
    removeSet: (exerciseIndex: number, setIndex: number) => void;
    deleteWorkout: (id: string) => Promise<void>;
    startWorkoutFromProgram: (exercises: ProgramDayExercise[], dayName?: string) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            activeWorkout: null,
            history: [],

            startWorkout: () => set({
                activeWorkout: {
                    startTime: null,
                    exercises: []
                }
            }),

            fetchHistory: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const response = await fetchWithTimeout(`${API_URL}/workouts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // Merge: backend is source of truth, but keep local-only workouts
                        // (those saved as fallback when backend was unreachable)
                        set((state) => {
                            const backendIds = new Set(data.map((w: any) => w.id));
                            const localOnly = state.history.filter((w: any) => !backendIds.has(w.id));
                            return { history: [...data, ...localOnly] };
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch history:", error);
                }
            },

            finishWorkout: async (name) => {
                const { activeWorkout } = get();
                const token = useAuthStore.getState().token;

                if (activeWorkout) {
                    const workoutData = {
                        name: name || `Workout ${new Date().toLocaleDateString()}`,
                        startTime: activeWorkout.startTime,
                        endTime: Date.now(),
                        exercises: activeWorkout.exercises
                    };

                    // Optimistic save: add to local history & clear active workout immediately
                    const tempId = `local-${Date.now()}`;
                    const optimisticWorkout = {
                        ...workoutData,
                        id: tempId,
                        date: new Date().toISOString(),
                    };
                    set((state) => ({
                        activeWorkout: null,
                        history: [optimisticWorkout, ...state.history]
                    }));

                    // Sync to backend in the background (don't block UI)
                    if (token) {
                        fetchWithTimeout(`${API_URL}/workouts`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(workoutData)
                        })
                            .then(async (response) => {
                                if (response.ok) {
                                    const savedWorkout = await response.json();
                                    // Replace the temp local entry with the backend version
                                    set((state) => ({
                                        history: state.history.map(w => w.id === tempId ? savedWorkout : w)
                                    }));
                                } else {
                                    console.error(`Backend save failed: ${response.status}`);
                                }
                            })
                            .catch((error) => {
                                console.error("Background sync failed:", error);
                                // Workout stays as local-only — fine
                            });
                    }
                }
            },

            deleteWorkout: async (id) => {
                // Optimistic: remove immediately so the UI responds instantly
                const snapshot = get().history.find(w => w.id === id);
                set((state) => ({
                    history: state.history.filter(w => w.id !== id)
                }));

                // Local-only workouts (never synced to backend) — done, skip API
                if (typeof id === 'string' && id.startsWith('local-')) return;

                const token = useAuthStore.getState().token;
                if (token) {
                    try {
                        const response = await fetchWithTimeout(`${API_URL}/workouts/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        // 404 = already gone on server, that's fine
                        if (!response.ok && response.status !== 404) {
                            throw new Error('Server error');
                        }
                    } catch (error) {
                        // Rollback only for actual server errors (not network issues)
                        if (error instanceof Error && error.message === 'Server error' && snapshot) {
                            set((state) => ({ history: [snapshot, ...state.history] }));
                            throw error;
                        }
                        // Network unreachable — keep deleted locally (offline-friendly)
                    }
                }
            },

            addExercise: (exercise) => set((state) => {
                if (!state.activeWorkout) return state;
                // Start the timer when the first exercise is added
                const startTime = state.activeWorkout.startTime || Date.now();
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        startTime,
                        exercises: [
                            ...state.activeWorkout.exercises,
                            {
                                id: Math.random().toString(),
                                exerciseId: exercise._id,
                                name: exercise.name,
                                sets: [
                                    { id: Math.random().toString(), reps: 0, weight: 0, completed: false }
                                ]
                            }
                        ]
                    }
                };
            }),

            removeExercise: (exerciseIndex) => set((state) => {
                if (!state.activeWorkout) return state;
                const exercises = state.activeWorkout.exercises.filter((_, i) => i !== exerciseIndex);
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        exercises
                    }
                };
            }),

            addSet: (exerciseIndex) => set((state) => {
                if (!state.activeWorkout) return state;
                const exercises = [...state.activeWorkout.exercises];
                // Copy previous set values if exists
                const previousSet = exercises[exerciseIndex].sets[exercises[exerciseIndex].sets.length - 1];

                exercises[exerciseIndex].sets.push({
                    id: Math.random().toString(),
                    reps: previousSet ? previousSet.reps : 0,
                    weight: previousSet ? previousSet.weight : 0,
                    completed: false
                });

                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        exercises
                    }
                };
            }),

            updateSet: (exerciseIndex, setIndex, field, value) => set((state) => {
                if (!state.activeWorkout) return state;
                const exercises = [...state.activeWorkout.exercises];
                const sets = [...exercises[exerciseIndex].sets];
                sets[setIndex] = { ...sets[setIndex], [field]: value };
                exercises[exerciseIndex].sets = sets;

                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        exercises
                    }
                };
            }),

            removeSet: (exerciseIndex, setIndex) => set((state) => {
                if (!state.activeWorkout) return state;
                const exercises = [...state.activeWorkout.exercises];
                exercises[exerciseIndex].sets.splice(setIndex, 1);

                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        exercises
                    }
                };
            }),

            startWorkoutFromProgram: (programExercises, dayName) => set({
                activeWorkout: {
                    startTime: Date.now(),
                    exercises: programExercises.map(pe => ({
                        id: Math.random().toString(),
                        exerciseId: pe.exerciseId,
                        name: pe.name,
                        sets: Array.from({ length: pe.suggestedSets }, () => ({
                            id: Math.random().toString(),
                            reps: pe.suggestedReps,
                            weight: pe.suggestedWeight || 0,
                            completed: false,
                        })),
                    })),
                },
            }),
        }),
        {
            name: 'workout-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
