export interface Exercise {
    _id: string;
    name: string;
    muscleGroup: string;
    difficulty: string;
    equipment: string;
    description: string;
    image?: string;
    tips?: string[];
}

export const MOCK_EXERCISES: Exercise[] = [
    { _id: '1', name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Lie on a flat bench and press the barbell upward.', tips: ['Keep your feet flat on the floor', 'Maintain a slight arch in your back'] },
    { _id: '2', name: 'Squat', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Stand with barbell on your shoulders and squat down.', tips: ['Keep your knees tracking over your toes', 'Drive through your heels'] },
    { _id: '3', name: 'Deadlift', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Barbell', description: 'Lift a barbell from the floor to hip level.', tips: ['Keep the bar close to your body', 'Engage your lats'] },
    { _id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Press barbell overhead from shoulder height.', tips: ['Brace your core', 'Full lockout at the top'] },
    { _id: '5', name: 'Barbell Row', muscleGroup: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Bend over and row a barbell to your lower chest.', tips: ['Keep your back flat', 'Squeeze your shoulder blades'] },
    { _id: '6', name: 'Pull-ups', muscleGroup: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', description: 'Hang from a bar and pull yourself up until chin clears.', tips: ['Full dead hang at the bottom', 'Drive elbows down'] },
    { _id: '7', name: 'Push-ups', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Standard push-up from the floor.', tips: ['Keep your body in a straight line', 'Full range of motion'] },
    { _id: '8', name: 'Bicep Curl', muscleGroup: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Curl dumbbells from arms extended to shoulders.', tips: ['Don\'t swing your body', 'Control the negative'] },
    { _id: '9', name: 'Tricep Dips', muscleGroup: 'Triceps', difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Dip between parallel bars or a bench.', tips: ['Keep elbows close to your body', 'Go to at least 90 degrees'] },
    { _id: '10', name: 'Lateral Raise', muscleGroup: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Raise dumbbells out to the sides.', tips: ['Slight bend in elbows', 'Lead with your elbows'] },
    { _id: '11', name: 'Leg Press', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Machine', description: 'Push a weighted platform away using your legs.', tips: ['Don\'t lock your knees', 'Full range of motion'] },
    { _id: '12', name: 'Lunges', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Step forward and lower your body until both knees are at 90 degrees.', tips: ['Keep your torso upright', 'Step far enough forward'] },
    { _id: '13', name: 'Plank', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Hold a straight-arm or forearm plank position.', tips: ['Keep your hips level', 'Engage your core throughout'] },
    { _id: '14', name: 'Crunches', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Lie on your back and curl your torso toward your knees.', tips: ['Don\'t pull on your neck', 'Focus on contracting your abs'] },
    { _id: '15', name: 'Dumbbell Fly', muscleGroup: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbell', description: 'Lie on a bench and open your arms wide with dumbbells.', tips: ['Slight bend in elbows', 'Squeeze at the top'] },
    { _id: '16', name: 'Hammer Curl', muscleGroup: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Curl dumbbells with a neutral grip.', tips: ['Keep elbows pinned to your sides', 'Control the tempo'] },
    { _id: '17', name: 'Skull Crushers', muscleGroup: 'Triceps', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Lying tricep extension with EZ bar.', tips: ['Keep upper arms vertical', 'Lower to your forehead'] },
    { _id: '18', name: 'Burpees', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Bodyweight', description: 'Full body exercise combining a squat, push-up, and jump.', tips: ['Keep a fast pace', 'Full extension on the jump'] },
    { _id: '19', name: 'Mountain Climbers', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Alternate driving your knees to your chest in a plank position.', tips: ['Keep your hips low', 'Maintain a steady rhythm'] },
    { _id: '20', name: 'Romanian Deadlift', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', description: 'Hinge at the hips with slight knee bend, lowering barbell along your legs.', tips: ['Feel the stretch in your hamstrings', 'Keep the bar close to your legs'] },
];
