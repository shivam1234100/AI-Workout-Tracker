import { create } from 'zustand';

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

    startWorkout: () => void;
    finishWorkout: () => void;
    addExercise: (exercise: any) => void;
    addSet: (exerciseIndex: number) => void;
    updateSet: (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => void;
    removeSet: (exerciseIndex: number, setIndex: number) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
    activeWorkout: null,

    startWorkout: () => set({
        activeWorkout: {
            startTime: Date.now(),
            exercises: []
        }
    }),

    finishWorkout: () => {
        // Logic to save workout would go here (e.g. to a history store or API)
        set({ activeWorkout: null });
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
}));
