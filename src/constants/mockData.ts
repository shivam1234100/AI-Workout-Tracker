export interface Exercise {
    _id: string;
    name: string;
    muscleGroup: string;
    difficulty: string;
    equipment: string;
    description: string;
    image?: string;
    instructions?: string[];
    videoUrl?: string;
    tips?: string[];
}

// Real exercise photos from the open-source free-exercise-db (raw GitHub, no API key needed).
const IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
// YouTube search links — always open a relevant, live tutorial (never a dead/wrong video).
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' proper form tutorial')}`;

export const MOCK_EXERCISES: Exercise[] = [
    {
        _id: '1', name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell',
        description: 'Lie on a flat bench and press the barbell upward.',
        image: IMG + 'Barbell_Bench_Press_-_Medium_Grip/0.jpg',
        videoUrl: yt('how to bench press'),
        instructions: [
            'Lie flat on the bench with your eyes under the bar and feet planted firmly on the floor.',
            'Grip the bar slightly wider than shoulder-width and unrack it so it sits over your chest.',
            'Lower the bar under control to your mid-chest, keeping your elbows tucked at about 45°.',
            'Press the bar back up to full lockout, squeezing your chest at the top.',
            'Keep your shoulder blades pinned back and a slight arch in your lower back throughout.',
        ],
        tips: ['Keep your feet flat on the floor', 'Maintain a slight arch in your back'],
    },
    {
        _id: '2', name: 'Squat', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell',
        description: 'Stand with barbell on your shoulders and squat down.',
        image: IMG + 'Barbell_Full_Squat/0.jpg',
        videoUrl: yt('how to barbell squat'),
        instructions: [
            'Position the bar on your upper back and stand with feet shoulder-width apart.',
            'Brace your core, unrack the bar and take two steps back.',
            'Push your hips back and bend your knees to lower until your thighs are at least parallel.',
            'Keep your chest up and your knees tracking over your toes.',
            'Drive through your heels to stand back up to the starting position.',
        ],
        tips: ['Keep your knees tracking over your toes', 'Drive through your heels'],
    },
    {
        _id: '3', name: 'Deadlift', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Barbell',
        description: 'Lift a barbell from the floor to hip level.',
        image: IMG + 'Barbell_Deadlift/0.jpg',
        videoUrl: yt('how to deadlift'),
        instructions: [
            'Stand with your mid-foot under the bar, feet about hip-width apart.',
            'Hinge at the hips and grip the bar just outside your knees.',
            'Flatten your back, brace your core and take the slack out of the bar.',
            'Drive through your legs and push the floor away, keeping the bar close to your body.',
            'Stand tall at the top, then lower the bar under control along the same path.',
        ],
        tips: ['Keep the bar close to your body', 'Engage your lats'],
    },
    {
        _id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell',
        description: 'Press barbell overhead from shoulder height.',
        image: IMG + 'Standing_Military_Press/0.jpg',
        videoUrl: yt('how to overhead press'),
        instructions: [
            'Hold the bar at shoulder height with your hands just outside shoulder-width.',
            'Brace your core and squeeze your glutes to create a stable base.',
            'Press the bar straight overhead, moving your head slightly back to clear it.',
            'Lock out your arms with the bar finishing over the back of your head.',
            'Lower the bar under control back down to your shoulders.',
        ],
        tips: ['Brace your core', 'Full lockout at the top'],
    },
    {
        _id: '5', name: 'Barbell Row', muscleGroup: 'Back', difficulty: 'Intermediate', equipment: 'Barbell',
        description: 'Bend over and row a barbell to your lower chest.',
        image: IMG + 'Bent_Over_Barbell_Row/0.jpg',
        videoUrl: yt('how to barbell row'),
        instructions: [
            'Hinge at the hips with a flat back until your torso is around 45°.',
            'Let the bar hang at arm\'s length with an overhand grip.',
            'Pull the bar toward your lower chest/upper stomach, driving your elbows back.',
            'Squeeze your shoulder blades together at the top of the rep.',
            'Lower the bar under control without rounding your back.',
        ],
        tips: ['Keep your back flat', 'Squeeze your shoulder blades'],
    },
    {
        _id: '6', name: 'Pull-ups', muscleGroup: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight',
        description: 'Hang from a bar and pull yourself up until chin clears.',
        image: IMG + 'Pullups/0.jpg',
        videoUrl: yt('how to do pull ups'),
        instructions: [
            'Grip the bar slightly wider than shoulder-width with your palms facing away.',
            'Start from a full dead hang with your arms straight.',
            'Pull your chest toward the bar by driving your elbows down and back.',
            'Get your chin over the bar, then pause briefly at the top.',
            'Lower yourself under control to a full hang and repeat.',
        ],
        tips: ['Full dead hang at the bottom', 'Drive elbows down'],
    },
    {
        _id: '7', name: 'Push-ups', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight',
        description: 'Standard push-up from the floor.',
        image: IMG + 'Pushups/0.jpg',
        videoUrl: yt('how to do push ups'),
        instructions: [
            'Start in a high plank with your hands slightly wider than your shoulders.',
            'Keep your body in a straight line from head to heels.',
            'Lower your chest toward the floor, keeping your elbows at about 45°.',
            'Go down until your chest nearly touches the ground.',
            'Press back up to full arm extension while bracing your core.',
        ],
        tips: ['Keep your body in a straight line', 'Full range of motion'],
    },
    {
        _id: '8', name: 'Bicep Curl', muscleGroup: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbell',
        description: 'Curl dumbbells from arms extended to shoulders.',
        image: IMG + 'Dumbbell_Bicep_Curl/0.jpg',
        videoUrl: yt('how to do dumbbell bicep curl'),
        instructions: [
            'Stand tall holding a dumbbell in each hand with arms at your sides.',
            'Keep your elbows pinned close to your torso.',
            'Curl the weights up by contracting your biceps.',
            'Squeeze at the top without swinging your body.',
            'Lower the dumbbells slowly under control to full extension.',
        ],
        tips: ['Don\'t swing your body', 'Control the negative'],
    },
    {
        _id: '9', name: 'Tricep Dips', muscleGroup: 'Triceps', difficulty: 'Beginner', equipment: 'Bodyweight',
        description: 'Dip between parallel bars or a bench.',
        image: IMG + 'Dips_-_Triceps_Version/0.jpg',
        videoUrl: yt('how to do tricep dips'),
        instructions: [
            'Grip parallel bars or the edge of a bench and support your bodyweight.',
            'Keep your torso upright to bias the triceps.',
            'Lower your body by bending your elbows to about 90°.',
            'Keep your elbows tucked in, not flaring out to the sides.',
            'Press back up to full lockout, squeezing your triceps.',
        ],
        tips: ['Keep elbows close to your body', 'Go to at least 90 degrees'],
    },
    {
        _id: '10', name: 'Lateral Raise', muscleGroup: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbell',
        description: 'Raise dumbbells out to the sides.',
        image: IMG + 'Seated_Side_Lateral_Raise/0.jpg',
        videoUrl: yt('how to do lateral raises'),
        instructions: [
            'Stand holding a dumbbell in each hand by your sides.',
            'Keep a slight bend in your elbows throughout the movement.',
            'Raise the dumbbells out to the sides until they reach shoulder height.',
            'Lead with your elbows rather than your hands.',
            'Lower the weights slowly under control.',
        ],
        tips: ['Slight bend in elbows', 'Lead with your elbows'],
    },
    {
        _id: '11', name: 'Leg Press', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Machine',
        description: 'Push a weighted platform away using your legs.',
        image: IMG + 'Leg_Press/0.jpg',
        videoUrl: yt('how to use leg press machine'),
        instructions: [
            'Sit in the machine with your back flat against the pad.',
            'Place your feet shoulder-width apart on the platform.',
            'Release the safeties and lower the platform by bending your knees to about 90°.',
            'Keep your knees tracking in line with your toes.',
            'Press through your heels to extend, without locking out your knees.',
        ],
        tips: ['Don\'t lock your knees', 'Full range of motion'],
    },
    {
        _id: '12', name: 'Lunges', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight',
        description: 'Step forward and lower your body until both knees are at 90 degrees.',
        image: IMG + 'Bodyweight_Walking_Lunge/0.jpg',
        videoUrl: yt('how to do lunges'),
        instructions: [
            'Stand tall with your feet hip-width apart.',
            'Step forward with one leg into a long stride.',
            'Lower until both knees are bent at about 90°.',
            'Keep your torso upright and your front knee over your ankle.',
            'Push through your front heel to return, then alternate legs.',
        ],
        tips: ['Keep your torso upright', 'Step far enough forward'],
    },
    {
        _id: '13', name: 'Plank', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight',
        description: 'Hold a straight-arm or forearm plank position.',
        image: IMG + 'Plank/0.jpg',
        videoUrl: yt('how to do a plank'),
        instructions: [
            'Place your forearms on the floor with your elbows under your shoulders.',
            'Extend your legs back with your toes on the ground.',
            'Form a straight line from your head to your heels.',
            'Brace your core and squeeze your glutes.',
            'Hold the position without letting your hips sag or pike up.',
        ],
        tips: ['Keep your hips level', 'Engage your core throughout'],
    },
    {
        _id: '14', name: 'Crunches', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight',
        description: 'Lie on your back and curl your torso toward your knees.',
        image: IMG + 'Crunches/0.jpg',
        videoUrl: yt('how to do crunches'),
        instructions: [
            'Lie on your back with your knees bent and feet flat on the floor.',
            'Place your hands lightly behind your head or across your chest.',
            'Curl your shoulders off the floor by contracting your abs.',
            'Avoid pulling on your neck — keep some space under your chin.',
            'Lower back down slowly under control.',
        ],
        tips: ['Don\'t pull on your neck', 'Focus on contracting your abs'],
    },
    {
        _id: '15', name: 'Dumbbell Fly', muscleGroup: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbell',
        description: 'Lie on a bench and open your arms wide with dumbbells.',
        image: IMG + 'Decline_Dumbbell_Flyes/0.jpg',
        videoUrl: yt('how to do dumbbell flyes'),
        instructions: [
            'Lie on a flat bench holding a dumbbell in each hand over your chest.',
            'Keep a slight bend in your elbows throughout the movement.',
            'Open your arms wide in an arc, lowering the weights out to the sides.',
            'Feel the stretch across your chest at the bottom.',
            'Bring the dumbbells back together over your chest, squeezing at the top.',
        ],
        tips: ['Slight bend in elbows', 'Squeeze at the top'],
    },
    {
        _id: '16', name: 'Hammer Curl', muscleGroup: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbell',
        description: 'Curl dumbbells with a neutral grip.',
        image: IMG + 'Cable_Hammer_Curls_-_Rope_Attachment/0.jpg',
        videoUrl: yt('how to do hammer curls'),
        instructions: [
            'Stand holding dumbbells with a neutral grip (palms facing each other).',
            'Keep your elbows pinned to your sides.',
            'Curl the weights up while maintaining the neutral grip.',
            'Squeeze your biceps at the top of the movement.',
            'Lower the dumbbells slowly under control.',
        ],
        tips: ['Keep elbows pinned to your sides', 'Control the tempo'],
    },
    {
        _id: '17', name: 'Skull Crushers', muscleGroup: 'Triceps', difficulty: 'Intermediate', equipment: 'Barbell',
        description: 'Lying tricep extension with EZ bar.',
        image: IMG + 'Lying_Triceps_Press/0.jpg',
        videoUrl: yt('how to do skull crushers'),
        instructions: [
            'Lie on a bench holding an EZ bar with a narrow grip over your chest.',
            'Keep your upper arms vertical and your elbows pointing forward.',
            'Bend at the elbows to lower the bar toward your forehead.',
            'Keep your upper arms still — only your forearms should move.',
            'Extend your elbows to press the bar back up to the start.',
        ],
        tips: ['Keep upper arms vertical', 'Lower to your forehead'],
    },
    {
        _id: '18', name: 'Burpees', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Bodyweight',
        description: 'Full body exercise combining a squat, push-up, and jump.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
        videoUrl: yt('how to do burpees'),
        instructions: [
            'Start standing, then squat down and place your hands on the floor.',
            'Kick your feet back into a plank/push-up position.',
            'Optionally perform a push-up at the bottom.',
            'Jump your feet back up toward your hands.',
            'Explode up into a jump with your arms overhead, then repeat.',
        ],
        tips: ['Keep a fast pace', 'Full extension on the jump'],
    },
    {
        _id: '19', name: 'Mountain Climbers', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Bodyweight',
        description: 'Alternate driving your knees to your chest in a plank position.',
        image: IMG + 'Mountain_Climbers/0.jpg',
        videoUrl: yt('how to do mountain climbers'),
        instructions: [
            'Start in a high plank with your hands under your shoulders.',
            'Keep your core tight and your hips low.',
            'Drive one knee toward your chest.',
            'Quickly switch legs, as if running in place.',
            'Maintain a steady, controlled rhythm throughout.',
        ],
        tips: ['Keep your hips low', 'Maintain a steady rhythm'],
    },
    {
        _id: '20', name: 'Romanian Deadlift', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell',
        description: 'Hinge at the hips with slight knee bend, lowering barbell along your legs.',
        image: IMG + 'Romanian_Deadlift/0.jpg',
        videoUrl: yt('how to do romanian deadlift'),
        instructions: [
            'Hold the bar at hip level with an overhand grip, feet hip-width apart.',
            'Keep a slight bend in your knees throughout the movement.',
            'Push your hips back and lower the bar along your legs.',
            'Go down until you feel a stretch in your hamstrings.',
            'Drive your hips forward to return to a tall standing position.',
        ],
        tips: ['Feel the stretch in your hamstrings', 'Keep the bar close to your legs'],
    },
];
