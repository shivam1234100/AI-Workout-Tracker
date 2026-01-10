import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    history: any[]; // Using any[] for now to match structure, refining later if needed

    startWorkout: () => void;
    finishWorkout: (name?: string) => void;
    addExercise: (exercise: any) => void;
    addSet: (exerciseIndex: number) => void;
    updateSet: (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => void;
    removeSet: (exerciseIndex: number, setIndex: number) => void;
    deleteWorkout: (id: string) => void;
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

            finishWorkout: (name) => {
                const { activeWorkout, history } = get();
                if (activeWorkout) {
                    const completedWorkout = {
                        ...activeWorkout,
                        id: Math.random().toString(),
                        endTime: Date.now(),
                        date: new Date().toISOString(),
                        name: name || `Workout ${new Date().toLocaleDateString()}`
                    };
                    set({
                        activeWorkout: null,
                        history: [completedWorkout, ...history]
                    });
                }
            },

            deleteWorkout: (id) => set((state) => ({
                history: state.history.filter(w => w.id !== id)
            })),

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
