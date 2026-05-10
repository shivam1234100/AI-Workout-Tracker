export const MOCK_EXERCISES = [
    // --- CHEST ---
    {
        _id: '1',
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Lie on the bench with your eyes under the bar",
            "Grab the bar with a medium grip-width",
            "Unrack the bar by straightening your arms",
            "Lower the bar to your mid-chest",
            "Press the bar back up until your arms are straight"
        ],
        videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '2',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        equipment: 'Dumbbells',
        difficulty: 'Intermediate',
        instructions: [
            "Set bench to 30-45 degree incline",
            "Lift dumbbells to shoulder height",
            "Press weights up until arms are extended",
            "Lower with control through full range of motion",
        ],
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '3',
        name: 'Chest Flyes',
        muscleGroup: 'Chest',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        instructions: [
            "Lie on flat bench with dumbbells",
            "Extend arms above chest with slight bend in elbows",
            "Lower weights to sides in wide arc",
            "Bring weights back together at top"
        ],
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '4',
        name: 'Push-Ups',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            "Start in plank position",
            "Lower body until chest nearly touches floor",
            "Push back up to starting position",
            "Keep core tight throughout"
        ],
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
    },
    {
        _id: '5',
        name: 'Cable Crossovers',
        muscleGroup: 'Chest',
        equipment: 'Cable Machine',
        difficulty: 'Intermediate',
        instructions: [
            "Stand in center of cable machine",
            "Pull handles down and across body",
            "Squeeze chest at bottom of movement",
            "Return to start with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=2070&auto=format&fit=crop',
    },

    // --- BACK ---
    {
        _id: '6',
        name: 'Deadlift',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
            "Stand with mid-foot under the barbell",
            "Bend over and grab the bar with a shoulder-width grip",
            "Bend your knees until your shins touch the bar",
            "Lift your chest up and straighten your lower back",
            "Stand up with the weight, keeping the bar close to your body"
        ],
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2082&auto=format&fit=crop'
    },
    {
        _id: '7',
        name: 'Pull-Ups',
        muscleGroup: 'Back',
        equipment: 'Bar',
        difficulty: 'Intermediate',
        instructions: [
            "Grab bar with overhand grip",
            "Hang with arms fully extended",
            "Pull body up until chin clears bar",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '8',
        name: 'Barbell Rows',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Hinge at hips with bar in hands",
            "Keep back flat and core tight",
            "Pull bar to lower chest",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '9',
        name: 'Lat Pulldowns',
        muscleGroup: 'Back',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        instructions: [
            "Sit at lat pulldown machine",
            "Grab bar with wide overhand grip",
            "Pull bar down to upper chest",
            "Slowly return to start"
        ],
        image: 'https://images.unsplash.com/photo-1535743686920-55e4145369b9?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '10',
        name: 'Single Arm Dumbbell Row',
        muscleGroup: 'Back',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        instructions: [
            "Place one knee and hand on bench",
            "Hold dumbbell with free hand",
            "Pull dumbbell to hip",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
    },

    // --- LEGS ---
    {
        _id: '11',
        name: 'Barbell Squat',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Position bar on upper back",
            "Stand with feet shoulder-width apart",
            "Squat down keeping chest up",
            "Drive through heels to stand"
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '12',
        name: 'Leg Press',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        difficulty: 'Beginner',
        instructions: [
            "Sit in leg press machine",
            "Place feet shoulder-width on platform",
            "Lower platform until knees are 90 degrees",
            "Press back up without locking knees"
        ],
        image: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '13',
        name: 'Romanian Deadlift',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Hold barbell at hip height",
            "Hinge at hips, pushing them back",
            "Lower bar along legs to mid-shin",
            "Drive hips forward to return"
        ],
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2082&auto=format&fit=crop',
    },
    {
        _id: '14',
        name: 'Lunges',
        muscleGroup: 'Legs',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        instructions: [
            "Stand with dumbbells at sides",
            "Step forward into lunge",
            "Lower until both knees are 90 degrees",
            "Push back to standing"
        ],
        image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=2074&auto=format&fit=crop',
    },
    {
        _id: '15',
        name: 'Leg Extensions',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        difficulty: 'Beginner',
        instructions: [
            "Sit in leg extension machine",
            "Position pad above ankles",
            "Extend legs until straight",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '16',
        name: 'Calf Raises',
        muscleGroup: 'Legs',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            "Stand with balls of feet on edge",
            "Lower heels below platform",
            "Raise up onto toes as high as possible",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=2074&auto=format&fit=crop',
    },

    // --- SHOULDERS ---
    {
        _id: '17',
        name: 'Overhead Press',
        muscleGroup: 'Shoulders',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Stand with bar at shoulder level",
            "Brace core",
            "Press bar overhead until arms straight",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '18',
        name: 'Lateral Raises',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        instructions: [
            "Hold dumbbells at sides",
            "Raise arms out to shoulder height",
            "Pause briefly at top",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '19',
        name: 'Face Pulls',
        muscleGroup: 'Shoulders',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        instructions: [
            "Set cable at face height",
            "Pull rope toward face",
            "Squeeze rear delts",
            "Return with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '20',
        name: 'Front Raises',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        instructions: [
            "Hold dumbbells in front of thighs",
            "Raise arms forward to shoulder height",
            "Pause at top",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
    },

    // --- BICEPS ---
    {
        _id: '21',
        name: 'Barbell Curls',
        muscleGroup: 'Biceps',
        equipment: 'Barbell',
        difficulty: 'Beginner',
        instructions: [
            "Hold barbell with shoulder-width grip",
            "Keep elbows at sides",
            "Curl bar to shoulders",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '22',
        name: 'Hammer Curls',
        muscleGroup: 'Biceps',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        instructions: [
            "Hold dumbbells at sides, palms facing in",
            "Curl weights to shoulders",
            "Keep elbows pinned",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
    },

    // --- TRICEPS ---
    {
        _id: '23',
        name: 'Tricep Pushdowns',
        muscleGroup: 'Triceps',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        instructions: [
            "Stand at cable machine with bar attachment",
            "Keep elbows at sides",
            "Push bar down until arms straight",
            "Return slowly"
        ],
        image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '24',
        name: 'Skull Crushers',
        muscleGroup: 'Triceps',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Lie on bench holding bar overhead",
            "Lower bar toward forehead",
            "Keep elbows pointing up",
            "Extend arms back to start"
        ],
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '25',
        name: 'Dips',
        muscleGroup: 'Triceps',
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        instructions: [
            "Support body on parallel bars",
            "Lower until elbows are 90 degrees",
            "Press back up to straight arms",
            "Keep body upright for triceps focus"
        ],
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
    },

    // --- CORE ---
    {
        _id: '26',
        name: 'Plank',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            "Start in forearm plank position",
            "Keep body in straight line",
            "Engage core and glutes",
            "Hold for time"
        ],
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
    },
    {
        _id: '27',
        name: 'Crunches',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            "Lie on back with knees bent",
            "Place hands behind head",
            "Curl shoulders off the floor",
            "Lower with control"
        ],
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
    },

    // --- FULL BODY ---
    {
        _id: '101',
        name: 'Clean and Jerk',
        muscleGroup: 'Full Body',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
            "Pull bar from floor to shoulders explosively",
            "Drop into front squat catch",
            "Stand up fully",
            "Drive bar overhead with split jerk"
        ],
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2082&auto=format&fit=crop',
    },
    {
        _id: '102',
        name: 'Snatch',
        muscleGroup: 'Full Body',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
            "Wide grip on barbell",
            "Pull explosively from floor to overhead in one motion",
            "Catch in overhead squat",
            "Stand up"
        ],
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2082&auto=format&fit=crop',
    },
    {
        _id: '103',
        name: 'Muscle-Up',
        muscleGroup: 'Full Body',
        equipment: 'Bar',
        difficulty: 'Advanced',
        instructions: [
            "Hang from bar",
            "Explosive pull-up with hip drive",
            "Transition over the bar",
            "Press to full lockout"
        ],
        image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '104',
        name: 'Front Squat',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            "Rest bar on front of shoulders",
            "Keep elbows up high",
            "Squat down keeping torso upright",
            "Drive up through heels"
        ],
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop',
    },
    {
        _id: '105',
        name: 'Pistol Squat',
        muscleGroup: 'Legs',
        equipment: 'Bodyweight',
        difficulty: 'Advanced',
        instructions: [
            "Stand on one leg",
            "Extend other leg forward",
            "Squat down on standing leg",
            "Stand back up"
        ],
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop',
    },
];
