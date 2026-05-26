import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon, ArrowLeft, Sparkles, ChevronDown, Dumbbell, Flame, Footprints, UtensilsCrossed, TrendingUp, Moon, Heart, Activity, Zap, Target, HelpCircle, Stethoscope } from 'lucide-react-native';
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useHealthStore } from '../store/healthStore';
import { useMedicalStore } from '../store/medicalStore';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import { useTheme, accent, shadows } from '../context/ThemeContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
}

interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
    messages: Message[];
}

// ─── AI Model Definitions ───
interface AIModel {
    id: string;
    name: string;
    provider: string;
    color: string;
    description: string;
}

const AI_MODELS: AIModel[] = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: '#10a37f', description: 'Most capable' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', color: '#10a37f', description: 'Fast & smart' },
    { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', color: '#d97757', description: 'Thoughtful' },
    { id: 'gemini-flash', name: 'Gemini Flash', provider: 'Google', color: '#4285f4', description: 'Lightning fast' },
    { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', color: '#5b6ee1', description: 'Open source' },
];

// ─── Quick Prompt Suggestions ───
interface QuickPrompt {
    label: string;
    message: string;
    icon: string;
    color: string;
    category: 'workout' | 'nutrition' | 'health' | 'progress';
}

const QUICK_PROMPTS: QuickPrompt[] = [
    { label: "Today's workout", message: 'What should I train today?', icon: 'dumbbell', color: '#6366f1', category: 'workout' },
    { label: 'Weekly plan', message: 'Give me a full weekly workout plan', icon: 'target', color: '#8b5cf6', category: 'workout' },
    { label: 'Burn fat', message: 'How can I lose weight and burn fat effectively?', icon: 'flame', color: '#ef4444', category: 'workout' },
    { label: 'Build muscle', message: 'How do I build muscle and gain mass?', icon: 'zap', color: '#f59e0b', category: 'workout' },
    { label: 'My calories', message: 'How many calories should I eat today?', icon: 'activity', color: '#10b981', category: 'nutrition' },
    { label: 'Meal plan', message: 'Give me a healthy meal plan for the day', icon: 'utensils', color: '#14b8a6', category: 'nutrition' },
    { label: 'My steps', message: 'How are my steps looking today?', icon: 'footprints', color: '#3b82f6', category: 'health' },
    { label: 'My progress', message: 'Show me my overall progress and stats', icon: 'trending', color: '#06b6d4', category: 'progress' },
    { label: 'Recovery tips', message: 'Am I getting enough rest and recovery?', icon: 'moon', color: '#a78bfa', category: 'health' },
    { label: 'My injuries', message: 'What are my medical conditions and how do they affect my training?', icon: 'stethoscope', color: '#f43f5e', category: 'health' },
    { label: 'Chest workout', message: 'Give me a complete chest workout', icon: 'dumbbell', color: '#ec4899', category: 'workout' },
    { label: 'Leg day', message: 'Give me a killer leg day workout', icon: 'zap', color: '#f97316', category: 'workout' },
];

const getPromptIcon = (icon: string, color: string, size: number = 14) => {
    switch (icon) {
        case 'dumbbell': return <Dumbbell size={size} color={color} />;
        case 'flame': return <Flame size={size} color={color} />;
        case 'footprints': return <Footprints size={size} color={color} />;
        case 'utensils': return <UtensilsCrossed size={size} color={color} />;
        case 'trending': return <TrendingUp size={size} color={color} />;
        case 'moon': return <Moon size={size} color={color} />;
        case 'heart': return <Heart size={size} color={color} />;
        case 'activity': return <Activity size={size} color={color} />;
        case 'zap': return <Zap size={size} color={color} />;
        case 'target': return <Target size={size} color={color} />;
        case 'stethoscope': return <Stethoscope size={size} color={color} />;
        default: return <HelpCircle size={size} color={color} />;
    }
};

// ─── Build full user context for AI ───
function buildUserContext(workoutHistory: any[], user: any) {
    const health = useHealthStore.getState();
    const medical = useMedicalStore.getState();
    const parts: string[] = [];

    // Profile
    if (user) {
        const profileBits: string[] = [];
        if (user.name) profileBits.push(`Name: ${user.name}`);
        if (user.weight) profileBits.push(`Weight: ${user.weight}kg`);
        if (user.height) profileBits.push(`Height: ${user.height}cm`);
        if (user.gender) profileBits.push(`Gender: ${user.gender}`);
        if (user.weight && user.height) {
            const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
            profileBits.push(`BMI: ${bmi}`);
            const isMale = user.gender?.toLowerCase() !== 'female';
            const bmr = isMale
                ? Math.round(10 * user.weight + 6.25 * user.height - 5 * 25 + 5)
                : Math.round(10 * user.weight + 6.25 * user.height - 5 * 25 - 161);
            profileBits.push(`BMR: ${bmr} kcal/day`);
            profileBits.push(`Maintenance: ~${Math.round(bmr * 1.55)} kcal/day`);
            profileBits.push(`Protein target: ${Math.round(user.weight * 1.6)}-${Math.round(user.weight * 2.2)}g/day`);
        }
        if (profileBits.length > 0) parts.push(`📋 Profile: ${profileBits.join(' | ')}`);
    }

    // Health data
    parts.push(`🚶 Steps today: ${health.todaySteps.toLocaleString()} / ${health.stepGoal.toLocaleString()} goal`);
    parts.push(`🔥 Active calories: ${health.todayCalories.active} kcal (goal: ${health.calorieGoal})`);
    parts.push(`⏱ Exercise: ${health.todayCalories.exercise} min (goal: ${health.exerciseGoal} min)`);
    const avgSteps7 = health.getAverageSteps(7);
    if (avgSteps7 > 0) parts.push(`📊 7-day avg steps: ${avgSteps7.toLocaleString()}`);
    const avgCal7 = health.getAverageCalories(7);
    if (avgCal7 > 0) parts.push(`📊 7-day avg active calories: ${avgCal7}`);

    // Workout stats
    const totalWorkouts = workoutHistory.length;
    if (totalWorkouts > 0) {
        parts.push(`💪 Total workouts: ${totalWorkouts}`);
        const last = workoutHistory[0];
        const names = last.exercises?.map((e: any) => e.name).join(', ') || 'exercises';
        const days = Math.floor((Date.now() - new Date(last.endTime || last.date).getTime()) / 86400000);
        parts.push(`🕐 Last workout: ${days} day${days !== 1 ? 's' : ''} ago (${names})`);

        // PRs
        const prs: Record<string, { weight: number; reps: number }> = {};
        for (const w of workoutHistory.slice(0, 10)) {
            for (const ex of (w.exercises || [])) {
                const sets = Array.isArray(ex.sets) ? ex.sets : [];
                for (const s of sets) {
                    const wt = Number(s.weight) || 0;
                    if (wt > 0 && (!prs[ex.name] || wt > prs[ex.name].weight)) {
                        prs[ex.name] = { weight: wt, reps: Number(s.reps) || 0 };
                    }
                }
            }
        }
        const prList = Object.entries(prs).slice(0, 5).map(([n, p]) => `${n}: ${p.weight}kg × ${p.reps}`);
        if (prList.length > 0) parts.push(`🏆 PRs: ${prList.join(', ')}`);

        // Volume
        const totalVolume = workoutHistory.reduce((acc: number, w: any) =>
            acc + (w.exercises?.reduce((a: number, e: any) =>
                a + (Array.isArray(e.sets) ? e.sets.reduce((s: number, set: any) => s + ((set.weight || 0) * (set.reps || 0)), 0) : 0), 0) || 0), 0);
        if (totalVolume > 0) parts.push(`📈 Total volume: ${Math.round(totalVolume).toLocaleString()} kg`);

        // Streak
        const daySet = new Set(workoutHistory.map((w: any) => new Date(w.date || w.endTime).toDateString()));
        let streak = 0;
        const cur = new Date();
        while (daySet.has(cur.toDateString())) { streak++; cur.setDate(cur.getDate() - 1); }
        if (streak > 0) parts.push(`🔥 Current streak: ${streak} day${streak > 1 ? 's' : ''}`);

        // Recent workouts
        const recent = workoutHistory.slice(0, 3).map((w: any) => {
            const d = new Date(w.date || w.endTime).toLocaleDateString();
            const exNames = w.exercises?.map((e: any) => e.name).join(', ') || 'exercises';
            return `${d}: ${w.name || 'Workout'} (${exNames})`;
        });
        parts.push(`📝 Recent: ${recent.join(' | ')}`);
    } else {
        parts.push('💪 No workouts logged yet — new user');
    }

    // Medical conditions & injuries
    if (medical.conditions.length > 0) {
        const injuries = medical.conditions.filter(c => c.type === 'injury').map(c => c.text);
        const conditions = medical.conditions.filter(c => c.type === 'condition').map(c => c.text);
        const allergies = medical.conditions.filter(c => c.type === 'allergy').map(c => c.text);
        const other = medical.conditions.filter(c => c.type === 'other').map(c => c.text);

        const medParts: string[] = [];
        if (injuries.length > 0) medParts.push(`Injuries: ${injuries.join(', ')}`);
        if (conditions.length > 0) medParts.push(`Health conditions: ${conditions.join(', ')}`);
        if (allergies.length > 0) medParts.push(`Allergies: ${allergies.join(', ')}`);
        if (other.length > 0) medParts.push(`Other: ${other.join(', ')}`);

        parts.push(`⚠️ Medical: ${medParts.join(' | ')}`);
    }
    if (medical.additionalNotes.trim()) {
        parts.push(`📝 Medical notes: ${medical.additionalNotes.trim()}`);
    }

    return parts.join('\n');
}

// ─── Offline fallback with full context ───
function generateOfflineResponse(query: string, workoutHistory: any[], user: any): string {
    const lq = query.toLowerCase();
    const health = useHealthStore.getState();
    const medical = useMedicalStore.getState();

    // Categorize medical conditions
    const injuries = medical.conditions.filter(c => c.type === 'injury');
    const healthConditions = medical.conditions.filter(c => c.type === 'condition');
    const allergies = medical.conditions.filter(c => c.type === 'allergy');
    const otherMed = medical.conditions.filter(c => c.type === 'other');
    const hasMedical = medical.conditions.length > 0;

    // Build dynamic medical summary block
    const buildMedicalBlock = (): string => {
        if (!hasMedical) return '';
        const parts: string[] = ['\n\n⚠️ Based on your medical profile:'];
        if (injuries.length > 0) {
            parts.push(`🩹 **Injuries:** ${injuries.map(c => c.text).join(', ')}`);
            injuries.forEach(inj => {
                const il = inj.text.toLowerCase();
                if (il.includes('knee') || il.includes('acl') || il.includes('mcl') || il.includes('meniscus'))
                    parts.push('   → Avoid: deep squats, leg extensions, high-impact jumping. Try: wall sits, leg press (limited ROM), swimming, upper body focus');
                else if (il.includes('back') || il.includes('spine') || il.includes('disc') || il.includes('sciatica'))
                    parts.push('   → Avoid: heavy deadlifts, barbell rows (bent over), sit-ups. Try: bird dogs, planks, McGill curl-ups, cable rows (upright)');
                else if (il.includes('shoulder') || il.includes('rotator'))
                    parts.push('   → Avoid: behind-the-neck press, upright rows, heavy overhead. Try: lateral raises (light), face pulls, external rotations, chest-supported rows');
                else if (il.includes('wrist') || il.includes('hand') || il.includes('grip'))
                    parts.push('   → Avoid: heavy gripping, barbell curls. Try: straps for pulling, machines, EZ-bar, open-palm exercises');
                else if (il.includes('ankle') || il.includes('foot'))
                    parts.push('   → Avoid: running, box jumps, heavy calf raises. Try: swimming, cycling, seated exercises, upper body focus');
                else if (il.includes('hip') || il.includes('groin'))
                    parts.push('   → Avoid: wide-stance squats, sumo deadlifts, lunges. Try: hip abduction (light), glute bridges, swimming');
                else if (il.includes('elbow') || il.includes('tennis') || il.includes('golfer'))
                    parts.push('   → Avoid: heavy curls, skull crushers, grip-intensive lifts. Try: wrist stretches, eccentric exercises, bands');
                else if (il.includes('neck') || il.includes('cervical'))
                    parts.push('   → Avoid: shrugs, overhead press, neck bridges. Try: gentle mobility, isometric holds, chin tucks');
                else
                    parts.push(`   → Take it easy around the affected area. Modify or skip exercises that cause pain.`);
            });
        }
        if (healthConditions.length > 0) {
            parts.push(`🏥 **Health conditions:** ${healthConditions.map(c => c.text).join(', ')}`);
            healthConditions.forEach(cond => {
                const cl = cond.text.toLowerCase();
                if (cl.includes('asthma') || cl.includes('breathing'))
                    parts.push('   → Keep an inhaler nearby. Warm up 10+ min. Avoid very cold environments. Lower intensity if breathing is labored.');
                else if (cl.includes('diabetes') || cl.includes('sugar') || cl.includes('insulin'))
                    parts.push('   → Monitor blood sugar before/after workouts. Carry fast-acting carbs. Avoid training on empty stomach.');
                else if (cl.includes('blood pressure') || cl.includes('hypertension') || cl.includes('bp'))
                    parts.push('   → Avoid heavy isometric holds and Valsalva maneuver. Keep intensity moderate. Focus on steady cardio and lighter weights with higher reps.');
                else if (cl.includes('heart') || cl.includes('cardiac') || cl.includes('arrhythmia'))
                    parts.push('   → Stick to low-moderate intensity. Monitor heart rate. Avoid maximal efforts. Get clearance from your cardiologist.');
                else if (cl.includes('arthritis') || cl.includes('joint'))
                    parts.push('   → Warm up thoroughly. Use lighter weights with more reps. Swimming and cycling are joint-friendly. Avoid ballistic movements.');
                else if (cl.includes('thyroid'))
                    parts.push('   → Energy levels may vary. Listen to your body. Consistent moderate exercise helps manage symptoms.');
                else
                    parts.push('   → Always consult your doctor about exercise intensity and any new activities.');
            });
        }
        if (allergies.length > 0) {
            parts.push(`⚡ **Allergies/Intolerances:** ${allergies.map(c => c.text).join(', ')}`);
            parts.push('   → I\'ll avoid recommending foods/supplements that conflict with these.');
        }
        if (otherMed.length > 0) {
            parts.push(`📋 **Other:** ${otherMed.map(c => c.text).join(', ')}`);
        }
        if (medical.additionalNotes.trim()) {
            parts.push(`📝 **Your notes:** ${medical.additionalNotes.trim()}`);
        }
        parts.push('\n⚕️ Always consult your healthcare provider before starting or modifying your exercise program.');
        return parts.join('\n');
    };

    // Helper: compute BMR
    const getBmr = () => user?.weight && user?.height
        ? Math.round(10 * user.weight + 6.25 * user.height - 5 * 25 + (user.gender?.toLowerCase() === 'female' ? -161 : 5))
        : 1700;

    // ── MEDICAL / INJURY / HEALTH CONDITION QUERIES ──
    if (lq.includes('medical') || lq.includes('condition') || lq.includes('injury') || lq.includes('injuries') || lq.includes('health issue') || lq.includes('allerg') || lq.includes('pain') || lq.includes('hurt') || lq.includes('problem') || lq.includes('disease') || lq.includes('diagnosis')) {
        if (!hasMedical) {
            return `You don't have any medical conditions or injuries on file right now.\n\nTo add them:\n1. Go to your **Profile** screen\n2. Scroll to the **Medical & Injuries** section\n3. Add any injuries, health conditions, or allergies\n\nOnce added, I'll automatically account for them in all my workout and nutrition advice — suggesting safe alternatives and avoiding risky exercises.`;
        }

        let response = `Here's your complete medical profile that I account for in all my advice:\n`;
        if (injuries.length > 0) {
            response += `\n🩹 **Injuries (${injuries.length}):**\n`;
            injuries.forEach(inj => { response += `  • ${inj.text}\n`; });
        }
        if (healthConditions.length > 0) {
            response += `\n🏥 **Health Conditions (${healthConditions.length}):**\n`;
            healthConditions.forEach(c => { response += `  • ${c.text}\n`; });
        }
        if (allergies.length > 0) {
            response += `\n⚡ **Allergies/Intolerances (${allergies.length}):**\n`;
            allergies.forEach(a => { response += `  • ${a.text}\n`; });
        }
        if (otherMed.length > 0) {
            response += `\n📋 **Other (${otherMed.length}):**\n`;
            otherMed.forEach(o => { response += `  • ${o.text}\n`; });
        }
        if (medical.additionalNotes.trim()) {
            response += `\n📝 **Your notes:** ${medical.additionalNotes.trim()}\n`;
        }

        response += `\n**How this affects your training:**`;
        response += buildMedicalBlock();
        response += `\n\nYou can update your conditions anytime in **Profile → Medical & Injuries**.`;
        return response;
    }

    // ── STEPS / ACTIVITY ──
    if (lq.includes('step') || lq.includes('walk') || lq.includes('distance') || lq.includes('walking')) {
        const avg7 = health.getAverageSteps(7);
        const pct = health.stepGoal > 0 ? Math.round((health.todaySteps / health.stepGoal) * 100) : 0;
        const dist = ((health.todaySteps * 0.762) / 1000).toFixed(1);
        let response = `Here's your step activity summary:\n\n🚶 Today: ${health.todaySteps.toLocaleString()} steps (${pct}% of your ${health.stepGoal.toLocaleString()} goal)\n📏 Distance: ~${dist} km\n📊 7-day average: ${avg7.toLocaleString()} steps/day\n🔥 Calories from steps: ~${Math.round(health.todaySteps * 0.04)} kcal\n\n`;
        response += health.todaySteps >= health.stepGoal
            ? "Great job hitting your step goal today! 🎉"
            : `You need ${(health.stepGoal - health.todaySteps).toLocaleString()} more steps to reach your goal. Try a brisk 15-20 min walk!`;
        if (hasMedical && injuries.some(i => {
            const il = i.text.toLowerCase();
            return il.includes('knee') || il.includes('ankle') || il.includes('foot') || il.includes('hip') || il.includes('leg');
        })) {
            response += `\n\n⚠️ Given your lower body injury, consider low-impact alternatives like swimming or cycling if walking is uncomfortable.`;
        }
        return response;
    }

    // ── CALORIE / ENERGY ──
    if (lq.includes('calorie') || lq.includes('energy') || lq.includes('burn') || lq.includes('tdee') || lq.includes('bmr') || (lq.includes('how many') && lq.includes('eat'))) {
        const bmr = getBmr();
        const maintenance = Math.round(bmr * 1.55);
        let response = `Here's your calorie breakdown:\n\n🔥 Active calories today: ${health.todayCalories.active} kcal (goal: ${health.calorieGoal})\n⚡ Resting energy (BMR): ~${bmr} kcal/day\n📊 Estimated maintenance: ~${maintenance} kcal/day\n⏱ Exercise time today: ${health.todayCalories.exercise} min\n\n🎯 Targets:\n• Fat loss: eat ~${maintenance - 400} kcal/day (400 deficit)\n• Maintenance: eat ~${maintenance} kcal/day\n• Muscle gain: eat ~${maintenance + 350} kcal/day (350 surplus)`;
        if (user?.weight) response += `\n\nBased on your weight of ${user.weight}kg, aim for ${Math.round(user.weight * 1.6)}-${Math.round(user.weight * 2.2)}g protein daily.`;
        if (allergies.length > 0) response += `\n\n⚡ Note: I'm aware of your allergies (${allergies.map(a => a.text).join(', ')}). Any meal suggestions I give will avoid those.`;
        return response;
    }

    // ── PROGRESS / STATS ──
    if (lq.includes('progress') || lq.includes('stats') || lq.includes('data') || lq.includes('summary') || lq.includes('how am i') || lq.includes('my data') || lq.includes('overview') || lq.includes('dashboard') || lq.includes('report')) {
        if (workoutHistory.length === 0) {
            return `You haven't logged any workouts yet! Start your first workout to begin tracking your progress.\n\nHere's your health snapshot:\n🚶 Steps today: ${health.todaySteps.toLocaleString()}\n🔥 Active calories: ${health.todayCalories.active} kcal${hasMedical ? `\n\n⚠️ I have ${medical.conditions.length} medical condition(s) on file and will factor them into all my recommendations.` : ''}`;
        }
        const totalVolume = workoutHistory.reduce((acc: number, w: any) =>
            acc + (w.exercises?.reduce((a: number, e: any) =>
                a + (Array.isArray(e.sets) ? e.sets.reduce((s: number, set: any) => s + ((set.weight || 0) * (set.reps || 0)), 0) : 0), 0) || 0), 0);
        let response = `Here's your full progress report:\n\n💪 Workouts logged: ${workoutHistory.length}\n📈 Total volume: ${Math.round(totalVolume).toLocaleString()} kg\n🚶 Steps today: ${health.todaySteps.toLocaleString()} (avg: ${health.getAverageSteps(7).toLocaleString()}/day)\n🔥 Active calories today: ${health.todayCalories.active} kcal\n\nKeep it up! Consistency is the #1 factor for results.`;
        if (hasMedical) response += `\n\n⚠️ Medical profile active (${medical.conditions.length} item${medical.conditions.length > 1 ? 's' : ''}). All my advice accounts for: ${medical.conditions.map(c => c.text).join(', ')}.`;
        return response;
    }

    // ── WORKOUT SUGGESTION (today) ──
    if (lq.includes('today') || lq.includes('what should') || lq.includes('suggest') || lq.includes('recommend') || lq.includes('workout for me')) {
        const recentMuscles = workoutHistory.slice(0, 2).flatMap((w: any) => w.exercises?.map((e: any) => e.name.toLowerCase()) || []);
        let suggestion = '';
        if (recentMuscles.some(m => m.includes('bench') || m.includes('chest') || (m.includes('press') && !m.includes('leg')))) {
            suggestion = `Since you recently trained chest/push, I'd suggest **Back & Biceps:**\n\n1. Pull-ups: 4×8-10\n2. Barbell Rows: 4×8-10\n3. Lat Pulldowns: 3×12\n4. Face Pulls: 3×15\n5. Barbell Curls: 3×10\n6. Hammer Curls: 3×12`;
        } else if (recentMuscles.some(m => m.includes('squat') || m.includes('leg') || m.includes('deadlift') || m.includes('lunge'))) {
            suggestion = `Since you recently trained legs, try **Upper Body Push:**\n\n1. Bench Press: 4×8-10\n2. Overhead Press: 3×8-10\n3. Incline DB Press: 3×10-12\n4. Lateral Raises: 4×12-15\n5. Tricep Pushdowns: 3×12\n6. Overhead Extension: 3×12`;
        } else if (recentMuscles.some(m => m.includes('row') || m.includes('pull') || m.includes('back') || m.includes('curl'))) {
            suggestion = `Since you recently trained back, try **Legs:**\n\n1. Barbell Squats: 4×8-10\n2. Romanian Deadlifts: 3×10-12\n3. Leg Press: 3×12\n4. Walking Lunges: 3×12 each\n5. Leg Curls: 3×12-15\n6. Calf Raises: 4×15-20`;
        } else {
            suggestion = `Here's a **Full Body** workout:\n\n1. Barbell Squats: 3×8\n2. Bench Press: 3×8\n3. Barbell Rows: 3×10\n4. Overhead Press: 3×8\n5. Romanian Deadlifts: 3×10\n6. Plank: 3×45 sec`;
        }
        suggestion += `\n\n💡 Rest 90-120 sec between compounds. Try to beat your last session's numbers!`;
        if (hasMedical) suggestion += buildMedicalBlock();
        return suggestion;
    }

    // ── WEEKLY / WORKOUT PLAN ──
    if (lq.includes('weekly') || lq.includes('week plan') || lq.includes('workout plan') || lq.includes('split') || lq.includes('routine') || lq.includes('program') || lq.includes('schedule')) {
        let response = `Here's a weekly workout plan:\n\n📅 Day 1 — Chest & Triceps\n• Bench Press: 4×8-10\n• Incline DB Press: 3×10-12\n• Cable Flyes: 3×12-15\n• Tricep Dips: 3×10-12\n\n📅 Day 2 — Back & Biceps\n• Deadlifts: 4×6-8\n• Barbell Rows: 4×8-10\n• Lat Pulldowns: 3×10-12\n• Barbell Curls: 3×10-12\n\n📅 Day 3 — Rest\n\n📅 Day 4 — Shoulders & Abs\n• OHP: 4×8-10\n• Lateral Raises: 4×12-15\n• Face Pulls: 3×15-20\n• Planks: 3×45-60 sec\n\n📅 Day 5 — Legs\n• Squats: 4×8-10\n• RDLs: 3×10-12\n• Leg Press: 3×12\n• Calf Raises: 4×15-20\n\n📅 Day 6-7 — Rest / Active Recovery`;
        if (hasMedical) response += buildMedicalBlock();
        return response;
    }

    // ── NUTRITION / DIET ──
    if (lq.includes('nutrition') || lq.includes('diet') || lq.includes('eat') || lq.includes('food') || lq.includes('meal') || lq.includes('protein') || lq.includes('macro') || lq.includes('supplement') || lq.includes('creatine') || lq.includes('whey')) {
        let response = `Nutrition Guide${user?.weight ? ` (based on your ${user.weight}kg)` : ''}:\n\n• Protein: ${user?.weight ? `${Math.round(user.weight * 1.6)}-${Math.round(user.weight * 2.2)}g/day` : '1.6-2.2g/kg bodyweight'}\n• Carbs: 3-5g/kg (oats, rice, potatoes)\n• Fats: 0.8-1.2g/kg (olive oil, avocado, nuts)\n\nSample Day:\n🌅 Breakfast: 3 eggs + oats + banana (~500 cal)\n🥗 Lunch: Chicken + rice + veggies (~600 cal)\n🍎 Snack: Greek yogurt + nuts (~300 cal)\n🍗 Dinner: Salmon + sweet potato + salad (~600 cal)\n\n💡 Muscle gain = 300-500 cal surplus. Fat loss = 300-500 cal deficit.`;
        if (allergies.length > 0) {
            response += `\n\n⚡ **Adjustments for your allergies (${allergies.map(a => a.text).join(', ')}):**`;
            allergies.forEach(a => {
                const al = a.text.toLowerCase();
                if (al.includes('lactose') || al.includes('dairy') || al.includes('milk'))
                    response += `\n  • Skip dairy — use oat/almond milk, soy yogurt, vegan protein powder`;
                else if (al.includes('gluten') || al.includes('wheat') || al.includes('celiac'))
                    response += `\n  • Swap oats for certified GF oats, use rice/quinoa instead of bread/pasta`;
                else if (al.includes('nut') || al.includes('peanut'))
                    response += `\n  • Replace nuts with seeds (sunflower, pumpkin), use seed butter`;
                else if (al.includes('egg'))
                    response += `\n  • Replace eggs with extra protein from chicken, fish, or protein shakes`;
                else if (al.includes('soy'))
                    response += `\n  • Avoid soy — use whey/pea protein, hemp milk as alternatives`;
                else
                    response += `\n  • Avoid ${a.text} in meals and supplements`;
            });
        }
        if (healthConditions.some(c => c.text.toLowerCase().includes('diabetes') || c.text.toLowerCase().includes('sugar'))) {
            response += `\n\n🏥 **Diabetes adjustment:** Focus on low-GI carbs (sweet potato, brown rice, quinoa). Avoid sugar spikes. Eat smaller, frequent meals. Monitor blood sugar around workouts.`;
        }
        return response;
    }

    // ── CHEST / BENCH ──
    if (lq.includes('chest') || lq.includes('bench') || lq.includes('pec')) {
        let response = `💪 **Chest Workout:**\n\n1. Flat Bench Press: 4×8-10\n2. Incline Dumbbell Press: 3×10-12\n3. Cable Flyes: 3×12-15\n4. Dips (chest variation): 3×10-12\n5. Push-ups (finisher): 2× to failure\n\n🔑 Retract shoulder blades, control the eccentric, don't bounce the bar.`;
        if (injuries.some(i => i.text.toLowerCase().includes('shoulder')))
            response += `\n\n⚠️ **Shoulder injury adjustment:** Skip dips and heavy flat bench. Focus on incline DB press (easier on shoulders), cable flyes (controlled ROM), and floor press.`;
        if (injuries.some(i => i.text.toLowerCase().includes('wrist')))
            response += `\n\n⚠️ **Wrist injury adjustment:** Use dumbbells with neutral grip instead of barbell. Wrist wraps can help. Skip push-ups or do them on knuckles.`;
        return response;
    }

    // ── BACK / PULL ──
    if (lq.includes('back') || lq.includes('pull') || lq.includes('row') || lq.includes('lat')) {
        let response = `💪 **Back Workout:**\n\n1. Pull-ups: 4×6-10\n2. Barbell Rows: 4×8-10\n3. Lat Pulldowns: 3×10-12\n4. Seated Cable Rows: 3×10-12\n5. Face Pulls: 3×15-20\n\n🔑 Pull with your elbows, squeeze shoulder blades, use straps if grip limits you.`;
        if (injuries.some(i => i.text.toLowerCase().includes('back') || i.text.toLowerCase().includes('disc') || i.text.toLowerCase().includes('spine')))
            response += `\n\n⚠️ **Back injury adjustment:** Skip bent-over barbell rows and heavy deadlifts. Use chest-supported rows, cable rows (seated upright), and lat pulldowns instead. Keep core braced at all times.`;
        return response;
    }

    // ── LEGS / SQUAT ──
    if (lq.includes('leg') || lq.includes('squat') || lq.includes('lunge') || lq.includes('quad') || lq.includes('hamstring') || lq.includes('glute') || lq.includes('calf')) {
        let response = `🦵 **Leg Workout:**\n\n1. Barbell Squats: 4×8-10\n2. Romanian Deadlifts: 3×10-12\n3. Leg Press: 3×12\n4. Walking Lunges: 3×12 each\n5. Leg Curls: 3×12-15\n6. Calf Raises: 4×15-20\n\n🔑 Drive through heels, keep core braced, don't skip hamstrings.`;
        if (injuries.some(i => i.text.toLowerCase().includes('knee') || i.text.toLowerCase().includes('acl')))
            response += `\n\n⚠️ **Knee injury adjustment:** Skip deep squats and lunges. Use leg press with limited ROM, wall sits, hamstring curls, and hip thrusts. Avoid explosive movements like jump squats.`;
        if (injuries.some(i => i.text.toLowerCase().includes('back')))
            response += `\n\n⚠️ **Back injury adjustment:** Skip barbell squats and heavy RDLs. Use goblet squats, leg press, and bodyweight lunges. Belt squats are excellent if available.`;
        return response;
    }

    // ── SHOULDER ──
    if (lq.includes('shoulder') || lq.includes('delt') || lq.includes('ohp') || lq.includes('overhead')) {
        let response = `🏋️ **Shoulder Workout:**\n\n1. Overhead Press: 4×8-10\n2. Lateral Raises: 4×12-15\n3. Face Pulls: 3×15-20\n4. Rear Delt Flyes: 3×12-15\n5. Cable Lateral Raises: 3×12-15\n\n🔑 Don't go too heavy on laterals — strict form beats ego lifting.`;
        if (injuries.some(i => i.text.toLowerCase().includes('shoulder') || i.text.toLowerCase().includes('rotator')))
            response += `\n\n⚠️ **Shoulder injury adjustment:** Skip overhead pressing and upright rows entirely. Focus on band pull-aparts, external rotations, light lateral raises (under 5kg), and face pulls for rehab.`;
        return response;
    }

    // ── ARM ──
    if (lq.includes('arm') || lq.includes('bicep') || lq.includes('tricep') || lq.includes('curl')) {
        let response = `💪 **Arm Workout:**\n\n**Biceps:**\n1. Barbell Curls: 3×10\n2. Incline DB Curls: 3×12\n3. Hammer Curls: 3×12\n\n**Triceps:**\n1. Close-Grip Bench: 3×10\n2. Overhead Extension: 3×12\n3. Rope Pushdowns: 3×15\n\n🔑 Triceps = 2/3 of arm size. Superset bi & tri for pump.`;
        if (injuries.some(i => i.text.toLowerCase().includes('elbow') || i.text.toLowerCase().includes('wrist')))
            response += `\n\n⚠️ **Elbow/wrist adjustment:** Use lighter weights, avoid full ROM on skull crushers. EZ-bar is easier on wrists than straight bar. Skip any exercise that causes sharp pain.`;
        return response;
    }

    // ── ABS / CORE ──
    if (lq.includes('abs') || lq.includes('core') || lq.includes('six pack') || lq.includes('plank') || lq.includes('crunch')) {
        let response = `🔥 **Core Workout (3-4×/week):**\n\n1. Hanging Leg Raises: 3×12-15\n2. Cable Crunches: 3×15-20\n3. Plank: 3×45-60 sec\n4. Russian Twists: 3×20\n5. Dead Bugs: 3×12 each side\n\n🔑 Abs are revealed through low body fat — diet matters more than crunches!`;
        if (injuries.some(i => i.text.toLowerCase().includes('back')))
            response += `\n\n⚠️ **Back injury adjustment:** Skip sit-ups and Russian twists. Focus on dead bugs, bird dogs, and McGill curl-ups — these build core stability without spinal flexion.`;
        return response;
    }

    // ── WEIGHT LOSS / FAT LOSS ──
    if (lq.includes('weight loss') || lq.includes('fat loss') || lq.includes('lose weight') || lq.includes('burn fat') || lq.includes('cut') || lq.includes('lean') || lq.includes('slim') || lq.includes('fat')) {
        const bmr = getBmr();
        const maintenance = Math.round(bmr * 1.55);
        let response = `🔥 **Fat Loss Strategy:**\n\n1. **Calorie deficit:** Eat ~${maintenance - 400} kcal/day (your maintenance is ~${maintenance})\n2. **High protein:** ${user?.weight ? `${Math.round(user.weight * 2)}g/day` : '2g/kg bodyweight'} to preserve muscle\n3. **Keep lifting:** Don't stop strength training — it preserves muscle\n4. **Cardio:** 2-3 sessions of 20-30 min moderate cardio\n5. **Steps:** Aim for 10,000 daily (you're at ${health.todaySteps.toLocaleString()} today)\n6. **Sleep:** 7-9 hours. Poor sleep increases hunger hormones\n\n📉 Target: 0.5-1 kg/week loss. Track weekly averages, not daily fluctuations.`;
        if (hasMedical) response += buildMedicalBlock();
        return response;
    }

    // ── MUSCLE GAIN / BULK ──
    if (lq.includes('muscle') || lq.includes('bulk') || lq.includes('gain') || lq.includes('mass') || lq.includes('bigger') || lq.includes('hypertrophy') || lq.includes('grow') || lq.includes('strong')) {
        const bmr = getBmr();
        const maintenance = Math.round(bmr * 1.55);
        let response = `💪 **Muscle Gain Blueprint:**\n\n1. **Surplus:** Eat ~${maintenance + 350} kcal/day (your maintenance is ~${maintenance})\n2. **Protein:** ${user?.weight ? `${Math.round(user.weight * 2)}g/day` : '2g/kg bodyweight'}\n3. **Train:** Each muscle 2×/week, 10-20 sets/muscle/week\n4. **Progressive overload:** Add weight or reps each session\n5. **Sleep:** 7-9 hours — growth hormone peaks during deep sleep\n6. **Rest days:** 1-2 per week minimum\n\n📈 Realistic gains: ~1 kg muscle/month (beginner), ~0.5 kg/month (intermediate).`;
        if (hasMedical) response += buildMedicalBlock();
        return response;
    }

    // ── REST / RECOVERY / SLEEP ──
    if (lq.includes('rest') || lq.includes('recover') || lq.includes('sleep') || lq.includes('sore') || lq.includes('tired') || lq.includes('overtrain')) {
        return `😴 **Recovery Guide:**\n\n**Sleep:** 7-9 hrs/night, consistent schedule, cool dark room\n**Active recovery:** Light walking, foam rolling, stretching on rest days\n**Nutrition:** Post-workout protein + carbs within 1-2 hrs\n**Signs you need rest:** Persistent soreness 3+ days, declining performance, poor sleep\n\n💡 Wait 48-72 hrs before training the same muscle group.\n\n🚶 Your activity today: ${health.todaySteps.toLocaleString()} steps, ${health.todayCalories.active} active kcal`;
    }

    // ── CARDIO / RUNNING ──
    if (lq.includes('cardio') || lq.includes('run') || lq.includes('endurance') || lq.includes('stamina') || lq.includes('treadmill') || lq.includes('cycling') || lq.includes('hiit')) {
        let response = `🏃 **Cardio Guide:**\n\n**Health:** 150 min/week moderate (brisk walking, cycling)\n**Fat loss:** 2-3 sessions of 20-30 min LISS + 8,000-10,000 daily steps\n**Without losing muscle:** Keep sessions under 30-45 min, eat enough protein\n\n💡 Incline treadmill walking (10-15%, 5-6 km/h) = best fat-burning with minimal recovery impact.\n\n🚶 You're at ${health.todaySteps.toLocaleString()} steps today.`;
        if (injuries.some(i => { const il = i.text.toLowerCase(); return il.includes('knee') || il.includes('ankle') || il.includes('shin') || il.includes('foot'); }))
            response += `\n\n⚠️ **Lower body injury adjustment:** Skip running and high-impact cardio. Try swimming, cycling, rowing machine, or upper body ergometer.`;
        if (healthConditions.some(c => c.text.toLowerCase().includes('asthma')))
            response += `\n\n⚠️ **Asthma adjustment:** Warm up 10+ min, keep inhaler nearby. Start with low intensity and gradually increase. Avoid exercising in cold/dry air.`;
        return response;
    }

    // ── WARM UP / STRETCHING / FORM ──
    if (lq.includes('warm') || lq.includes('stretch') || lq.includes('mobility') || lq.includes('form') || lq.includes('technique') || lq.includes('flexible') || lq.includes('cool down')) {
        return `🔥 **Pre-Workout Warm-Up (5-10 min):**\n1. Light cardio: 3-5 min (brisk walk, jump rope)\n2. Dynamic stretches: arm circles, leg swings, hip circles, bodyweight squats\n3. Activation sets: 2 light sets of your first exercise\n\n🧘 **Post-Workout (5-10 min):**\nHold each 20-30 sec: chest stretch, lat stretch, hip flexor, hamstring, quads\n\n⚠️ Dynamic stretches BEFORE, static stretches AFTER. Static stretching before lifting reduces strength temporarily.`;
    }

    // ── BEGINNER ──
    if (lq.includes('beginner') || lq.includes('start') || lq.includes('new to') || lq.includes('first time') || lq.includes('getting started')) {
        let response = `🎯 **Beginner Plan (3 days/week):**\n\n**Day A (Mon):** Squats 3×8, Bench 3×8, Rows 3×8, Plank 3×30s\n**Day B (Wed):** Deadlifts 3×5, OHP 3×8, Lat Pulldowns 3×10, Lunges 3×10\n**Day C (Fri):** Goblet Squats 3×10, DB Bench 3×10, Cable Rows 3×10\n\n💡 Focus on form first. Add 2.5kg per session. Eat 1.6g protein/kg. Track everything (you're doing this!). First 3 months = fastest gains ever.`;
        if (hasMedical) response += buildMedicalBlock();
        return response;
    }

    // ── PLATEAU / PROGRESS ──
    if (lq.includes('plateau') || lq.includes('stuck') || lq.includes('not progressing') || lq.includes('stall') || lq.includes('improve')) {
        return `📈 **Breaking Plateaus:**\n\n1. **Change stimulus:** Switch rep ranges (3×5 → 4×8), try new exercises\n2. **More volume:** Add 1-2 sets per muscle per week\n3. **Recovery check:** Sleep 7-9 hrs? Eating enough? Deload week every 4-6 weeks?\n4. **Micro-load:** Add just 1.25kg per side\n5. **Nutrition:** Increase calories by 200-300 if weight is stagnant\n\n💡 Plateaus are normal — your body adapted. Change the stimulus, don't give up.`;
    }

    // ── MOTIVATION ──
    if (lq.includes('motivat') || lq.includes('discipline') || lq.includes('give up') || lq.includes('lazy') || lq.includes('consistency') || lq.includes('quit')) {
        return `🔥 **Staying Consistent:**\n\n1. Build habits, not motivation — train same time daily\n2. Set measurable goals — "Bench 80kg by June" beats "get stronger"\n3. Track everything (you already do! 💪)\n4. A mediocre workout beats no workout\n5. Results take 8-12 weeks to become visible\n\n📊 Your numbers: ${workoutHistory.length} workouts logged, ${health.todaySteps.toLocaleString()} steps today. You're making progress even when it doesn't feel like it!`;
    }

    // ── GREETINGS ──
    if (lq.includes('hello') || lq.includes('hi') || lq.includes('hey') || lq.match(/^(yo|sup|what's up|good morning|good evening|good afternoon)/)) {
        let response = `Hey${user?.name ? ` ${user.name}` : ''}! 👋 I'm your AI Coach.\n\nHere's your day at a glance:\n🚶 ${health.todaySteps.toLocaleString()} steps\n🔥 ${health.todayCalories.active} active calories\n💪 ${workoutHistory.length} total workouts`;
        if (hasMedical) {
            response += `\n\n⚠️ I have your medical profile on file:`;
            if (injuries.length > 0) response += `\n  🩹 ${injuries.map(i => i.text).join(', ')}`;
            if (healthConditions.length > 0) response += `\n  🏥 ${healthConditions.map(c => c.text).join(', ')}`;
            if (allergies.length > 0) response += `\n  ⚡ ${allergies.map(a => a.text).join(', ')}`;
            response += `\nAll my advice will account for these.`;
        }
        response += `\n\nAsk me about:\n📋 Workout Plans • 💪 Exercises • 🥗 Nutrition\n📈 Your Progress • 🔥 Fat Loss / Muscle Gain\n🚶 Steps & Activity • 😴 Recovery • ⚠️ My Medical Info`;
        return response;
    }

    // ── THANKS ──
    if (lq.includes('thank') || lq.includes('thanks') || lq.includes('appreciate') || lq.includes('awesome') || lq.includes('great') || lq.includes('perfect') || lq.includes('nice')) {
        return `You're welcome! 💪 Keep training hard and stay consistent. I'm always here for workout advice, nutrition tips, or to check your progress.\n\n🚶 Today: ${health.todaySteps.toLocaleString()} steps | 🔥 ${health.todayCalories.active} active kcal\n\nLet's keep making progress together! 🎯`;
    }

    // ── ABOUT ME / WHO ARE YOU ──
    if (lq.includes('who are you') || lq.includes('what can you') || lq.includes('help me') || lq.includes('what do you') || lq.includes('about you')) {
        let response = `I'm your **AI Fitness Coach** 🤖💪\n\nI can help with:\n• 📋 Custom workout plans based on your history\n• 🥗 Personalized nutrition advice based on your body metrics\n• 📈 Progress tracking and analysis\n• 🚶 Step and calorie insights from your real phone data\n• 💡 Exercise form tips and alternatives`;
        if (hasMedical) response += `\n• ⚠️ Safe exercise modifications for your medical conditions`;
        response += `\n\nI know your real data — ${workoutHistory.length} workouts, ${health.todaySteps.toLocaleString()} steps today, and your full body metrics. Just ask anything!`;
        return response;
    }

    // ── DYNAMIC DEFAULT — uses actual user data so it's never generic ──
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    let response = `Good ${timeGreeting}${user?.name ? `, ${user.name}` : ''}! Here's what I can tell you based on your data:\n\n`;

    // Always include a personalized snapshot
    response += `📊 **Your snapshot:**\n`;
    response += `🚶 Steps: ${health.todaySteps.toLocaleString()} / ${health.stepGoal.toLocaleString()}\n`;
    response += `🔥 Active calories: ${health.todayCalories.active} kcal\n`;
    response += `💪 Total workouts: ${workoutHistory.length}\n`;
    if (user?.weight) response += `⚖️ Weight: ${user.weight} kg | BMR: ~${getBmr()} kcal\n`;

    if (hasMedical) {
        response += `\n⚠️ **Your medical profile:**\n`;
        medical.conditions.forEach(c => {
            const icon = c.type === 'injury' ? '🩹' : c.type === 'condition' ? '🏥' : c.type === 'allergy' ? '⚡' : '📋';
            response += `  ${icon} ${c.text} (${c.type})\n`;
        });
        if (medical.additionalNotes.trim()) response += `  📝 ${medical.additionalNotes.trim()}\n`;
        response += `All my recommendations account for these.\n`;
    }

    response += `\nTry asking me:\n• "What should I train today?"\n• "Show me my progress"\n• "How are my steps?"\n• "Give me a meal plan"\n• "What are my injuries?"`;
    if (hasMedical) response += `\n• "Tell me about my medical conditions"`;
    return response;
}


function groupIntoConversations(messages: Message[]): Conversation[] {
    if (messages.length === 0) return [];
    const convos: Conversation[] = [];
    let cur: Message[] = [messages[0]];
    for (let i = 1; i < messages.length; i++) {
        const prevT = messages[i - 1].createdAt ? new Date(messages[i - 1].createdAt!).getTime() : 0;
        const curT = messages[i].createdAt ? new Date(messages[i].createdAt!).getTime() : 0;
        if (curT - prevT > 30 * 60 * 1000) { convos.push(buildConvo(cur)); cur = [messages[i]]; }
        else { cur.push(messages[i]); }
    }
    if (cur.length > 0) convos.push(buildConvo(cur));
    return convos.reverse();
}

function buildConvo(msgs: Message[]): Conversation {
    const firstUser = msgs.find(m => m.role === 'user');
    const title = firstUser ? (firstUser.content.length > 40 ? firstUser.content.substring(0, 40) + '...' : firstUser.content) : 'New conversation';
    const last = msgs[msgs.length - 1];
    const preview = last.role === 'assistant' ? (last.content.length > 60 ? last.content.substring(0, 60) + '...' : last.content) : '';
    const date = msgs[0].createdAt ? formatRelDate(new Date(msgs[0].createdAt)) : 'Today';
    return { id: msgs[0].id, title, preview, date, messages: msgs };
}

function formatRelDate(d: Date): string {
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AIScreen() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [activeMessages, setActiveMessages] = useState<Message[]>([]);
    const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
    const [activeConvoTitle, setActiveConvoTitle] = useState('New Chat');
    const [showSidebar, setShowSidebar] = useState(true);
    const [model, setModel] = useState<string>('gpt-4o-mini');
    const [showModelPicker, setShowModelPicker] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const { token, user } = useAuthStore();
    const { history: workoutHistory } = useWorkoutStore();
    const { isDark, colors } = useTheme();
    const { width } = Dimensions.get('window');
    const isWideScreen = Platform.OS === 'web' && width >= 768;

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        if (!token) { setIsLoadingHistory(false); return; }
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 5000);
        try {
            const res = await fetch(`${API_URL}/ai/history`, { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal });
            clearTimeout(tid);
            if (res.ok) {
                const data = await res.json();
                setAllMessages(data.map((m: any) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })));
            }
        } catch { clearTimeout(tid); }
        finally { setIsLoadingHistory(false); }
    };

    const conversations = groupIntoConversations(allMessages);

    const openConvo = (convo: Conversation) => {
        setActiveMessages(convo.messages); setActiveConvoId(convo.id); setActiveConvoTitle(convo.title);
        if (!isWideScreen) setShowSidebar(false);
    };

    const newChat = () => {
        const welcome: Message = { id: 'welcome', role: 'assistant', content: '👋 Hey! I\'m your AI Coach. Ask me anything about training, nutrition, or your progress!', createdAt: new Date().toISOString() };
        setActiveMessages([welcome]); setActiveConvoId(null); setActiveConvoTitle('New Chat');
        if (!isWideScreen) setShowSidebar(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        setShowModelPicker(false);
        if (showSidebar && !isWideScreen) newChat();
        if (activeMessages.length === 0) newChat();
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), createdAt: new Date().toISOString() };
        if (!activeMessages.some(m => m.role === 'user')) {
            setActiveConvoTitle(userMsg.content.length > 40 ? userMsg.content.substring(0, 40) + '...' : userMsg.content);
        }
        setActiveMessages(p => [...p, userMsg]); setAllMessages(p => [...p, userMsg]); setInput(''); setIsLoading(true);
        if (!isWideScreen) setShowSidebar(false);
        try {
            const healthState = useHealthStore.getState();
            const medicalState = useMedicalStore.getState();
            const healthContext = {
                todaySteps: healthState.todaySteps,
                stepGoal: healthState.stepGoal,
                todayCalories: healthState.todayCalories,
                calorieGoal: healthState.calorieGoal,
                exerciseGoal: healthState.exerciseGoal,
                avgSteps7d: healthState.getAverageSteps(7),
                avgCalories7d: healthState.getAverageCalories(7),
                medicalConditions: medicalState.conditions.map(c => ({ text: c.text, type: c.type })),
                medicalNotes: medicalState.additionalNotes || '',
            };
            const ctrl = new AbortController(); const tid = setTimeout(() => ctrl.abort(), 15000);
            const res = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: userMsg.content, model, healthContext }),
                signal: ctrl.signal,
            });
            clearTimeout(tid);
            if (res.ok) { const data = await res.json(); const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, createdAt: new Date().toISOString() }; setActiveMessages(p => [...p, aiMsg]); setAllMessages(p => [...p, aiMsg]); }
            else throw new Error();
        } catch {
            setTimeout(() => { const fb: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: generateOfflineResponse(userMsg.content, workoutHistory, user), createdAt: new Date().toISOString() }; setActiveMessages(p => [...p, fb]); setAllMessages(p => [...p, fb]); }, 800);
        } finally { setIsLoading(false); }
    };

    const sendQuickPrompt = (promptText: string) => {
        if (isLoading) return;
        setInput(promptText);
        // Use a microtask to let state update then trigger send
        setTimeout(() => {
            setInput('');
            // Inline the send logic with the prompt text directly
            setShowModelPicker(false);
            if (showSidebar && !isWideScreen) newChat();
            if (activeMessages.length === 0) newChat();
            const userMsg: Message = { id: Date.now().toString(), role: 'user', content: promptText, createdAt: new Date().toISOString() };
            if (!activeMessages.some(m => m.role === 'user')) {
                setActiveConvoTitle(promptText.length > 40 ? promptText.substring(0, 40) + '...' : promptText);
            }
            setActiveMessages(p => [...p, userMsg]); setAllMessages(p => [...p, userMsg]); setIsLoading(true);
            if (!isWideScreen) setShowSidebar(false);

            (async () => {
                try {
                    const healthState = useHealthStore.getState();
                    const medicalState = useMedicalStore.getState();
                    const healthContext = {
                        todaySteps: healthState.todaySteps, stepGoal: healthState.stepGoal,
                        todayCalories: healthState.todayCalories, calorieGoal: healthState.calorieGoal,
                        exerciseGoal: healthState.exerciseGoal,
                        avgSteps7d: healthState.getAverageSteps(7), avgCalories7d: healthState.getAverageCalories(7),
                        medicalConditions: medicalState.conditions.map(c => ({ text: c.text, type: c.type })),
                        medicalNotes: medicalState.additionalNotes || '',
                    };
                    const ctrl = new AbortController(); const tid = setTimeout(() => ctrl.abort(), 15000);
                    const res = await fetch(`${API_URL}/ai/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ message: promptText, model, healthContext }),
                        signal: ctrl.signal,
                    });
                    clearTimeout(tid);
                    if (res.ok) { const data = await res.json(); const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, createdAt: new Date().toISOString() }; setActiveMessages(p => [...p, aiMsg]); setAllMessages(p => [...p, aiMsg]); }
                    else throw new Error();
                } catch {
                    setTimeout(() => { const fb: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: generateOfflineResponse(promptText, workoutHistory, user), createdAt: new Date().toISOString() }; setActiveMessages(p => [...p, fb]); setAllMessages(p => [...p, fb]); }, 800);
                } finally { setIsLoading(false); }
            })();
        }, 50);
    };

    const clearAll = () => {
        Alert.alert('Clear All History', 'Delete all conversations?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear', style: 'destructive', onPress: async () => {
                    try { await fetch(`${API_URL}/ai/history`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); } catch { }
                    setAllMessages([]); setActiveMessages([]); setActiveConvoId(null); setShowSidebar(true);
                }
            }
        ]);
    };

    const renderSidebar = () => (
        <ChatHistorySidebar conversations={conversations} activeConvoId={activeConvoId} isLoading={isLoadingHistory} isWideScreen={isWideScreen} onSelectConvo={openConvo} onNewChat={newChat} onClearAll={clearAll} />
    );

    const renderChat = () => (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Chat Header */}
            <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.borderLight, ...shadows.sm }} className="p-4 flex-row items-center">
                {!isWideScreen && (
                    <TouchableOpacity onPress={() => setShowSidebar(true)} style={{ backgroundColor: colors.cardGlass, borderWidth: 1, borderColor: colors.borderLight }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                        <ArrowLeft size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                <View style={{ backgroundColor: accent.blueBg }} className="w-8 h-8 rounded-lg items-center justify-center mr-2">
                    <Sparkles size={14} color={accent.blue} />
                </View>
                <Text style={{ color: colors.text }} className="font-bold text-base flex-1" numberOfLines={1}>{activeConvoTitle}</Text>
            </View>

            {/* Model selector dropdown */}
            {(() => {
                const currentModel = AI_MODELS.find(m => m.id === model) || AI_MODELS[1];
                return (
                    <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                        <TouchableOpacity
                            onPress={() => setShowModelPicker(!showModelPicker)}
                            activeOpacity={0.7}
                            className="px-4 py-2.5 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: currentModel.color, marginRight: 8 }} />
                                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{currentModel.name}</Text>
                                <Text style={{ color: colors.textTertiary, fontSize: 11, marginLeft: 6 }}>{currentModel.description}</Text>
                            </View>
                            <ChevronDown size={16} color={colors.textTertiary} style={{ transform: [{ rotate: showModelPicker ? '180deg' : '0deg' }] }} />
                        </TouchableOpacity>

                        {showModelPicker && (
                            <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderLight }} className="px-3 pb-3">
                                {AI_MODELS.map((m) => {
                                    const isActive = model === m.id;
                                    return (
                                        <TouchableOpacity
                                            key={m.id}
                                            onPress={() => { setModel(m.id); setShowModelPicker(false); }}
                                            activeOpacity={0.7}
                                            className="flex-row items-center px-3 py-3 rounded-xl mt-1"
                                            style={{
                                                backgroundColor: isActive ? m.color + '18' : 'transparent',
                                                borderWidth: isActive ? 1 : 0,
                                                borderColor: isActive ? m.color + '40' : 'transparent',
                                            }}
                                        >
                                            <View style={{
                                                width: 32, height: 32, borderRadius: 10,
                                                backgroundColor: m.color + '20',
                                                alignItems: 'center', justifyContent: 'center', marginRight: 10,
                                            }}>
                                                <Text style={{ color: m.color, fontSize: 12, fontWeight: '900' }}>
                                                    {m.provider === 'OpenAI' ? 'O' : m.provider === 'Anthropic' ? 'A' : m.provider === 'Google' ? 'G' : 'D'}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center">
                                                    <Text style={{ color: isActive ? m.color : colors.text, fontSize: 13, fontWeight: '700' }}>{m.name}</Text>
                                                    {isActive && (
                                                        <View style={{ backgroundColor: m.color, marginLeft: 6, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                                            <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>ACTIVE</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{m.provider} · {m.description}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );
            })()}

            {/* Messages or Empty state */}
            {activeMessages.length === 0 ? (
                <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 }}>
                    {/* Header */}
                    <View className="items-center mb-6">
                        <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : '#dbeafe', width: 64, height: 64, ...shadows.md }} className="rounded-2xl items-center justify-center mb-4">
                            <Bot size={32} color={accent.blue} />
                        </View>
                        <Text style={{ color: colors.text, letterSpacing: -0.5 }} className="text-xl font-bold mb-1">AI Coach</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center text-sm">Tap a suggestion or type your own question</Text>
                    </View>

                    {/* Quick Prompts Grid */}
                    <View className="flex-row flex-wrap justify-center" style={{ gap: 8 }}>
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => sendQuickPrompt(prompt.message)}
                                activeOpacity={0.7}
                                style={{
                                    backgroundColor: isDark ? prompt.color + '15' : prompt.color + '0C',
                                    borderWidth: 1,
                                    borderColor: isDark ? prompt.color + '30' : prompt.color + '25',
                                    borderRadius: 16,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 7,
                                }}
                            >
                                {getPromptIcon(prompt.icon, prompt.color, 14)}
                                <Text style={{ color: isDark ? prompt.color : prompt.color + 'DD', fontSize: 13, fontWeight: '600' }}>{prompt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <ScrollView className="flex-1 p-4" ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                    {activeMessages.map((msg) => (
                        <View key={msg.id} className={`flex-row mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe' }} className="w-8 h-8 rounded-xl items-center justify-center mr-2">
                                    <Bot size={16} color={accent.blue} />
                                </View>
                            )}
                            <View style={msg.role === 'user' ? {
                                backgroundColor: accent.blue,
                                borderTopRightRadius: 4,
                                borderTopLeftRadius: 18,
                                borderBottomLeftRadius: 18,
                                borderBottomRightRadius: 18,
                                ...shadows.glow(accent.blue),
                            } : {
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: colors.borderLight,
                                borderTopLeftRadius: 4,
                                borderTopRightRadius: 18,
                                borderBottomLeftRadius: 18,
                                borderBottomRightRadius: 18,
                                ...shadows.sm,
                            }} className="p-4 max-w-[80%]">
                                <Text style={{ color: msg.role === 'user' ? '#ffffff' : colors.text, lineHeight: 22 }}>{msg.content}</Text>
                                {msg.createdAt && msg.id !== 'welcome' && (
                                    <Text className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : ''}`} style={msg.role !== 'user' ? { color: colors.textTertiary } : undefined}>
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                )}
                            </View>
                            {msg.role === 'user' && (
                                <View style={{ backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.borderLight }} className="w-8 h-8 rounded-xl items-center justify-center ml-2">
                                    <UserIcon size={14} color={colors.textSecondary} />
                                </View>
                            )}
                        </View>
                    ))}
                    {isLoading && (
                        <View className="flex-row mb-4 justify-start">
                            <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe' }} className="w-8 h-8 rounded-xl items-center justify-center mr-2">
                                <Bot size={16} color={accent.blue} />
                            </View>
                            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderLight, borderTopLeftRadius: 4, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, ...shadows.sm }} className="p-4">
                                <ActivityIndicator size="small" color={accent.blue} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Quick prompt chips — shown inline when chat has messages and not loading */}
            {activeMessages.length > 0 && !isLoading && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
                    style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderLight, maxHeight: 52 }}
                >
                    {QUICK_PROMPTS.slice(0, 8).map((prompt, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => sendQuickPrompt(prompt.message)}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: isDark ? prompt.color + '12' : prompt.color + '0A',
                                borderWidth: 1,
                                borderColor: isDark ? prompt.color + '28' : prompt.color + '20',
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 7,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                            }}
                        >
                            {getPromptIcon(prompt.icon, prompt.color, 12)}
                            <Text style={{ color: isDark ? prompt.color : prompt.color + 'DD', fontSize: 12, fontWeight: '600' }}>{prompt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
                <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderLight, ...shadows.md }} className="p-4 flex-row items-center">
                    <View style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.borderInput, borderRadius: 20 }} className="flex-1 mr-3 overflow-hidden">
                        <TextInput
                            style={{ color: colors.text, paddingHorizontal: 16, paddingVertical: 12, maxHeight: 96 }}
                            placeholder="Message AI Coach..."
                            placeholderTextColor={colors.textTertiary}
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                    </View>
                    <TouchableOpacity
                        style={{
                            backgroundColor: input.trim() ? accent.blue : (isDark ? '#1e1e2a' : '#e5e7eb'),
                            ...(input.trim() ? shadows.glow(accent.blue) : {}),
                        }}
                        className="w-12 h-12 rounded-full items-center justify-center"
                        onPress={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {isWideScreen ? (
                <View className="flex-1 flex-row">
                    {renderSidebar()}
                    {renderChat()}
                </View>
            ) : (
                showSidebar ? renderSidebar() : renderChat()
            )}
        </SafeAreaView>
    );
}
