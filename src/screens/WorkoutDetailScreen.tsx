import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { ArrowLeft, Dumbbell, Clock, TrendingUp } from 'lucide-react-native';

export default function WorkoutDetailScreen({ route, navigation }: any) {
    const { workout } = route.params;
    const { colors } = useTheme();

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const totalSets = workout.exercises?.reduce((a: number, e: any) =>
        a + (Array.isArray(e.sets) ? e.sets.length : 0), 0) || 0;
    const totalVolume = Math.round(workout.exercises?.reduce((acc: number, e: any) =>
        acc + (Array.isArray(e.sets) ? e.sets.reduce((s: number, set: any) =>
            s + ((set.weight || 0) * (set.reps || 0)), 0) : 0), 0) || 0);
    const duration = workout.startTime && workout.endTime
        ? Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000)
        : null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-3 pb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ color: colors.text }} className="text-2xl font-bold">{workout.name || 'Workout'}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                        {new Date(workout.date || workout.endTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>

                {/* Stats */}
                <View className="px-4 flex-row mb-4">
                    <View style={glassCard} className="flex-1 mx-1 rounded-2xl p-3">
                        <View style={{ backgroundColor: accent.indigoBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                            <Dumbbell size={16} color={accent.indigo} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-xl font-bold">{workout.exercises?.length || 0}</Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Exercises</Text>
                    </View>
                    <View style={glassCard} className="flex-1 mx-1 rounded-2xl p-3">
                        <View style={{ backgroundColor: accent.amberBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                            <TrendingUp size={16} color={accent.amber} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-xl font-bold">{totalSets}</Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Total Sets</Text>
                    </View>
                    {duration !== null && (
                        <View style={glassCard} className="flex-1 mx-1 rounded-2xl p-3">
                            <View style={{ backgroundColor: accent.cyanBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                                <Clock size={16} color={accent.cyan} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">{duration}m</Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Duration</Text>
                        </View>
                    )}
                </View>

                {totalVolume > 0 && (
                    <View style={glassCard} className="mx-5 rounded-2xl p-4 mb-4 flex-row items-center">
                        <View style={{ backgroundColor: accent.greenBg }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                            <TrendingUp size={20} color={accent.green} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total Volume</Text>
                            <Text style={{ color: colors.text }} className="text-2xl font-bold">{totalVolume.toLocaleString()} kg</Text>
                        </View>
                    </View>
                )}

                {/* Exercises */}
                <View className="px-5">
                    <Text style={{ color: colors.text }} className="font-bold text-base mb-3">Exercises</Text>
                    {workout.exercises?.map((exercise: any, idx: number) => (
                        <View key={exercise.id || idx} style={glassCard} className="rounded-2xl p-4 mb-3">
                            <Text style={{ color: colors.text }} className="font-bold text-base mb-2">{exercise.name}</Text>
                            <View className="flex-row pb-2" style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                                <Text style={{ color: colors.textTertiary, fontSize: 11, width: 40 }}>SET</Text>
                                <Text style={{ color: colors.textTertiary, fontSize: 11, flex: 1, textAlign: 'center' }}>WEIGHT</Text>
                                <Text style={{ color: colors.textTertiary, fontSize: 11, flex: 1, textAlign: 'center' }}>REPS</Text>
                            </View>
                            {Array.isArray(exercise.sets) && exercise.sets.map((s: any, i: number) => (
                                <View key={i} className="flex-row py-2" style={{ borderBottomWidth: i < exercise.sets.length - 1 ? 0.5 : 0, borderBottomColor: colors.borderLight }}>
                                    <Text style={{ color: colors.textSecondary, width: 40, fontWeight: '700' }}>{i + 1}</Text>
                                    <Text style={{ color: colors.text, flex: 1, textAlign: 'center', fontWeight: '600' }}>{s.weight || 0} kg</Text>
                                    <Text style={{ color: colors.text, flex: 1, textAlign: 'center', fontWeight: '600' }}>{s.reps || 0}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
