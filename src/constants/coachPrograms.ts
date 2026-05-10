export interface ProgramDayExercise {
    exerciseId: string;
    name: string;
    suggestedSets: number;
    suggestedReps: number;
    suggestedWeight?: number;
}

export interface ProgramDayData {
    id: string;
    name: string;
    exercises: ProgramDayExercise[];
}

export interface CoachProgram {
    id: string;
    name: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    durationWeeks: number;
    days: ProgramDayData[];
}

export interface UserProgram {
    id: string;
    name: string;
    description?: string;
    difficulty?: string;
    durationWeeks?: number;
    days: {
        id: string;
        name: string;
        order: number;
        exercises: ProgramDayExercise[];
    }[];
    createdAt?: string;
}

export const COACH_PROGRAMS: CoachProgram[] = [
    {
        id: 'coach-ppl',
        name: 'Push Pull Legs',
        description: 'Classic 6-day split targeting push muscles, pull muscles, and legs on separate days. Great for intermediate lifters looking to build muscle.',
        difficulty: 'Intermediate',
        durationWeeks: 8,
        days: [
            {
                id: 'ppl-push',
                name: 'Push Day',
                exercises: [
                    { exerciseId: '1', name: 'Barbell Bench Press', suggestedSets: 4, suggestedReps: 8 },
                    { exerciseId: '2', name: 'Incline Dumbbell Press', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '5', name: 'Cable Crossovers', suggestedSets: 3, suggestedReps: 12 },
                    { exerciseId: '17', name: 'Overhead Press', suggestedSets: 4, suggestedReps: 8 },
                    { exerciseId: '18', name: 'Lateral Raises', suggestedSets: 3, suggestedReps: 15 },
                    { exerciseId: '23', name: 'Tricep Pushdowns', suggestedSets: 3, suggestedReps: 12 },
                ],
            },
            {
                id: 'ppl-pull',
                name: 'Pull Day',
                exercises: [
                    { exerciseId: '6', name: 'Deadlift', suggestedSets: 4, suggestedReps: 5 },
                    { exerciseId: '7', name: 'Pull-Ups', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '8', name: 'Barbell Rows', suggestedSets: 4, suggestedReps: 8 },
                    { exerciseId: '9', name: 'Lat Pulldowns', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '19', name: 'Face Pulls', suggestedSets: 3, suggestedReps: 15 },
                    { exerciseId: '21', name: 'Barbell Curls', suggestedSets: 3, suggestedReps: 10 },
                ],
            },
            {
                id: 'ppl-legs',
                name: 'Leg Day',
                exercises: [
                    { exerciseId: '11', name: 'Barbell Squat', suggestedSets: 4, suggestedReps: 6 },
                    { exerciseId: '12', name: 'Leg Press', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '13', name: 'Romanian Deadlift', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '14', name: 'Lunges', suggestedSets: 3, suggestedReps: 12 },
                    { exerciseId: '15', name: 'Leg Extensions', suggestedSets: 3, suggestedReps: 12 },
                    { exerciseId: '16', name: 'Calf Raises', suggestedSets: 4, suggestedReps: 15 },
                ],
            },
        ],
    },
    {
        id: 'coach-5x5',
        name: '5x5 Strength',
        description: 'Proven strength program alternating two workouts with compound lifts. Focus on progressive overload with 5 sets of 5 reps.',
        difficulty: 'Intermediate',
        durationWeeks: 12,
        days: [
            {
                id: '5x5-a',
                name: 'Workout A',
                exercises: [
                    { exerciseId: '11', name: 'Barbell Squat', suggestedSets: 5, suggestedReps: 5 },
                    { exerciseId: '1', name: 'Barbell Bench Press', suggestedSets: 5, suggestedReps: 5 },
                    { exerciseId: '8', name: 'Barbell Rows', suggestedSets: 5, suggestedReps: 5 },
                ],
            },
            {
                id: '5x5-b',
                name: 'Workout B',
                exercises: [
                    { exerciseId: '11', name: 'Barbell Squat', suggestedSets: 5, suggestedReps: 5 },
                    { exerciseId: '17', name: 'Overhead Press', suggestedSets: 5, suggestedReps: 5 },
                    { exerciseId: '6', name: 'Deadlift', suggestedSets: 1, suggestedReps: 5 },
                ],
            },
        ],
    },
    {
        id: 'coach-beginner',
        name: 'Beginner Full Body',
        description: 'Simple 3-day full body program perfect for beginners. Learn the basic movements with manageable volume.',
        difficulty: 'Beginner',
        durationWeeks: 4,
        days: [
            {
                id: 'beg-1',
                name: 'Day 1 - Full Body A',
                exercises: [
                    { exerciseId: '11', name: 'Barbell Squat', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '1', name: 'Barbell Bench Press', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '8', name: 'Barbell Rows', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '26', name: 'Plank', suggestedSets: 3, suggestedReps: 30 },
                ],
            },
            {
                id: 'beg-2',
                name: 'Day 2 - Full Body B',
                exercises: [
                    { exerciseId: '14', name: 'Lunges', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '17', name: 'Overhead Press', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '9', name: 'Lat Pulldowns', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '27', name: 'Crunches', suggestedSets: 3, suggestedReps: 15 },
                ],
            },
            {
                id: 'beg-3',
                name: 'Day 3 - Full Body C',
                exercises: [
                    { exerciseId: '12', name: 'Leg Press', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '2', name: 'Incline Dumbbell Press', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '10', name: 'Single Arm Dumbbell Row', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '21', name: 'Barbell Curls', suggestedSets: 2, suggestedReps: 12 },
                    { exerciseId: '23', name: 'Tricep Pushdowns', suggestedSets: 2, suggestedReps: 12 },
                ],
            },
        ],
    },
    {
        id: 'coach-upper-lower',
        name: 'Upper Lower Split',
        description: 'A balanced 4-day program alternating upper and lower body workouts. Ideal for building strength and size.',
        difficulty: 'Intermediate',
        durationWeeks: 8,
        days: [
            {
                id: 'ul-upper1',
                name: 'Upper Body A',
                exercises: [
                    { exerciseId: '1', name: 'Barbell Bench Press', suggestedSets: 4, suggestedReps: 6 },
                    { exerciseId: '8', name: 'Barbell Rows', suggestedSets: 4, suggestedReps: 6 },
                    { exerciseId: '17', name: 'Overhead Press', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '7', name: 'Pull-Ups', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '21', name: 'Barbell Curls', suggestedSets: 2, suggestedReps: 12 },
                    { exerciseId: '24', name: 'Skull Crushers', suggestedSets: 2, suggestedReps: 12 },
                ],
            },
            {
                id: 'ul-lower1',
                name: 'Lower Body A',
                exercises: [
                    { exerciseId: '11', name: 'Barbell Squat', suggestedSets: 4, suggestedReps: 6 },
                    { exerciseId: '13', name: 'Romanian Deadlift', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '12', name: 'Leg Press', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '15', name: 'Leg Extensions', suggestedSets: 3, suggestedReps: 12 },
                    { exerciseId: '16', name: 'Calf Raises', suggestedSets: 4, suggestedReps: 15 },
                ],
            },
            {
                id: 'ul-upper2',
                name: 'Upper Body B',
                exercises: [
                    { exerciseId: '2', name: 'Incline Dumbbell Press', suggestedSets: 4, suggestedReps: 8 },
                    { exerciseId: '9', name: 'Lat Pulldowns', suggestedSets: 4, suggestedReps: 8 },
                    { exerciseId: '18', name: 'Lateral Raises', suggestedSets: 3, suggestedReps: 15 },
                    { exerciseId: '19', name: 'Face Pulls', suggestedSets: 3, suggestedReps: 15 },
                    { exerciseId: '22', name: 'Hammer Curls', suggestedSets: 2, suggestedReps: 12 },
                    { exerciseId: '25', name: 'Dips', suggestedSets: 3, suggestedReps: 10 },
                ],
            },
            {
                id: 'ul-lower2',
                name: 'Lower Body B',
                exercises: [
                    { exerciseId: '6', name: 'Deadlift', suggestedSets: 4, suggestedReps: 5 },
                    { exerciseId: '104', name: 'Front Squat', suggestedSets: 3, suggestedReps: 8 },
                    { exerciseId: '14', name: 'Lunges', suggestedSets: 3, suggestedReps: 10 },
                    { exerciseId: '15', name: 'Leg Extensions', suggestedSets: 3, suggestedReps: 12 },
                    { exerciseId: '16', name: 'Calf Raises', suggestedSets: 4, suggestedReps: 15 },
                ],
            },
        ],
    },
];
