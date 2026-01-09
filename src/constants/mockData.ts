export const MOCK_EXERCISES = [
    {
        _id: '1',
        name: 'Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Lie on the bench with your eyes under the bar",
            "Grab the bar with a medium grip-width (thumbs around the bar!)",
            "Unrack the bar by straightening your arms",
            "Lower the bar to your mid-chest",
            "Press the bar back up until your arms are straight"
        ],
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '2',
        name: 'Squat',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
            "Stand with feet slightly wider than shoulder-width apart",
            "Hold the barbell across your upper back",
            "Lower your hips back and down as if sitting in a chair",
            "Keep your chest up and back straight",
            "Push through your heels to return to standing"
        ],
        image: 'https://images.unsplash.com/photo-1574680096141-1cddd32e0340?q=80&w=2069&auto=format&fit=crop',
    },
    {
        _id: '3',
        name: 'Deadlift',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
            "Stand with your mid-foot under the barbell",
            "Bend over and grab the bar with a shoulder-width grip",
            "Bend your knees until your shins touch the bar",
            "Lift your chest up and straighten your lower back",
            "Take a big breath, hold it, and stand up with the weight"
        ],
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'
    }
];

export const MOCK_STATS = {
    totalWorkouts: 12,
    totalExercises: 45,
    lastWorkout: '2026-01-08'
};

export const MOCK_RECENT_WORKOUTS = [
    { id: '101', name: 'Chest Day', date: '2026-01-08', exercises: 4 },
    { id: '102', name: 'Leg Day', date: '2026-01-05', exercises: 5 }
];
