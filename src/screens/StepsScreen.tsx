import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useHealthStore } from '../store/healthStore';
import BarChart from '../components/BarChart';
import { ArrowLeft, Flame, Target, TrendingUp, Footprints } from 'lucide-react-native';

type Period = 'D' | 'W' | 'M';

const DAY_LABELS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StepsScreen({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const {
        todaySteps,
        stepGoal,
        getStepsForRange,
        getAverageSteps,
        isPedometerAvailable,
    } = useHealthStore();

    const [period, setPeriod] = useState<Period>('W');

    const getChartData = () => {
        const todayDate = new Date().toISOString().split('T')[0];
        if (period === 'D') {
            // For daily view, show hourly breakdown (estimated from total)
            const currentHour = new Date().getHours();
            const hours = [];
            for (let h = 0; h < 24; h += 3) {
                // Distribute steps across active hours proportionally
                const isActive = h <= currentHour;
                const hourSteps = isActive && currentHour > 0
                    ? Math.round(todaySteps * (1 / (currentHour / 3 + 1)))
                    : 0;
                hours.push({
                    label: h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`,
                    value: hourSteps,
                    isToday: false,
                });
            }
            return hours;
        }
        if (period === 'W') {
            const data = getStepsForRange(7);
            return data.map((d) => {
                const date = new Date(d.date + 'T12:00:00');
                return {
                    label: DAY_LABELS_SHORT[date.getDay()],
                    value: d.steps,
                    isToday: d.date === todayDate,
                };
            });
        }
        // Monthly
        const data = getStepsForRange(30);
        return data.map((d, i) => {
            const date = new Date(d.date + 'T12:00:00');
            return {
                label: i % 5 === 0 ? `${date.getDate()}` : '',
                value: d.steps,
                isToday: d.date === todayDate,
            };
        });
    };

    const getTotal = () => {
        if (period === 'D') return todaySteps;
        const days = period === 'W' ? 7 : 30;
        const data = getStepsForRange(days);
        return data.reduce((a, b) => a + b.steps, 0);
    };

    const getAvg = () => {
        const days = period === 'D' ? 1 : period === 'W' ? 7 : 30;
        return getAverageSteps(days);
    };

    const getDateLabel = () => {
        const now = new Date();
        if (period === 'D') {
            return `${now.getDate()} ${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`;
        }
        if (period === 'W') {
            const start = new Date();
            start.setDate(start.getDate() - 6);
            return `${start.getDate()} ${MONTH_LABELS[start.getMonth()]} – ${now.getDate()} ${MONTH_LABELS[now.getMonth()]}`;
        }
        return `${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`;
    };

    const distance = ((todaySteps * 0.762) / 1000).toFixed(1); // avg stride 0.762m
    const calories = Math.round(todaySteps * 0.04);
    const goalProgress = stepGoal > 0 ? todaySteps / stepGoal : 0;

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
                    <Text style={{ color: colors.text }} className="text-xl font-bold flex-1">Steps</Text>
                    {!isPedometerAvailable && (
                        <View style={{ backgroundColor: accent.amberBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                            <Text style={{ color: accent.amber, fontSize: 10, fontWeight: '600' }}>No Sensor</Text>
                        </View>
                    )}
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

                {/* Total Steps Card */}
                <View style={glassCard} className="mx-5 mt-4 rounded-2xl p-5">
                    <Text style={{ color: colors.textTertiary }} className="text-xs font-semibold uppercase tracking-wider">
                        {period === 'D' ? 'Today' : 'Total'}
                    </Text>
                    <View className="flex-row items-baseline mt-1">
                        <Text style={{ color: '#ff6b35' }} className="text-4xl font-bold">
                            {getTotal().toLocaleString()}
                        </Text>
                        <Text style={{ color: '#ff6b35' }} className="text-lg ml-1 font-semibold">
                            steps
                        </Text>
                    </View>
                    <Text style={{ color: colors.textTertiary }} className="text-xs mt-1">
                        {getDateLabel()}
                    </Text>

                    {/* Bar Chart */}
                    <View className="mt-4">
                        <BarChart
                            data={getChartData()}
                            height={180}
                            barColor={isDark ? '#4a4a4a' : '#c0c0c0'}
                            todayColor="#ff6b35"
                            showGoalLine={period !== 'D'}
                            goal={stepGoal}
                            goalColor={accent.green}
                        />
                    </View>

                    {/* Goal line label */}
                    {period !== 'D' && (
                        <View className="flex-row items-center mt-2">
                            <View style={{ width: 16, height: 2, backgroundColor: accent.green, marginRight: 6 }} />
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                                Goal: {stepGoal.toLocaleString()} steps
                            </Text>
                        </View>
                    )}
                </View>

                {/* Average Card */}
                <View style={glassCard} className="mx-5 mt-3 rounded-2xl p-4">
                    <View className="flex-row items-center justify-between">
                        <Text style={{ color: colors.text }} className="text-sm font-bold">Average</Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                            {period === 'D' ? 'Today' : period === 'W' ? 'Last 7 days' : 'Last 30 days'}
                        </Text>
                    </View>
                    <Text style={{ color: '#ff6b35' }} className="text-2xl font-bold mt-1">
                        {getAvg().toLocaleString()} <Text style={{ fontSize: 14, color: colors.textTertiary }}>steps/day</Text>
                    </Text>
                </View>

                {/* Today's Highlights */}
                <View className="px-5 mt-5">
                    <Text style={{ color: colors.text }} className="font-bold text-base mb-3">Today's Details</Text>

                    <View className="flex-row">
                        <View style={glassCard} className="flex-1 rounded-2xl p-4 mr-2">
                            <View style={{ backgroundColor: '#ff6b3520' }} className="w-10 h-10 rounded-xl items-center justify-center mb-2">
                                <Target size={18} color="#ff6b35" />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {Math.min(Math.round(goalProgress * 100), 100)}%
                            </Text>
                            <Text style={{ color: colors.textTertiary }} className="text-xs">Goal Progress</Text>
                        </View>

                        <View style={glassCard} className="flex-1 rounded-2xl p-4 ml-2">
                            <View style={{ backgroundColor: accent.greenBg }} className="w-10 h-10 rounded-xl items-center justify-center mb-2">
                                <TrendingUp size={18} color={accent.green} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">{distance} km</Text>
                            <Text style={{ color: colors.textTertiary }} className="text-xs">Distance</Text>
                        </View>
                    </View>

                    <View className="flex-row mt-3">
                        <View style={glassCard} className="flex-1 rounded-2xl p-4 mr-2">
                            <View style={{ backgroundColor: accent.redBg }} className="w-10 h-10 rounded-xl items-center justify-center mb-2">
                                <Flame size={18} color={accent.red} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">{calories}</Text>
                            <Text style={{ color: colors.textTertiary }} className="text-xs">Calories Burned</Text>
                        </View>

                        <View style={glassCard} className="flex-1 rounded-2xl p-4 ml-2">
                            <View style={{ backgroundColor: accent.amberBg }} className="w-10 h-10 rounded-xl items-center justify-center mb-2">
                                <Footprints size={18} color={accent.amber} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {todaySteps.toLocaleString()}
                            </Text>
                            <Text style={{ color: colors.textTertiary }} className="text-xs">Steps Today</Text>
                        </View>
                    </View>
                </View>

                {/* Highlights */}
                <View style={glassCard} className="mx-5 mt-5 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                        <Flame size={16} color="#ff6b35" />
                        <Text style={{ color: colors.text }} className="font-bold text-sm ml-2">Highlights</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Footprints size={14} color="#ff6b35" />
                        <Text style={{ color: colors.textSecondary, flex: 1, marginLeft: 8, fontSize: 13, lineHeight: 18 }}>
                            {todaySteps >= stepGoal
                                ? "Great job! You've reached your daily step goal! 🎉"
                                : todaySteps === 0
                                ? isPedometerAvailable
                                    ? "Start walking to begin tracking your steps!"
                                    : "Step sensor not available on this device. Steps will show 0."
                                : `${(stepGoal - todaySteps).toLocaleString()} more steps to reach your daily goal of ${stepGoal.toLocaleString()}.`}
                        </Text>
                    </View>
                    {getAverageSteps(7) > 0 && (
                        <View className="flex-row items-center mt-2">
                            <TrendingUp size={14} color={accent.green} />
                            <Text style={{ color: colors.textSecondary, flex: 1, marginLeft: 8, fontSize: 13, lineHeight: 18 }}>
                                Your weekly average is {getAverageSteps(7).toLocaleString()} steps/day.
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
