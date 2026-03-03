import express from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI — uses OPENAI_API_KEY from .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock_key',
});

// ─────────────────────────────────────────────
// HELPER: Build a user training profile from workout data
// This is the "secret sauce" — converts raw DB data into
// a structured text block that the LLM can reason about.
// ─────────────────────────────────────────────
function buildUserProfile(workouts: any[]): string {
    if (workouts.length === 0) {
        return "This is a new user with no workout history yet. Give general beginner-friendly advice.";
    }

    const totalWorkouts = workouts.length;
    const exerciseFrequency: Record<string, number> = {};
    const exercisePRs: Record<string, { weight: number; reps: number }> = {};
    const exerciseHistory: Record<string, { date: string; weight: number; reps: number }[]> = {};
    const recentWorkouts: string[] = [];
    let totalVolume = 0;

    for (const workout of workouts) {
        const workoutDate = new Date(workout.date).toLocaleDateString();
        const exerciseNames: string[] = [];

        for (const exercise of workout.exercises) {
            const sets = typeof exercise.sets === 'string' ? JSON.parse(exercise.sets) : exercise.sets;
            exerciseNames.push(exercise.name);

            // Track frequency
            exerciseFrequency[exercise.name] = (exerciseFrequency[exercise.name] || 0) + 1;

            for (const set of sets) {
                const weight = Number(set.weight) || 0;
                const reps = Number(set.reps) || 0;
                totalVolume += weight * reps;

                // Track PRs (max weight)
                if (!exercisePRs[exercise.name] || weight > exercisePRs[exercise.name].weight) {
                    exercisePRs[exercise.name] = { weight, reps };
                }

                // Track progression history
                if (!exerciseHistory[exercise.name]) exerciseHistory[exercise.name] = [];
                exerciseHistory[exercise.name].push({ date: workoutDate, weight, reps });
            }
        }

        // Summarize recent workouts (top 5)
        if (recentWorkouts.length < 5) {
            const duration = workout.startTime && workout.endTime
                ? `${Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000)} min`
                : 'N/A';
            recentWorkouts.push(`${workoutDate} — ${workout.name || 'Workout'} (${exerciseNames.join(', ')}) [${duration}]`);
        }
    }

    // Days since last workout
    const lastWorkoutDate = new Date(workouts[0].date);
    const daysSinceLastWorkout = Math.floor((Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

    // Top 5 exercises by frequency
    const topExercises = Object.entries(exerciseFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => `${name} (${count}x)`)
        .join(', ');

    // PRs formatted
    const prs = Object.entries(exercisePRs)
        .filter(([, pr]) => pr.weight > 0)
        .slice(0, 8)
        .map(([name, pr]) => `${name}: ${pr.weight}kg × ${pr.reps} reps`)
        .join('\n  ');

    // Detect progression trends for top exercises
    const trends: string[] = [];
    for (const [name, history] of Object.entries(exerciseHistory).slice(0, 3)) {
        if (history.length >= 2) {
            const recent = history[0].weight;
            const older = history[history.length - 1].weight;
            if (recent > older) trends.push(`${name}: ↑ improving (${older}kg → ${recent}kg)`);
            else if (recent < older) trends.push(`${name}: ↓ declining (${older}kg → ${recent}kg)`);
            else trends.push(`${name}: → consistent at ${recent}kg`);
        }
    }

    return `
- Total workouts logged: ${totalWorkouts}
- Days since last workout: ${daysSinceLastWorkout}
- Total volume lifted: ${totalVolume.toLocaleString()} kg
- Most trained exercises: ${topExercises}
- Personal Records:
  ${prs || 'No weight data recorded yet'}
- Progression Trends:
  ${trends.length > 0 ? trends.join('\n  ') : 'Not enough data yet'}
- Last 5 workouts:
  ${recentWorkouts.map(w => `• ${w}`).join('\n  ')}
`.trim();
}

// ─────────────────────────────────────────────
// HELPER: Generate offline fallback response
// Used when OpenAI API is unavailable — provides
// detailed, structured, actionable answers.
// ─────────────────────────────────────────────
function generateOfflineResponse(query: string, workouts: any[]): string {
    const lq = query.toLowerCase();

    // Build personal context from workouts
    let personalContext = '';
    let recentMuscles: string[] = [];
    if (workouts.length > 0) {
        const lastWorkout = workouts[0];
        const exerciseNames = lastWorkout.exercises?.map((e: any) => e.name) || [];
        recentMuscles = exerciseNames.map((n: string) => n.toLowerCase());
        const daysSince = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
        const totalWorkouts = workouts.length;
        personalContext = `\n\n📊 Based on your data: You've logged ${totalWorkouts} workout${totalWorkouts > 1 ? 's' : ''}. Your last session was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago and included ${exerciseNames.join(', ') || 'various exercises'}.`;

        // Add PR context if available
        const prs: string[] = [];
        for (const w of workouts.slice(0, 5)) {
            for (const ex of (w.exercises || [])) {
                const sets = typeof ex.sets === 'string' ? JSON.parse(ex.sets) : (ex.sets || []);
                for (const s of sets) {
                    if (Number(s.weight) > 0) {
                        prs.push(`${ex.name}: ${s.weight}kg × ${s.reps} reps`);
                    }
                }
            }
        }
        if (prs.length > 0) {
            personalContext += ` Recent lifts include: ${prs.slice(0, 4).join(', ')}.`;
        }
    }

    // ──── WEEKLY / WORKOUT PLAN ────
    if (lq.includes('weekly') || lq.includes('week plan') || lq.includes('workout plan') || lq.includes('split') || lq.includes('routine') || lq.includes('program') || lq.includes('schedule')) {
        return `Here's a well-balanced weekly workout plan:

📅 **Day 1 — Chest & Triceps**
• Flat Bench Press: 4×8-10
• Incline Dumbbell Press: 3×10-12
• Cable Flyes: 3×12-15
• Tricep Dips: 3×10-12
• Overhead Tricep Extension: 3×12

📅 **Day 2 — Back & Biceps**
• Deadlifts: 4×6-8
• Barbell Rows: 4×8-10
• Lat Pulldowns: 3×10-12
• Seated Cable Rows: 3×12
• Barbell Curls: 3×10-12
• Hammer Curls: 3×12

📅 **Day 3 — Rest / Active Recovery**
• Light walking, stretching, or yoga (20-30 min)

📅 **Day 4 — Shoulders & Abs**
• Overhead Press: 4×8-10
• Lateral Raises: 4×12-15
• Face Pulls: 3×15-20
• Rear Delt Flyes: 3×12-15
• Planks: 3×45-60 sec
• Cable Crunches: 3×15

📅 **Day 5 — Legs**
• Barbell Squats: 4×8-10
• Romanian Deadlifts: 3×10-12
• Leg Press: 3×12
• Walking Lunges: 3×12 each leg
• Calf Raises: 4×15-20

📅 **Day 6 — Full Body / Weak Points**
• Focus on lagging areas, lighter weights, higher reps

📅 **Day 7 — Rest**

💡 Rest 60-90 sec between sets. Increase weight by 2.5kg when you hit the top of the rep range for all sets.${personalContext}`;
    }

    // ──── CHEST ────
    if (lq.includes('chest') || lq.includes('bench') || lq.includes('push up') || lq.includes('pec')) {
        return `Here's a complete chest workout:

💪 **Chest Day**
1. **Flat Barbell Bench Press** — 4×6-8 reps (heavy compound, rest 2-3 min)
2. **Incline Dumbbell Press** — 3×8-12 reps (targets upper chest, 30-45° incline)
3. **Cable Flyes / Pec Deck** — 3×12-15 reps (squeeze at peak contraction for 1 sec)
4. **Dips (chest variation)** — 3×10-12 reps (lean forward slightly)
5. **Push-ups (finisher)** — 2 sets to failure

🔑 **Key tips:**
• Retract your shoulder blades on all pressing movements for a stable base
• Control the eccentric (lowering) for 2-3 seconds
• Don't bounce the bar off your chest — pause briefly at the bottom
• Warm up with 2-3 light sets before your working sets${personalContext}`;
    }

    // ──── BACK ────
    if (lq.includes('back') || lq.includes('pull') || lq.includes('row') || lq.includes('lat')) {
        return `Here's a complete back workout for width and thickness:

💪 **Back Day**
1. **Pull-ups / Weighted Pull-ups** — 4×6-10 reps (wider grip = more lats)
2. **Barbell Rows** — 4×8-10 reps (hinge at hips, pull to lower chest)
3. **Lat Pulldowns** — 3×10-12 reps (lean back slightly, pull to upper chest)
4. **Seated Cable Rows** — 3×10-12 reps (use a V-bar, squeeze shoulder blades)
5. **Single-Arm Dumbbell Rows** — 3×10-12 each arm (great for mind-muscle connection)
6. **Face Pulls** — 3×15-20 (for rear delts and posture)

🔑 **Key tips:**
• Think about "pulling with your elbows" rather than your hands
• Squeeze your shoulder blades together at the top of every rep
• Use straps if grip is limiting your back work
• Vary grip width to hit different parts of the back${personalContext}`;
    }

    // ──── LEGS ────
    if (lq.includes('leg') || lq.includes('squat') || lq.includes('lunge') || lq.includes('quad') || lq.includes('hamstring') || lq.includes('glute') || lq.includes('calf')) {
        return `Here's a complete leg day for balanced lower-body development:

🦵 **Leg Day**
1. **Barbell Back Squats** — 4×6-8 reps (king of leg exercises, go to parallel or below)
2. **Romanian Deadlifts** — 3×10-12 reps (targets hamstrings & glutes, keep slight knee bend)
3. **Leg Press** — 3×10-12 reps (foot placement changes emphasis — high/wide = glutes, low/narrow = quads)
4. **Walking Lunges** — 3×12 steps each leg (great for balance and stabilizers)
5. **Leg Curls** — 3×12-15 reps (isolate hamstrings)
6. **Calf Raises** — 4×15-20 reps (full stretch at bottom, squeeze at top)

🔑 **Key tips:**
• Drive through your heels on squats and leg press
• Keep your core braced throughout — use a belt for heavy sets
• Don't skip hamstrings! Imbalances lead to knee injuries
• Stretch your hip flexors and quads after the workout${personalContext}`;
    }

    // ──── SHOULDERS ────
    if (lq.includes('shoulder') || lq.includes('delt') || lq.includes('ohp') || lq.includes('overhead press')) {
        return `Here's a complete shoulder workout targeting all three heads:

🏋️ **Shoulder Day**
1. **Overhead Press (Barbell or Dumbbell)** — 4×6-8 reps (primary mass builder, rest 2-3 min)
2. **Lateral Raises** — 4×12-15 reps (slight lean forward, control the negative, don't swing)
3. **Face Pulls** — 3×15-20 reps (external rotation at top, great for rear delts & posture)
4. **Rear Delt Flyes** — 3×12-15 reps (chest on incline bench for strict form)
5. **Cable Lateral Raises** — 3×12-15 (constant tension through full range)
6. **Shrugs** — 3×12-15 reps (optional, for upper traps)

🔑 **Key tips:**
• Don't go too heavy on lateral raises — lighter weight with strict form works best
• Rear delts are commonly undertrained; hit them 2-3× per week
• Warm up your rotator cuff with band pull-aparts before pressing${personalContext}`;
    }

    // ──── ARMS ────
    if (lq.includes('arm') || lq.includes('bicep') || lq.includes('tricep') || lq.includes('curl')) {
        return `Here's a dedicated arm workout for both biceps and triceps:

💪 **Arm Day**
**Biceps:**
1. **Barbell Curls** — 3×8-10 reps (keep elbows pinned to sides)
2. **Incline Dumbbell Curls** — 3×10-12 (stretch at bottom, full range)
3. **Hammer Curls** — 3×10-12 (targets brachialis for arm thickness)
4. **Concentration Curls** — 2×12-15 (peak contraction hold for 1 sec)

**Triceps:**
1. **Close-Grip Bench Press** — 3×8-10 reps (elbows tucked)
2. **Overhead Tricep Extension** — 3×10-12 (deep stretch at bottom)
3. **Rope Pushdowns** — 3×12-15 (spread the rope at the bottom)
4. **Dips** — 2× to failure (keep torso upright for tricep focus)

🔑 **Key tips:**
• Triceps make up 2/3 of your arm size — don't neglect them
• Superset biceps and triceps for a great pump and time efficiency
• Control the weight — no swinging on curls
• Train arms 2× per week for best growth${personalContext}`;
    }

    // ──── ABS / CORE ────
    if (lq.includes('abs') || lq.includes('core') || lq.includes('six pack') || lq.includes('plank') || lq.includes('crunch')) {
        return `Here's an effective core workout you can do 3-4× per week:

🔥 **Core Workout**
1. **Hanging Leg Raises** — 3×12-15 reps (curl pelvis up, don't just swing legs)
2. **Cable Crunches** — 3×15-20 (focus on flexing the spine, not pulling with arms)
3. **Plank Hold** — 3×45-60 sec (squeeze glutes, don't let hips sag)
4. **Russian Twists** — 3×20 total reps (with a plate or dumbbell)
5. **Dead Bugs** — 3×12 each side (great for deep core stability)
6. **Ab Wheel Rollouts** — 3×8-12 (start from knees, progress to standing)

🔑 **Key tips:**
• Abs are revealed through low body fat (diet matters more than crunches!)
• Train abs with progressive overload just like any other muscle
• Don't do hundreds of reps — use resistance and focus on quality
• Include anti-rotation and anti-extension exercises for functional strength${personalContext}`;
    }

    // ──── NUTRITION / DIET ────
    if (lq.includes('nutrition') || lq.includes('diet') || lq.includes('eat') || lq.includes('food') || lq.includes('meal') || lq.includes('protein') || lq.includes('calorie') || lq.includes('macro')) {
        return `Here's a solid nutrition guide for training:

🥗 **Daily Nutrition Framework**

**Protein:** 1.6-2.2g per kg of bodyweight daily
• Sources: chicken breast, eggs, Greek yogurt, whey protein, fish, tofu, lentils
• Spread across 3-5 meals for optimal absorption

**Carbs:** 3-5g per kg bodyweight (adjust based on activity level)
• Pre-workout: oats, rice, banana (1-2 hrs before)
• Post-workout: fast-digesting carbs + protein within 1 hr

**Fats:** 0.8-1.2g per kg bodyweight
• Sources: olive oil, avocado, nuts, fatty fish

**Sample Meal Plan:**
• 🌅 Breakfast: 3 eggs + oats + banana (≈500 cal)
• 🥗 Lunch: Chicken breast + rice + veggies (≈600 cal)
• 🍎 Snack: Greek yogurt + mixed nuts + fruit (≈300 cal)
• 🏋️ Pre-workout: Banana + whey shake (≈250 cal)
• 🍗 Dinner: Salmon + sweet potato + salad (≈600 cal)
• 🌙 Before bed: Casein protein or cottage cheese (≈200 cal)

💡 **Key tips:**
• Track calories for 2-3 weeks to learn portion sizes
• Hydrate: aim for 3-4 litres of water daily
• For muscle gain: eat at a 300-500 calorie surplus
• For fat loss: eat at a 300-500 calorie deficit${personalContext}`;
    }

    // ──── WEIGHT LOSS / FAT LOSS ────
    if (lq.includes('weight loss') || lq.includes('fat loss') || lq.includes('lose weight') || lq.includes('burn fat') || lq.includes('cut') || lq.includes('lean') || lq.includes('slim')) {
        return `Here's a science-backed fat loss strategy:

🔥 **Fat Loss Fundamentals**

**1. Calorie Deficit (most important!)**
• Calculate your TDEE (Total Daily Energy Expenditure)
• Eat 300-500 calories below TDEE for sustainable fat loss
• Aim for 0.5-1 kg of weight loss per week

**2. Keep Protein High**
• 2.0-2.4g per kg bodyweight to preserve muscle mass
• High protein keeps you full and has a higher thermic effect

**3. Strength Training (don't stop lifting!)**
• Continue your normal training — this preserves muscle
• Reduce volume slightly if recovery suffers, but keep intensity

**4. Cardio**
• Add 2-3 sessions of 20-30 min moderate cardio (walking, cycling)
• Or 1-2 HIIT sessions per week (15-20 min)
• Don't overdo it — cardio is a tool, not the main driver

**5. Daily Habits**
• Get 7-9 hours of sleep (poor sleep increases hunger hormones)
• Walk 8,000-10,000 steps daily
• Reduce liquid calories (sodas, juices, fancy coffees)
• Eat more fiber (vegetables, whole grains) for satiety

⚠️ **Common mistakes:** Cutting calories too aggressively, doing excessive cardio, not eating enough protein, expecting linear progress. Weight fluctuates daily — track weekly averages instead.${personalContext}`;
    }

    // ──── MUSCLE GAIN / BULK ────
    if (lq.includes('muscle gain') || lq.includes('bulk') || lq.includes('gain weight') || lq.includes('build muscle') || lq.includes('mass') || lq.includes('bigger') || lq.includes('hypertrophy')) {
        return `Here's a complete muscle-building strategy:

💪 **Muscle Gain Blueprint**

**1. Calorie Surplus**
• Eat 300-500 calories above your maintenance (TDEE)
• Aim for 0.25-0.5 kg weight gain per week (more = too much fat)
• Track your weight weekly and adjust calories accordingly

**2. Protein Intake**
• 1.6-2.2g per kg bodyweight daily
• Distribute across 4-5 meals for best results
• Include a source of protein in every meal

**3. Training for Hypertrophy**
• Train each muscle group 2× per week
• 10-20 sets per muscle group per week (start at the lower end)
• Rep range: mostly 6-12 reps, some sets of 15-20 for variety
• Focus on progressive overload — add weight or reps each session
• Rest 60-120 seconds between sets

**4. Recovery**
• Sleep 7-9 hours per night (growth hormone peaks during deep sleep)
• Take 1-2 rest days per week
• Stay hydrated — 3-4 litres daily

**5. Key Compounds to Prioritize**
• Squats, Deadlifts, Bench Press, Overhead Press, Rows, Pull-ups
• These recruit the most muscle and allow the most progressive overload

📈 **Realistic expectations:** Beginners can gain ~1 kg muscle/month. Intermediates ~0.5 kg/month. Consistency over 6-12 months is what makes the difference.${personalContext}`;
    }

    // ──── REST / RECOVERY / SLEEP ────
    if (lq.includes('rest') || lq.includes('recover') || lq.includes('sleep') || lq.includes('overtraining') || lq.includes('sore') || lq.includes('tired')) {
        return `Here's what you need to know about recovery:

😴 **Recovery Guide**

**Sleep (most important recovery tool):**
• Aim for 7-9 hours per night
• Keep a consistent sleep schedule (even on weekends)
• Sleep in a cool, dark room
• Avoid screens 30-60 min before bed
• Growth hormone is released during deep sleep — this is when muscles repair

**Active Recovery:**
• Light walking (20-30 min) on rest days increases blood flow
• Foam rolling and stretching reduce stiffness
• Yoga or mobility work 1-2× per week

**Nutrition for Recovery:**
• Post-workout meal: protein + carbs within 1-2 hours
• Anti-inflammatory foods: berries, fatty fish, turmeric, leafy greens
• Stay hydrated — dehydration slows recovery significantly

**Signs You Need More Rest:**
• Persistent soreness lasting more than 3 days
• Declining performance (weights feeling heavier)
• Poor sleep, irritability, or lack of motivation
• Increased resting heart rate

💡 **General rule:** Wait 48-72 hours before training the same muscle group again. It's okay to train other muscles while one group recovers.${personalContext}`;
    }

    // ──── WARM UP / STRETCHING ────
    if (lq.includes('warm') || lq.includes('stretch') || lq.includes('mobility') || lq.includes('cool down') || lq.includes('flexible') || lq.includes('flexibility')) {
        return `Here's a proper warm-up and stretching routine:

🔥 **Pre-Workout Warm-Up (5-10 min)**
1. Light cardio: 3-5 min (brisk walk, jump rope, or cycling)
2. Dynamic stretches:
   • Arm circles — 15 each direction
   • Leg swings (front/back and side) — 10 each leg
   • Hip circles — 10 each direction
   • Bodyweight squats — 10 reps
   • Inchworms — 5 reps
3. Activation sets: 2 light sets of your first exercise (50-60% working weight)

🧘 **Post-Workout Stretching (5-10 min)**
Hold each stretch for 20-30 seconds:
• Chest doorway stretch
• Lat stretch (hang from bar)
• Hip flexor stretch (half-kneeling)
• Hamstring stretch (standing toe touch)
• Quad stretch (standing or lying)
• Shoulder cross-body stretch

⚠️ **Important:** Do dynamic stretches BEFORE training and static stretches AFTER. Static stretching before lifting can temporarily reduce strength output.${personalContext}`;
    }

    // ──── CARDIO ────
    if (lq.includes('cardio') || lq.includes('running') || lq.includes('run') || lq.includes('endurance') || lq.includes('stamina') || lq.includes('treadmill') || lq.includes('cycling')) {
        return `Here's how to program cardio effectively:

🏃 **Cardio Guide**

**For General Health (minimum):**
• 150 min moderate intensity per week (e.g., 30 min × 5 days brisk walking)
• OR 75 min vigorous intensity per week

**For Fat Loss (alongside strength training):**
• 2-3 sessions of 20-30 min Low Intensity Steady State (LISS) — walking, cycling
• OR 1-2 sessions of HIIT (more time-efficient)
• Walking 8,000-10,000 steps daily is the easiest cardio you can do

**For Endurance / Running:**
• Week 1-2: 20 min jog/walk intervals (jog 2 min, walk 1 min)
• Week 3-4: 25 min with longer jog intervals
• Week 5+: Build to continuous 30-min runs
• Increase distance by no more than 10% per week to avoid injury

**Cardio Without Losing Muscle:**
• Keep sessions under 30-45 min
• Do cardio on separate days from legs if possible
• Eat enough calories and protein
• Low-impact options are best: cycling, swimming, incline walking

💡 **Tip:** Incline treadmill walking (10-15% incline, 5-6 km/h) is one of the best fat-burning options that won't impact your recovery.${personalContext}`;
    }

    // ──── HIIT ────
    if (lq.includes('hiit') || lq.includes('interval') || lq.includes('tabata') || lq.includes('circuit')) {
        return `Here's a complete HIIT workout you can do anywhere:

⚡ **HIIT Workout (20 minutes)**

**Warm-up:** 3 min light jog or jumping jacks

**Circuit — 4 rounds, 40 sec work / 20 sec rest:**
1. Burpees
2. Mountain Climbers
3. Jump Squats
4. Push-ups
5. High Knees
6. Plank to Push-up

**Cool-down:** 3 min walking + stretching

**Alternative Treadmill HIIT:**
• Sprint 30 sec → Walk 60 sec → Repeat 8-10 times

🔑 **HIIT tips:**
• Limit to 2-3 sessions per week max (high CNS demand)
• Go at true max effort during work intervals
• Don't do HIIT on the same day as heavy leg training
• Great for fat loss — burns calories for hours after (EPOC effect)
• Beginners: start with 20 sec work / 40 sec rest${personalContext}`;
    }

    // ──── FORM / TECHNIQUE ────
    if (lq.includes('form') || lq.includes('technique') || lq.includes('correct') || lq.includes('how to do') || lq.includes('proper')) {
        return `Here are key form tips for the major lifts:

📐 **Form Guide for Major Lifts**

**Bench Press:**
• Retract shoulder blades and arch slightly
• Grip slightly wider than shoulder width
• Lower to mid-chest, touch lightly, then press up
• Feet flat on floor, drive through legs

**Squat:**
• Bar on upper traps (high bar) or rear delts (low bar)
• Feet shoulder-width, toes slightly out
• Break at hips and knees simultaneously
• Go to parallel or below — "depth is king"
• Keep chest up and core braced

**Deadlift:**
• Bar over mid-foot, shoulder-width grip
• Hinge at hips, keep back flat (neutral spine)
• Drive through heels, squeeze glutes at lockout
• Don't round your lower back — ever

**Overhead Press:**
• Grip just outside shoulders, elbows slightly in front of bar
• Press straight up, move head through at the top
• Squeeze glutes and brace core for stability

⚠️ **General rules:**
• Start light and master the movement pattern first
• Film yourself from the side to check your form
• If something hurts (sharp pain), stop immediately
• Controlled tempo: 2 sec down, 1 sec up${personalContext}`;
    }

    // ──── BEGINNER ────
    if (lq.includes('beginner') || lq.includes('start') || lq.includes('new to') || lq.includes('first time') || lq.includes('getting started') || lq.includes('noob')) {
        return `Welcome! Here's your beginner's guide to start training:

🎯 **Beginner Training Plan (3 days/week)**

**Workout A (Mon):**
• Barbell Squats: 3×8
• Bench Press: 3×8
• Barbell Rows: 3×8
• Plank: 3×30 sec

**Workout B (Wed):**
• Deadlifts: 3×5
• Overhead Press: 3×8
• Lat Pulldowns: 3×10
• Dumbbell Lunges: 3×10 each leg

**Workout C (Fri):**
• Goblet Squats: 3×10
• Dumbbell Bench Press: 3×10
• Cable Rows: 3×10
• Leg Curls: 3×12

**Beginner tips:**
• Focus on learning proper form before adding weight
• Increase weight by 2.5kg each session when you complete all sets/reps
• Rest 2-3 min between compound lifts, 60-90 sec for isolation
• Eat enough protein (1.6g per kg bodyweight)
• Track your workouts (you're already doing this! 💪)
• Stay consistent — the first 3 months show the fastest gains
• Soreness is normal; sharp pain is not${personalContext}`;
    }

    // ──── PROGRESS / PLATEAU ────
    if (lq.includes('plateau') || lq.includes('stuck') || lq.includes('not progressing') || lq.includes('stall') || lq.includes('improve') || lq.includes('progress') || lq.includes('stronger')) {
        return `Here's how to break through a training plateau:

📈 **Beating Plateaus**

**1. Adjust Your Training Variables:**
• Change rep ranges (if doing 3×5, try 4×8 for a few weeks)
• Add more sets per muscle group (weekly volume)
• Try different exercises that target the same muscles
• Use intensity techniques: drop sets, pause reps, tempo training

**2. Improve Recovery:**
• Are you sleeping 7-9 hours? (This is #1)
• Are you eating enough? Under-eating stalls progress
• Are you taking deload weeks? (1 light week every 4-6 weeks)
• Manage stress — cortisol hinders muscle growth

**3. Progressive Overload Strategies:**
• Micro-load: add just 1.25kg per side
• Add 1 extra rep per set each week
• Add 1 extra set per exercise
• Improve range of motion
• Reduce rest periods slightly

**4. Nutrition Check:**
• Increase daily calories by 200-300 if weight is stagnant
• Ensure protein is at 2g/kg bodyweight
• Time carbs around your workout

💡 **Remember:** Plateaus are normal and happen to everyone. They usually mean your body has adapted — it's time to change the stimulus, not give up.${personalContext}`;
    }

    // ──── MOTIVATION ────
    if (lq.includes('motivation') || lq.includes('motivat') || lq.includes('consistency') || lq.includes('discipline') || lq.includes('give up') || lq.includes('quit') || lq.includes('lazy')) {
        return `Here's how to stay consistent with your training:

🔥 **Staying Motivated & Consistent**

**1. Don't rely on motivation — build habits:**
• Train at the same time every day
• Lay out your gym clothes the night before
• "Just show up" — a mediocre workout beats no workout

**2. Set measurable goals:**
• "Bench 80kg by June" beats "get stronger"
• Write them down and track progress weekly
• Celebrate small wins along the way

**3. Make it enjoyable:**
• Train with a partner if possible
• Listen to music or podcasts you love
• Do exercises you actually enjoy
• Vary your routine to avoid boredom

**4. Track everything (you're already doing this!):**
• Seeing your numbers go up is the best motivator
• Take progress photos monthly
• Review your workout history when you feel unmotivated

**5. Manage expectations:**
• Results take 8-12 weeks to become visible
• Progress isn't linear — there will be bad days
• Comparing yourself to others is counterproductive
• The best program is the one you stick to

💪 "The only bad workout is the one that didn't happen." You've already taken the first step by tracking your fitness. Keep going!${personalContext}`;
    }

    // ──── SUPPLEMENTS ────
    if (lq.includes('supplement') || lq.includes('creatine') || lq.includes('protein powder') || lq.includes('pre-workout') || lq.includes('preworkout') || lq.includes('bcaa') || lq.includes('whey')) {
        return `Here's an evidence-based guide to supplements:

💊 **Supplement Guide (ranked by effectiveness)**

**Tier 1 — Actually Works:**
• **Creatine Monohydrate** — 5g/day, every day. Increases strength, power, and muscle. Most studied supplement ever. Safe and cheap.
• **Whey Protein** — Convenient way to hit daily protein goals. 1-2 scoops/day as needed.
• **Caffeine** — 150-300mg pre-workout for energy and performance. (Coffee works too!)

**Tier 2 — Helpful But Not Essential:**
• **Vitamin D** — Especially if you don't get much sunlight. 2000-5000 IU/day.
• **Omega-3 Fish Oil** — 1-2g/day for joint health and inflammation.
• **Magnesium** — Helps sleep and recovery. 200-400mg before bed.

**Tier 3 — Mostly Marketing:**
• BCAAs — Unnecessary if you eat enough protein
• Fat burners — Just caffeine in an expensive package
• Testosterone boosters — Don't work as advertised
• Most pre-workout "proprietary blends" — underdosed ingredients

⚠️ **Important:** No supplement replaces good nutrition, sleep, and consistent training. Get the basics right first!${personalContext}`;
    }

    // ──── WHAT TO TRAIN TODAY ────
    if (lq.includes('today') || lq.includes('what should') || lq.includes('suggest') || lq.includes('recommend')) {
        let suggestion = '';
        if (recentMuscles.some(m => m.includes('chest') || m.includes('bench') || m.includes('press'))) {
            suggestion = `Since you recently trained chest/pressing movements, I'd suggest focusing on **Back & Biceps** today:\n\n`;
            suggestion += `1. Pull-ups or Lat Pulldowns: 4×8-10\n2. Barbell Rows: 4×8-10\n3. Seated Cable Rows: 3×12\n4. Face Pulls: 3×15\n5. Barbell Curls: 3×10\n6. Hammer Curls: 3×12`;
        } else if (recentMuscles.some(m => m.includes('squat') || m.includes('leg') || m.includes('deadlift'))) {
            suggestion = `Since you recently trained legs, I'd suggest an **Upper Body Push** day:\n\n`;
            suggestion += `1. Bench Press: 4×8-10\n2. Overhead Press: 3×8-10\n3. Incline DB Press: 3×10-12\n4. Lateral Raises: 4×12-15\n5. Tricep Pushdowns: 3×12\n6. Overhead Tricep Extension: 3×12`;
        } else if (recentMuscles.some(m => m.includes('back') || m.includes('row') || m.includes('pull'))) {
            suggestion = `Since you recently trained back, I'd suggest a **Legs** day:\n\n`;
            suggestion += `1. Barbell Squats: 4×8-10\n2. Romanian Deadlifts: 3×10-12\n3. Leg Press: 3×12\n4. Walking Lunges: 3×12 each\n5. Leg Curls: 3×12-15\n6. Calf Raises: 4×15-20`;
        } else {
            suggestion = `Here's a great **Full Body** workout for today:\n\n`;
            suggestion += `1. Barbell Squats: 3×8\n2. Bench Press: 3×8\n3. Barbell Rows: 3×10\n4. Overhead Press: 3×8\n5. Romanian Deadlifts: 3×10\n6. Plank: 3×45 sec`;
        }
        return `${suggestion}\n\n💡 Rest 90-120 sec between compound lifts, 60 sec for isolation exercises. Focus on progressive overload — try to beat your last session's numbers!${personalContext}`;
    }

    // ──── GENERAL GREETING / HELLO ────
    if (lq.includes('hello') || lq.includes('hi') || lq.includes('hey') || lq.match(/^(yo|sup|what's up)/)) {
        return `Hey there! 👋 I'm your AI Coach. Here's what I can help you with:

• 📋 **Workout Plans** — "Give me a weekly workout plan" or "What should I train today?"
• 💪 **Exercise Guidance** — "How to do bench press with proper form?"
• 🥗 **Nutrition Advice** — "How much protein should I eat?" or "Give me a meal plan"
• 📈 **Progress Tips** — "How do I break through a plateau?"
• 🔥 **Fat Loss / Muscle Gain** — "How to lose weight?" or "How to build muscle?"
• 😴 **Recovery** — "How much rest do I need?"
• 💊 **Supplements** — "What supplements actually work?"

Just ask me anything about training, nutrition, or your progress!${personalContext}`;
    }

    // ──── THANK YOU ────
    if (lq.includes('thank') || lq.includes('thanks') || lq.includes('appreciated')) {
        return `You're welcome! 💪 Keep training hard and stay consistent. I'm always here whenever you need workout advice, nutrition tips, or help with your training plan. Let's keep making progress together! 🎯${personalContext}`;
    }

    // ──── DEFAULT FALLBACK — more helpful than before ────
    return `Great question! Here's some general guidance:

💡 **Key Training Principles:**
1. **Progressive Overload** — Gradually increase weight, reps, or sets each session
2. **Consistency** — Train 3-5× per week and stick with it for months
3. **Proper Form** — Quality reps beat heavy ego lifts every time
4. **Recovery** — Sleep 7-9 hours and eat enough protein (1.6-2.2g/kg)
5. **Patience** — Real results take 8-12 weeks to become visible

You can ask me about specific topics like:
• "Give me a weekly workout plan"
• "How to train chest/back/legs/shoulders/arms"
• "What should I eat to build muscle?"
• "How to lose weight effectively"
• "How to warm up properly"
• "What supplements should I take?"

Feel free to ask anything specific and I'll give you a detailed answer! 🏋️${personalContext}`;
}

// ═════════════════════════════════════════════
// POST /ai/chat — Send message, get personalized AI response
// ═════════════════════════════════════════════
router.post('/chat', authenticateToken, async (req: any, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || typeof message !== 'string') {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // 1. Fetch user's workout history (last 20 workouts)
        const workouts = await prisma.workout.findMany({
            where: { userId },
            include: { exercises: true },
            orderBy: { date: 'desc' },
            take: 20,
        });

        // 2. Build the user training profile
        const userProfile = buildUserProfile(workouts);

        // 3. Fetch recent chat history for conversation context (last 20 messages)
        const chatHistory = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            take: 20,
        });

        // 4. Save the user's message to DB
        await prisma.chatMessage.create({
            data: { role: 'user', content: message, userId },
        });

        // 5. Build the personalized system prompt
        const systemPrompt = `You are a personalized AI fitness coach named "AI Coach". You have access to this specific user's real workout data. Use it to give specific, data-driven, personalized advice.

USER'S TRAINING PROFILE:
${userProfile}

INSTRUCTIONS:
- Reference their actual exercises, weights, and rep counts when relevant
- Notice and comment on trends (improving/plateauing/declining performance)
- Suggest progressive overload based on their recent numbers (e.g., "try 72.5kg next time")
- Be encouraging, supportive, but data-driven
- If they ask what to train, consider what they trained recently and suggest something different
- Keep responses concise (2-4 paragraphs max) and actionable
- Use emojis sparingly for a friendly tone
- If they have no workout data, give general beginner-friendly advice and encourage them to log their first workout`;

        // 6. Build messages array for OpenAI
        const openaiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
            { role: 'user', content: message },
        ];

        let assistantContent: string;

        try {
            // 7. Call OpenAI
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: openaiMessages,
                max_tokens: 500,
                temperature: 0.7,
            });

            assistantContent = completion.choices[0].message.content || "I couldn't generate a response. Please try again!";
        } catch (aiError: any) {
            console.log('OpenAI API error, using offline fallback:', aiError.message);
            // Fallback to offline response
            assistantContent = generateOfflineResponse(message, workouts);
        }

        // 8. Save the assistant's response to DB
        await prisma.chatMessage.create({
            data: { role: 'assistant', content: assistantContent, userId },
        });

        res.json({ response: assistantContent });
    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// ═════════════════════════════════════════════
// GET /ai/history — Fetch chat history
// ═════════════════════════════════════════════
router.get('/history', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const messages = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        res.json(messages);
    } catch (error: any) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// ═════════════════════════════════════════════
// DELETE /ai/history — Clear all chat history
// ═════════════════════════════════════════════
router.delete('/history', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        await prisma.chatMessage.deleteMany({
            where: { userId },
        });

        res.json({ message: 'Chat history cleared' });
    } catch (error: any) {
        console.error('History clear error:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

export default router;
