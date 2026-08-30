import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useWorkoutStore } from '../store/workoutStore';
import { MOCK_EXERCISES } from '../constants/mockData';
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Minus, Dumbbell, Clock, Flame, Award, Calendar, Target } from 'lucide-react-native';

interface ExerciseStat {
    name: string;
    sessions: number;
    sets: number;
    volume: number;
    maxWeight: number;
    maxReps: number;
}

/** Normalise the two shapes a workout can arrive in (server ISO date, or local ms). */
const workoutDate = (w: any): Date => new Date(w.date || w.endTime || w.startTime || Date.now());

/** Muscle group for a logged exercise name, matched against the bundled library. */
const muscleGroupFor = (name: string): string | null => {
    const n = name.trim().toLowerCase();
    const hit = MOCK_EXERCISES.find(
        (e) => e.name.toLowerCase() === n || n.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(n),
    );
    return hit ? hit.muscleGroup : null;
};

export default function WeeklySummaryScreen({ navigation }: any) {
    const { colors } = useTheme();
    const { history, fetchHistory } = useWorkoutStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    // ── Everything below is derived from the workouts already logged ──────────
    const data = useMemo(() => {
        const list = Array.isArray(history) ? history : [];
        if (list.length === 0) return null;

        let totalSets = 0;
        let completedSets = 0;
        let totalReps = 0;
        let totalVolume = 0;
        let totalDurationMin = 0;
        let timedSessions = 0;

        const byExercise: Record<string, ExerciseStat> = {};
        const byGroup: Record<string, number> = {};
        const trainingDays = new Set<string>();

        for (const w of list) {
            trainingDays.add(workoutDate(w).toDateString());

            if (w.startTime && w.endTime) {
                const mins = Math.round((Number(w.endTime) - Number(w.startTime)) / 60000);
                if (mins > 0 && mins < 600) {
                    totalDurationMin += mins;
                    timedSessions += 1;
                }
            }

            for (const ex of w.exercises || []) {
                const sets = Array.isArray(ex.sets) ? ex.sets : [];
                if (!byExercise[ex.name]) {
                    byExercise[ex.name] = { name: ex.name, sessions: 0, sets: 0, volume: 0, maxWeight: 0, maxReps: 0 };
                }
                const stat = byExercise[ex.name];
                stat.sessions += 1;

                const group = muscleGroupFor(ex.name);

                for (const s of sets) {
                    const reps = Number(s.reps) || 0;
                    const weight = Number(s.weight) || 0;
                    const vol = weight * reps;

                    totalSets += 1;
                    if (s.completed) completedSets += 1;
                    totalReps += reps;
                    totalVolume += vol;

                    stat.sets += 1;
                    stat.volume += vol;
                    if (weight > stat.maxWeight) {
                        stat.maxWeight = weight;
                        stat.maxReps = reps;
                    }
                    if (group) byGroup[group] = (byGroup[group] || 0) + 1;
                }
            }
        }

        // Chronological order for span and trend maths
        const sorted = [...list].sort((a, b) => workoutDate(a).getTime() - workoutDate(b).getTime());
        const first = workoutDate(sorted[0]);
        const last = workoutDate(sorted[sorted.length - 1]);
        const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86400000) + 1);
        const perWeek = (list.length / spanDays) * 7;
        const daysSinceLast = Math.floor((Date.now() - last.getTime()) / 86400000);

        // Volume trend: newer half vs older half (needs at least 4 sessions)
        const volumeOf = (w: any) =>
            (w.exercises || []).reduce(
                (a: number, e: any) =>
                    a +
                    (Array.isArray(e.sets)
                        ? e.sets.reduce((s: number, st: any) => s + (Number(st.weight) || 0) * (Number(st.reps) || 0), 0)
                        : 0),
                0,
            );
        let trend: 'up' | 'down' | 'flat' | null = null;
        let trendPct = 0;
        if (sorted.length >= 4) {
            const mid = Math.floor(sorted.length / 2);
            const older = sorted.slice(0, mid);
            const newer = sorted.slice(mid);
            const avgOld = older.reduce((a, w) => a + volumeOf(w), 0) / older.length;
            const avgNew = newer.reduce((a, w) => a + volumeOf(w), 0) / newer.length;
            if (avgOld > 0) {
                trendPct = Math.round(((avgNew - avgOld) / avgOld) * 100);
                trend = trendPct > 5 ? 'up' : trendPct < -5 ? 'down' : 'flat';
            }
        }

        // Current streak of consecutive training days
        let streak = 0;
        const cursor = new Date();
        if (!trainingDays.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
        while (trainingDays.has(cursor.toDateString())) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        const exercises = Object.values(byExercise).sort((a, b) => b.sessions - a.sessions);
        const records = exercises.filter((e) => e.maxWeight > 0).sort((a, b) => b.maxWeight - a.maxWeight);
        const groups = Object.entries(byGroup).sort((a, b) => b[1] - a[1]);
        const groupTotal = groups.reduce((a, g) => a + g[1], 0);

        return {
            totalWorkouts: list.length,
            totalSets,
            completedSets,
            totalReps,
            totalVolume,
            totalDurationMin,
            avgDuration: timedSessions ? Math.round(totalDurationMin / timedSessions) : 0,
            avgSets: Math.round(totalSets / list.length),
            avgVolume: Math.round(totalVolume / list.length),
            first,
            last,
            spanDays,
            perWeek,
            daysSinceLast,
            trend,
            trendPct,
            streak,
            exercises,
            records,
            groups,
            groupTotal,
        };
    }, [history]);

    // ── Narrative insights, generated from the numbers above ─────────────────
    const insights = useMemo(() => {
        if (!data) return [];
        const out: string[] = [];
        const d = data;

        out.push(
            `You've logged ${d.totalWorkouts} workout${d.totalWorkouts === 1 ? '' : 's'} over ${d.spanDays} day${d.spanDays === 1 ? '' : 's'}` +
                (d.totalWorkouts > 1 ? `, averaging ${d.perWeek.toFixed(1)} sessions a week.` : '.'),
        );

        out.push(
            `That's ${d.totalSets} sets and ${d.totalReps.toLocaleString()} reps, moving ${Math.round(d.totalVolume).toLocaleString()} kg of total volume.`,
        );

        if (d.avgDuration > 0) {
            out.push(`Your typical session runs about ${d.avgDuration} minutes and ${d.avgSets} sets.`);
        }

        if (d.trend === 'up') {
            out.push(`Volume is trending up — your recent sessions average ${Math.abs(d.trendPct)}% more than your earlier ones. Progressive overload is working.`);
        } else if (d.trend === 'down') {
            out.push(`Volume is down about ${Math.abs(d.trendPct)}% versus your earlier sessions. That's fine if you're deloading — otherwise try adding a set or a little weight.`);
        } else if (d.trend === 'flat') {
            out.push(`Volume has held steady across your sessions. To keep adapting, add roughly 2.5 kg or one extra rep on your main lifts.`);
        }

        if (d.exercises.length > 0) {
            const top = d.exercises[0];
            out.push(`Your most trained movement is ${top.name}, hit in ${top.sessions} session${top.sessions === 1 ? '' : 's'}.`);
        }

        if (d.groups.length > 0 && d.groupTotal > 0) {
            const [name, count] = d.groups[0];
            const share = Math.round((count / d.groupTotal) * 100);
            if (d.groups.length >= 3 && share >= 45) {
                out.push(`${name} accounts for ${share}% of your working sets — the highest share by some margin. Worth balancing with the muscle groups you train least.`);
            } else {
                out.push(`Your sets are spread across ${d.groups.length} muscle group${d.groups.length === 1 ? '' : 's'}, led by ${name} at ${share}%.`);
            }
        }

        if (d.streak >= 2) {
            out.push(`You're on a ${d.streak}-day training streak. Keep it going.`);
        } else if (d.daysSinceLast >= 4) {
            out.push(`It's been ${d.daysSinceLast} days since your last session — a good moment to get back under the bar.`);
        }

        if (d.totalSets > 0 && d.completedSets < d.totalSets) {
            const pct = Math.round((d.completedSets / d.totalSets) * 100);
            if (pct < 80) out.push(`You marked ${pct}% of your sets complete. Ticking sets off keeps these numbers accurate.`);
        }

        return out;
    }, [data]);

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const StatTile = ({ icon, bg, value, label }: any) => (
        <View style={[glassCard, { width: '47%' }]} className="rounded-2xl p-3 m-1">
            <View style={{ backgroundColor: bg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                {icon}
            </View>
            <Text style={{ color: colors.text }} className="text-xl font-bold">{value}</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{label}</Text>
        </View>
    );

    const TrendIcon = () => {
        if (data?.trend === 'up') return <TrendingUp size={16} color={accent.green} />;
        if (data?.trend === 'down') return <TrendingDown size={16} color={accent.red} />;
        return <Minus size={16} color={accent.amber} />;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.purple} />}
            >
                <View className="px-5 pt-3 pb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <Sparkles size={22} color={accent.purple} />
                        <Text style={{ color: colors.text }} className="text-2xl font-bold ml-2">Training Insights</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                        {data
                            ? `Based on all ${data.totalWorkouts} workout${data.totalWorkouts === 1 ? '' : 's'} you've logged`
                            : 'Analysis of your training history'}
                    </Text>
                </View>

                {!data ? (
                    <View style={glassCard} className="mx-5 rounded-2xl p-6 items-center">
                        <Dumbbell size={28} color={colors.textTertiary} />
                        <Text style={{ color: colors.text }} className="text-base font-semibold mt-3">No workouts yet</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-sm text-center mt-1">
                            Log your first workout and your insights will appear here.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Headline numbers */}
                        <View className="px-4 flex-row flex-wrap mb-1">
                            <StatTile
                                icon={<Dumbbell size={16} color={accent.indigo} />}
                                bg={accent.indigoBg}
                                value={data.totalWorkouts}
                                label="Workouts"
                            />
                            <StatTile
                                icon={<TrendingUp size={16} color={accent.amber} />}
                                bg={accent.amberBg}
                                value={data.totalSets}
                                label="Sets"
                            />
                            <StatTile
                                icon={<Flame size={16} color={accent.green} />}
                                bg={accent.greenBg}
                                value={Math.round(data.totalVolume).toLocaleString()}
                                label="Volume (kg)"
                            />
                            <StatTile
                                icon={<Clock size={16} color={accent.cyan} />}
                                bg={accent.cyanBg}
                                value={data.totalDurationMin >= 60
                                    ? `${Math.floor(data.totalDurationMin / 60)}h ${data.totalDurationMin % 60}m`
                                    : `${data.totalDurationMin}m`}
                                label="Total time"
                            />
                        </View>

                        {/* Narrative insights */}
                        <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-5">
                            <View className="flex-row items-center mb-3">
                                <TrendIcon />
                                <Text style={{ color: colors.text }} className="text-base font-bold ml-2">What your training shows</Text>
                            </View>
                            {insights.map((line, i) => (
                                <View key={i} className="flex-row mb-2.5">
                                    <Text style={{ color: accent.purple }} className="text-sm mr-2">•</Text>
                                    <Text style={{ color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 }}>{line}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Personal records */}
                        {data.records.length > 0 && (
                            <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-5">
                                <View className="flex-row items-center mb-3">
                                    <Award size={16} color={accent.amber} />
                                    <Text style={{ color: colors.text }} className="text-base font-bold ml-2">Personal records</Text>
                                </View>
                                {data.records.slice(0, 6).map((r) => (
                                    <View key={r.name} className="flex-row items-center justify-between py-1.5">
                                        <Text style={{ color: colors.text, flex: 1, fontSize: 13 }} numberOfLines={1}>{r.name}</Text>
                                        <Text style={{ color: accent.green, fontSize: 13, fontWeight: '700' }}>
                                            {r.maxWeight} kg × {r.maxReps}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Most trained movements */}
                        {data.exercises.length > 0 && (
                            <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-5">
                                <View className="flex-row items-center mb-3">
                                    <Target size={16} color={accent.indigo} />
                                    <Text style={{ color: colors.text }} className="text-base font-bold ml-2">Most trained</Text>
                                </View>
                                {data.exercises.slice(0, 5).map((e) => {
                                    const pct = data.exercises[0].sessions > 0
                                        ? Math.round((e.sessions / data.exercises[0].sessions) * 100)
                                        : 0;
                                    return (
                                        <View key={e.name} className="mb-2.5">
                                            <View className="flex-row justify-between mb-1">
                                                <Text style={{ color: colors.text, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                                    {e.sessions}× · {e.sets} sets
                                                </Text>
                                            </View>
                                            <View style={{ height: 5, backgroundColor: colors.borderLight, borderRadius: 3 }}>
                                                <View style={{ height: 5, width: `${pct}%`, backgroundColor: accent.indigo, borderRadius: 3 }} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Training span */}
                        <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-5">
                            <View className="flex-row items-center mb-3">
                                <Calendar size={16} color={accent.cyan} />
                                <Text style={{ color: colors.text }} className="text-base font-bold ml-2">Training period</Text>
                            </View>
                            <View className="flex-row justify-between py-1">
                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>First workout</Text>
                                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
                                    {data.first.toLocaleDateString()}
                                </Text>
                            </View>
                            <View className="flex-row justify-between py-1">
                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Latest workout</Text>
                                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
                                    {data.last.toLocaleDateString()}
                                </Text>
                            </View>
                            <View className="flex-row justify-between py-1">
                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Average per session</Text>
                                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
                                    {data.avgSets} sets · {Math.round(data.avgVolume).toLocaleString()} kg
                                </Text>
                            </View>
                            {data.streak > 0 && (
                                <View className="flex-row justify-between py-1">
                                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Current streak</Text>
                                    <Text style={{ color: accent.green, fontSize: 13, fontWeight: '700' }}>
                                        {data.streak} day{data.streak === 1 ? '' : 's'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
