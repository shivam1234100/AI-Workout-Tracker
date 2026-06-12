import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useHealthStore } from '../store/healthStore';
import { useAuthStore } from '../store/authStore';
import { computeBMR } from '../lib/healthCalc';
import ActivityRings from '../components/ActivityRings';
import BarChart from '../components/BarChart';
import { ArrowLeft, Flame, Zap, Timer, Activity } from 'lucide-react-native';

type Period = 'D' | 'W' | 'M';

const RING_COLORS = {
    move: '#FF2D55',
    moveBg: 'rgba(255, 45, 85, 0.2)',
    exercise: '#ADFF2F',
    exerciseBg: 'rgba(173, 255, 47, 0.2)',
    stand: '#00CED1',
    standBg: 'rgba(0, 206, 209, 0.2)',
};

export default function CalorieScreen({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const { user } = useAuthStore();
    const {
        todayCalories,
        calorieGoal,
        exerciseGoal,
        standGoal,
        getCaloriesForRange,
    } = useHealthStore();

    const [period, setPeriod] = useState<Period>('D');

    // Calorie data is synced globally by useHealthSync in App.tsx
    // No local sync or demo data generation needed

    const moveProgress = calorieGoal > 0 ? todayCalories.active / calorieGoal : 0;
    const exerciseProgress = exerciseGoal > 0 ? todayCalories.exercise / exerciseGoal : 0;
    const standProgress = standGoal > 0 ? todayCalories.stand / standGoal : 0;

    const bmr = computeBMR({ weight: user?.weight, height: user?.height, gender: user?.gender, age: user?.age });

    const getActiveChartData = () => {
        const days = period === 'D' ? 1 : period === 'W' ? 7 : 30;
        const data = getCaloriesForRange(days);
        const todayDate = new Date().toISOString().split('T')[0];
        if (period === 'D') {
            // Distribute today's active calories across elapsed 3-hour blocks
            const currentHour = new Date().getHours();
            const activeBlocks = Math.max(Math.floor(currentHour / 3) + 1, 1);
            const caloriesPerBlock = activeBlocks > 0 ? Math.round(todayCalories.active / activeBlocks) : 0;
            const hours = [];
            for (let h = 0; h < 24; h += 3) {
                const isActive = h <= currentHour;
                hours.push({
                    label: h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`,
                    value: isActive ? caloriesPerBlock : 0,
                    isToday: false,
                });
            }
            return hours;
        }
        return data.map((d, i) => {
            const date = new Date(d.date + 'T12:00:00');
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
                label: period === 'W' ? dayLabels[date.getDay()] : (i % 5 === 0 ? `${date.getDate()}` : ''),
                value: d.active,
                isToday: d.date === todayDate,
            };
        });
    };

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const periodTabs: Period[] = ['D', 'W', 'M'];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center px-5 pt-3 pb-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ color: colors.text }} className="text-xl font-bold flex-1">Activity</Text>
                </View>

                {/* Period Tabs */}
                <View
                    style={{ backgroundColor: isDark ? '#1a1f2e' : '#e5e7eb' }}
                    className="mx-5 rounded-xl flex-row p-1 mt-2"
                >
                    {periodTabs.map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p)}
                            style={period === p ? { backgroundColor: colors.card, ...shadows.sm } : {}}
                            className="flex-1 py-2 rounded-lg items-center"
                        >
                            <Text
                                style={{
                                    color: period === p ? colors.text : colors.textTertiary,
                                    fontWeight: period === p ? '700' : '500',
                                    fontSize: 13,
                                }}
                            >
                                {p === 'D' ? 'Day' : p === 'W' ? 'Week' : 'Month'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Activity Rings */}
                <View style={glassCard} className="mx-5 mt-4 rounded-2xl p-5 items-center">
                    <ActivityRings
                        size={160}
                        strokeWidth={16}
                        rings={[
                            { progress: moveProgress, color: RING_COLORS.move, bgColor: RING_COLORS.moveBg },
                            { progress: exerciseProgress, color: RING_COLORS.exercise, bgColor: RING_COLORS.exerciseBg },
                            { progress: standProgress, color: RING_COLORS.stand, bgColor: RING_COLORS.standBg },
                        ]}
                    />

                    {/* Ring Labels */}
                    <View className="flex-row mt-5 w-full justify-around">
                        <View className="items-center">
                            <Text style={{ color: RING_COLORS.move, fontWeight: '700', fontSize: 11 }}>Move</Text>
                            <Text style={{ color: colors.text }} className="text-lg font-bold">
                                {todayCalories.active}
                            </Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                /{calorieGoal} kcal
                            </Text>
                        </View>
                        <View className="items-center">
                            <Text style={{ color: RING_COLORS.exercise, fontWeight: '700', fontSize: 11 }}>Exercise</Text>
                            <Text style={{ color: colors.text }} className="text-lg font-bold">
                                {todayCalories.exercise}
                            </Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                /{exerciseGoal} min
                            </Text>
                        </View>
                        <View className="items-center">
                            <Text style={{ color: RING_COLORS.stand, fontWeight: '700', fontSize: 11 }}>Stand</Text>
                            <Text style={{ color: colors.text }} className="text-lg font-bold">
                                {todayCalories.stand}
                            </Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                /{standGoal} hr
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Active Energy Chart */}
                <View style={glassCard} className="mx-5 mt-4 rounded-2xl p-4">
                    <View className="flex-row items-center mb-3">
                        <Flame size={16} color={RING_COLORS.move} />
                        <Text style={{ color: RING_COLORS.move }} className="font-bold text-sm ml-2">
                            Active Energy
                        </Text>
                    </View>
                    <Text style={{ color: colors.text }} className="text-3xl font-bold">
                        {todayCalories.active} <Text style={{ fontSize: 16, color: colors.textTertiary }}>kcal</Text>
                    </Text>

                    <View className="mt-3">
                        <BarChart
                            data={getActiveChartData()}
                            height={150}
                            barColor={isDark ? '#4a3040' : '#e0b0c0'}
                            todayColor={RING_COLORS.move}
                        />
                    </View>
                </View>

                {/* Resting Energy */}
                <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-4">
                    <View className="flex-row items-center">
                        <View style={{ backgroundColor: accent.amberBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                            <Zap size={18} color={accent.amber} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.textSecondary }} className="text-xs">Resting Energy (BMR)</Text>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {bmr} <Text style={{ fontSize: 14, color: colors.textTertiary }}>kcal/day</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Total Energy */}
                <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-4">
                    <View className="flex-row items-center">
                        <View style={{ backgroundColor: accent.purpleBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                            <Activity size={18} color={accent.purple} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.textSecondary }} className="text-xs">Total Energy Today</Text>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {todayCalories.active + todayCalories.resting}{' '}
                                <Text style={{ fontSize: 14, color: colors.textTertiary }}>kcal</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Exercise Summary */}
                <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-4">
                    <View className="flex-row items-center">
                        <View
                            style={{ backgroundColor: 'rgba(173, 255, 47, 0.12)' }}
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        >
                            <Timer size={18} color={RING_COLORS.exercise} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.textSecondary }} className="text-xs">Exercise Time</Text>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {todayCalories.exercise} <Text style={{ fontSize: 14, color: colors.textTertiary }}>min</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
