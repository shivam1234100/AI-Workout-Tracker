import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, Dumbbell } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function WorkoutDetailScreen({ route, navigation }: any) {
    const { workout } = route.params;
    const { isDark, colors } = useTheme();

    const getSets = (sets: any) => {
        if (!sets) return [];
        if (Array.isArray(sets)) return sets;
        if (typeof sets === 'string') { try { return JSON.parse(sets); } catch { return []; } }
        return [];
    };

    if (!workout) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="justify-center items-center">
                <Text style={{ color: colors.textSecondary }}>Workout not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-blue-600 font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{ backgroundColor: colors.card, borderBottomColor: colors.border }} className="p-4 border-b flex-row items-center shadow-sm">
                <TouchableOpacity
                    style={{ backgroundColor: colors.cardAlt }}
                    className="mr-4 p-2 rounded-full"
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-xl font-bold">{workout.name || 'Workout Details'}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">{formatDate(workout.endTime)}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Stats Summary */}
                <View className="flex-row justify-between mb-6">
                    <View style={{ backgroundColor: colors.card }} className="p-4 rounded-xl flex-1 mr-2 shadow-sm items-center">
                        <Dumbbell size={20} color="#2563eb" className="mb-1" />
                        <Text style={{ color: colors.text }} className="text-lg font-bold">{workout.exercises?.length || 0}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-xs text-center">Exercises</Text>
                    </View>
                    <View style={{ backgroundColor: colors.card }} className="p-4 rounded-xl flex-1 ml-2 shadow-sm items-center">
                        <Clock size={20} color="#10b981" className="mb-1" />
                        <Text style={{ color: colors.text }} className="text-lg font-bold">
                            {workout.startTime && workout.endTime
                                ? Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000) + 'm'
                                : '-'}
                        </Text>
                        <Text style={{ color: colors.textSecondary }} className="text-xs text-center">Duration</Text>
                    </View>
                </View>

                {/* Exercises List */}
                <Text style={{ color: colors.text }} className="text-lg font-bold mb-3">Exercises Performed</Text>
                {workout.exercises?.map((exercise: any, exIndex: number) => (
                    <View key={exercise.id || exIndex} style={{ backgroundColor: colors.card }} className="rounded-xl p-4 mb-4 shadow-sm">
                        <Text style={{ color: colors.text }} className="text-lg font-bold mb-3">{exercise.name}</Text>

                        <View style={{ borderBottomColor: colors.border }} className="flex-row mb-2 border-b pb-2">
                            <Text style={{ color: colors.textTertiary }} className="w-10 text-xs font-bold uppercase text-center">Set</Text>
                            <Text style={{ color: colors.textTertiary }} className="flex-1 text-xs font-bold uppercase text-center">kg</Text>
                            <Text style={{ color: colors.textTertiary }} className="flex-1 text-xs font-bold uppercase text-center">Reps</Text>
                        </View>

                        {getSets(exercise.sets).map((set: any, setIndex: number) => (
                            <View key={set.id || setIndex} className="flex-row items-center py-2">
                                <View className="w-10 items-center justify-center">
                                    <View style={{ backgroundColor: colors.cardAlt }} className="w-6 h-6 rounded-full items-center justify-center">
                                        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">{setIndex + 1}</Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.text }} className="flex-1 text-center font-medium">{set.weight || 0}</Text>
                                <Text style={{ color: colors.text }} className="flex-1 text-center font-medium">{set.reps || 0}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
