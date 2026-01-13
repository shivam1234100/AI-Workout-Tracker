import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { useAuthStore } from './authStore';

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
    addSet: (exerciseIndex: number) => void;
    updateSet: (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => void;
    removeSet: (exerciseIndex: number, setIndex: number) => void;
    deleteWorkout: (id: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            activeWorkout: null,
            history: [],

            startWorkout: () => set({
                activeWorkout: {
                    startTime: Date.now(),
                    exercises: []
                }
            }),

            fetchHistory: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/workouts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        set({ history: data });
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

                    if (token) {
                        try {
                            const response = await fetch(`${API_URL}/workouts`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify(workoutData)
                            });

                            if (response.ok) {
                                const savedWorkout = await response.json();
                                set((state) => ({
                                    activeWorkout: null,
                                    history: [savedWorkout, ...state.history]
                                }));
                            } else {
                                // Fallback to local if offline or error, ideally queue for sync
                                console.error("Failed to save workout to backend");
                            }
                        } catch (error) {
                            console.error("Error saving workout:", error);
                        }
                    } else {
                        // Local fallback (legacy behavior)
                        const completedWorkout = {
                            ...workoutData,
                            id: Math.random().toString(),
                            date: new Date().toISOString(),
                        };
                        set((state) => ({
                            activeWorkout: null,
                            history: [completedWorkout, ...state.history]
                        }));
                    }
                }
            },

            deleteWorkout: async (id) => {
                const token = useAuthStore.getState().token;
                if (token) {
                    try {
                        await fetch(`${API_URL}/workouts/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (error) {
                        console.error("Error deleting workout:", error);
                    }
                }

                set((state) => ({
                    history: state.history.filter(w => w.id !== id)
                }));
            },

            addExercise: (exercise) => set((state) => {
                if (!state.activeWorkout) return state;
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
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
        }),
        {
            name: 'workout-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
