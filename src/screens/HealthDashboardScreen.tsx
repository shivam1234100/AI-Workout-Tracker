import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useHealthStore } from '../store/healthStore';
import { useAuthStore } from '../store/authStore';
import ActivityRings from '../components/ActivityRings';
import BarChart from '../components/BarChart';
import {
    Footprints,
    Flame,
    Zap,
    ChevronRight,
    Route,
    Activity,
    Heart,
} from 'lucide-react-native';

const RING_COLORS = {
    move: '#FF2D55',
    moveBg: 'rgba(255, 45, 85, 0.2)',
    exercise: '#ADFF2F',
    exerciseBg: 'rgba(173, 255, 47, 0.2)',
    stand: '#00CED1',
    standBg: 'rgba(0, 206, 209, 0.2)',
};

function computeBMR(weight?: number | null, height?: number | null, gender?: string | null): number {
    const w = weight || 70;
    const h = height || 170;
    const age = 25;
    if (gender === 'female') return Math.round(10 * w + 6.25 * h - 5 * age - 161);
    return Math.round(10 * w + 6.25 * h - 5 * age + 5);
}

export default function HealthDashboardScreen({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const { user } = useAuthStore();
    const {
        todaySteps,
        stepGoal,
        todayCalories,
        calorieGoal,
        exerciseGoal,
        standGoal,
        getStepsForRange,
    } = useHealthStore();

    // All pedometer syncing, calorie calculations, and history fetching
    // are handled globally by useHealthSync() in App.tsx — no local init needed

    const moveProgress = calorieGoal > 0 ? todayCalories.active / calorieGoal : 0;
    const exerciseProgress = exerciseGoal > 0 ? todayCalories.exercise / exerciseGoal : 0;
    const standProgress = standGoal > 0 ? todayCalories.stand / standGoal : 0;

    const distance = ((todaySteps * 0.762) / 1000).toFixed(1);
    const bmr = computeBMR(user?.weight, user?.height, user?.gender);

    const weekSteps = getStepsForRange(7);
    const todayDate = new Date().toISOString().split('T')[0];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekChartData = weekSteps.map((d) => {
        const date = new Date(d.date + 'T12:00:00');
        return {
            label: dayLabels[date.getDay()],
            value: d.steps,
            isToday: d.date === todayDate,
        };
    });

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const HealthCard = ({ icon, iconBg, title, value, unit, subtitle, onPress, rightElement }: any) => (
        <TouchableOpacity
            style={glassCard}
            className="rounded-2xl p-4 mb-3"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View style={{ backgroundColor: iconBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                        {icon}
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: title === 'Steps' ? '#ff6b35' : colors.textSecondary }} className="text-xs font-semibold">
                            {title}
                        </Text>
                        <View className="flex-row items-baseline">
                            <Text style={{ color: colors.text }} className="text-2xl font-bold">
                                {value}
                            </Text>
                            {unit && (
                                <Text style={{ color: colors.textTertiary }} className="text-sm ml-1">
                                    {unit}
                                </Text>
                            )}
                        </View>
                        {subtitle && (
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{subtitle}</Text>
                        )}
                    </View>
                </View>
                {rightElement || <ChevronRight size={18} color={colors.textTertiary} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4 pb-2">
                    <Text style={{ color: colors.text }} className="text-2xl font-bold">Health</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">Today's Summary</Text>
                </View>

                {/* Activity Rings Card */}
                <TouchableOpacity
                    style={glassCard}
                    className="mx-5 mt-3 rounded-2xl p-5"
                    onPress={() => navigation.navigate('CalorieDetail')}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <Activity size={16} color={RING_COLORS.move} />
                            <Text style={{ color: RING_COLORS.move }} className="font-bold text-sm ml-2">Activity</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textTertiary} />
                    </View>

                    <View className="flex-row items-center">
                        <ActivityRings
                            size={100}
                            strokeWidth={10}
                            rings={[
                                { progress: moveProgress, color: RING_COLORS.move, bgColor: RING_COLORS.moveBg },
                                { progress: exerciseProgress, color: RING_COLORS.exercise, bgColor: RING_COLORS.exerciseBg },
                                { progress: standProgress, color: RING_COLORS.stand, bgColor: RING_COLORS.standBg },
                            ]}
                        />
                        <View className="ml-5 flex-1">
                            <View className="flex-row items-center mb-2">
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RING_COLORS.move, marginRight: 8 }} />
                                <Text style={{ color: RING_COLORS.move, fontSize: 12, fontWeight: '600' }}>Move</Text>
                                <Text style={{ color: colors.text, marginLeft: 'auto', fontWeight: '700' }}>
                                    {todayCalories.active} <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '400' }}>/{calorieGoal} kcal</Text>
                                </Text>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RING_COLORS.exercise, marginRight: 8 }} />
                                <Text style={{ color: RING_COLORS.exercise, fontSize: 12, fontWeight: '600' }}>Exercise</Text>
                                <Text style={{ color: colors.text, marginLeft: 'auto', fontWeight: '700' }}>
                                    {todayCalories.exercise} <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '400' }}>/{exerciseGoal} min</Text>
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RING_COLORS.stand, marginRight: 8 }} />
                                <Text style={{ color: RING_COLORS.stand, fontSize: 12, fontWeight: '600' }}>Stand</Text>
                                <Text style={{ color: colors.text, marginLeft: 'auto', fontWeight: '700' }}>
                                    {todayCalories.stand} <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '400' }}>/{standGoal} hr</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Steps Card with mini chart */}
                <TouchableOpacity
                    style={glassCard}
                    className="mx-5 mt-3 rounded-2xl p-4"
                    onPress={() => navigation.navigate('StepsDetail')}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <Footprints size={16} color="#ff6b35" />
                            <Text style={{ color: '#ff6b35' }} className="font-bold text-sm ml-2">Steps</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textTertiary} />
                    </View>
                    <Text style={{ color: colors.text }} className="text-3xl font-bold">
                        {todaySteps.toLocaleString()} <Text style={{ fontSize: 14, color: colors.textTertiary }}>steps</Text>
                    </Text>
                    <View className="mt-3">
                        <BarChart
                            data={weekChartData}
                            height={120}
                            barColor={isDark ? '#4a4a4a' : '#c0c0c0'}
                            todayColor="#ff6b35"
                        />
                    </View>
                </TouchableOpacity>

                {/* Health Data Cards */}
                <View className="px-5 mt-5">
                    <Text style={{ color: colors.text }} className="font-bold text-base mb-3">All Health Data</Text>

                    <HealthCard
                        icon={<Flame size={18} color={accent.red} />}
                        iconBg={accent.redBg}
                        title="Active Energy"
                        value={todayCalories.active}
                        unit="kcal"
                        onPress={() => navigation.navigate('CalorieDetail')}
                    />

                    <HealthCard
                        icon={<Zap size={18} color={accent.amber} />}
                        iconBg={accent.amberBg}
                        title="Resting Energy"
                        value={bmr}
                        unit="kcal/day"
                        onPress={() => navigation.navigate('CalorieDetail')}
                    />

                    <HealthCard
                        icon={<Route size={18} color={accent.cyan} />}
                        iconBg={accent.cyanBg}
                        title="Walking + Running Distance"
                        value={distance}
                        unit="km"
                        onPress={() => navigation.navigate('StepsDetail')}
                    />

                    <HealthCard
                        icon={<Heart size={18} color={RING_COLORS.move} />}
                        iconBg={RING_COLORS.moveBg}
                        title="Total Calories"
                        value={todayCalories.active + todayCalories.resting}
                        unit="kcal"
                        subtitle="Active + Resting"
                        onPress={() => navigation.navigate('CalorieDetail')}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
