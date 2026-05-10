import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useWorkoutStore } from '../store/workoutStore';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import CircularProgress from '../components/CircularProgress';
import { PlayCircle, TrendingUp, Flame, Dumbbell, Sparkles, Calendar, BookOpen, ChevronRight, BarChart3 } from 'lucide-react-native';

const WEEKLY_GOAL = 5;

export default function HomeScreen({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const { history, fetchHistory, activeWorkout, startWorkout } = useWorkoutStore();
    const { user } = useAuthStore();
    const { getQuote } = useContentStore();
    const [refreshing, setRefreshing] = useState(false);
    const [quote, setQuote] = useState('');

    useEffect(() => {
        fetchHistory();
        setQuote(getQuote());
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    // Stats
    const totalWorkouts = history.length;
    const totalSets = history.reduce((acc: number, w: any) =>
        acc + (w.exercises?.reduce((a: number, e: any) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0) || 0), 0);
    const totalVolume = Math.round(history.reduce((acc: number, w: any) =>
        acc + (w.exercises?.reduce((a: number, e: any) =>
            a + (Array.isArray(e.sets) ? e.sets.reduce((s: number, set: any) => s + ((set.weight || 0) * (set.reps || 0)), 0) : 0), 0) || 0), 0));

    // Week stats
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const thisWeek = history.filter((w: any) => new Date(w.date || w.endTime) >= startOfWeek);
    const weeklyProgress = Math.min(thisWeek.length / WEEKLY_GOAL, 1);

    // Streak (consecutive days with workouts)
    const computeStreak = () => {
        const days = new Set(history.map((w: any) => new Date(w.date || w.endTime).toDateString()));
        let streak = 0;
        const cur = new Date();
        while (days.has(cur.toDateString())) {
            streak++;
            cur.setDate(cur.getDate() - 1);
        }
        return streak;
    };
    const streak = computeStreak();

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const StatCard = ({ icon, label, value, color }: any) => (
        <View style={glassCard} className="flex-1 rounded-2xl p-3.5 mx-1">
            <View style={{ backgroundColor: color + '20' }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                {icon}
            </View>
            <Text style={{ color: colors.text }} className="text-xl font-bold">{value}</Text>
            <Text style={{ color: colors.textTertiary }} className="text-xs">{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accent.green]} tintColor={accent.green} />}
            >
                {/* Header */}
                <View className="px-5 pt-4 pb-2">
                    <Text style={{ color: colors.textSecondary }} className="text-sm">{greeting},</Text>
                    <Text style={{ color: colors.text }} className="text-2xl font-bold">{user?.name || 'Athlete'} 💪</Text>
                </View>

                {/* Daily quote */}
                {quote && (
                    <View
                        style={{ backgroundColor: isDark ? '#0a1f15' : '#ecfdf5', borderColor: accent.green + '30', borderWidth: 1 }}
                        className="mx-5 mt-3 rounded-2xl p-4 flex-row items-start"
                    >
                        <View style={{ backgroundColor: accent.greenBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                            <Sparkles size={16} color={accent.green} />
                        </View>
                        <Text style={{ color: colors.text, flex: 1, fontSize: 13, lineHeight: 18 }} className="italic">
                            "{quote}"
                        </Text>
                    </View>
                )}

                {/* Weekly progress + Quick start */}
                <View className="px-5 mt-5 flex-row">
                    <View style={glassCard} className="flex-1 rounded-2xl p-4 mr-2 items-center justify-center">
                        <CircularProgress
                            size={90}
                            progress={weeklyProgress}
                            color={accent.green}
                            label={`${thisWeek.length}/${WEEKLY_GOAL}`}
                            sublabel="this week"
                        />
                        <Text style={{ color: colors.textSecondary }} className="text-xs mt-2 font-semibold">Weekly Goal</Text>
                    </View>
                    <TouchableOpacity
                        style={{ backgroundColor: accent.green, ...shadows.glow(accent.green) }}
                        className="flex-1 rounded-2xl p-4 ml-2 items-center justify-center"
                        onPress={() => {
                            if (!activeWorkout) startWorkout();
                            navigation.navigate('Workout');
                        }}
                        activeOpacity={0.85}
                    >
                        <PlayCircle size={32} color="white" />
                        <Text className="text-white font-bold mt-2 text-base">
                            {activeWorkout ? 'Continue' : 'Start Workout'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Stats grid */}
                <View className="px-4 mt-3 flex-row">
                    <StatCard
                        icon={<Dumbbell size={16} color={accent.indigo} />}
                        label="Workouts"
                        value={totalWorkouts}
                        color={accent.indigo}
                    />
                    <StatCard
                        icon={<TrendingUp size={16} color={accent.amber} />}
                        label="Total Sets"
                        value={totalSets}
                        color={accent.amber}
                    />
                    <StatCard
                        icon={<Flame size={16} color={accent.red} />}
                        label="Day Streak"
                        value={streak}
                        color={accent.red}
                    />
                </View>

                {/* Volume card */}
                <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-4 flex-row items-center">
                    <View style={{ backgroundColor: accent.cyanBg }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                        <BarChart3 size={20} color={accent.cyan} />
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: colors.textSecondary }} className="text-xs">Total Volume</Text>
                        <Text style={{ color: colors.text }} className="text-xl font-bold">{totalVolume.toLocaleString()} kg</Text>
                    </View>
                </View>

                {/* Quick links */}
                <View className="px-5 mt-5">
                    <Text style={{ color: colors.text }} className="font-bold text-base mb-3">Quick Access</Text>
                    <TouchableOpacity
                        style={glassCard}
                        className="rounded-2xl p-4 flex-row items-center mb-2"
                        onPress={() => navigation.navigate('Programs')}
                        activeOpacity={0.7}
                    >
                        <View style={{ backgroundColor: accent.indigoBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                            <BookOpen size={18} color={accent.indigo} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.text }} className="font-bold text-sm">Programs</Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Browse coach plans or create your own</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={glassCard}
                        className="rounded-2xl p-4 flex-row items-center mb-2"
                        onPress={() => navigation.navigate('WeeklySummary')}
                        activeOpacity={0.7}
                    >
                        <View style={{ backgroundColor: accent.purpleBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                            <Calendar size={18} color={accent.purple} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.text }} className="font-bold text-sm">Weekly Summary</Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>AI-powered insights of your training</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {/* Recent activity */}
                {history.length > 0 && (
                    <View className="px-5 mt-5">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text style={{ color: colors.text }} className="font-bold text-base">Recent Workouts</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('History')}>
                                <Text style={{ color: accent.green }} className="text-xs font-semibold">See all</Text>
                            </TouchableOpacity>
                        </View>
                        {history.slice(0, 3).map((w: any) => (
                            <TouchableOpacity
                                key={w.id}
                                style={glassCard}
                                className="rounded-2xl p-3 mb-2 flex-row items-center"
                                onPress={() => navigation.navigate('WorkoutDetail', { workout: w })}
                            >
                                <View style={{ backgroundColor: accent.greenBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                                    <Dumbbell size={16} color={accent.green} />
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: colors.text }} className="font-semibold text-sm">{w.name || 'Workout'}</Text>
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                                        {new Date(w.date || w.endTime).toLocaleDateString()} · {w.exercises?.length || 0} exercises
                                    </Text>
                                </View>
                                <ChevronRight size={16} color={colors.textTertiary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
