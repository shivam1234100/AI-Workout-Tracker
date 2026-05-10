import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgramStore } from '../store/programStore';
import { ArrowLeft, Play, ChevronDown, ChevronUp, Trash2, Edit3, Dumbbell } from 'lucide-react-native';
import { ProgramDayExercise } from '../constants/coachPrograms';

const getDifficultyColor = (d?: string) => {
    switch (d) {
        case 'Beginner': return accent.green;
        case 'Intermediate': return accent.amber;
        case 'Advanced': return accent.red;
        default: return accent.blue;
    }
};

export default function ProgramDetailScreen({ route, navigation }: any) {
    const { program, isCoach } = route.params;
    const { isDark, colors } = useTheme();
    const { startWorkoutFromProgram, activeWorkout } = useWorkoutStore();
    const { deleteProgram } = useProgramStore();
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const handleStartDay = (exercises: ProgramDayExercise[], dayName: string) => {
        if (activeWorkout && activeWorkout.exercises.length > 0) {
            Alert.alert(
                'Active Workout',
                'You have an active workout. Starting this program day will replace it. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Start', style: 'destructive', onPress: () => {
                            startWorkoutFromProgram(exercises, dayName);
                            navigation.navigate('Main', { screen: 'Workout' });
                        }
                    }
                ]
            );
        } else {
            startWorkoutFromProgram(exercises, dayName);
            navigation.navigate('Main', { screen: 'Workout' });
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Program', `Delete "${program.name}"? This cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await deleteProgram(program.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    const handleEdit = () => {
        navigation.navigate('CreateProgram', { editProgram: program });
    };

    const days = program.days || [];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-3 pb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                            <ArrowLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                        {!isCoach && (
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={handleEdit} className="p-2 mr-2">
                                    <Edit3 size={20} color={accent.blue} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} className="p-2">
                                    <Trash2 size={20} color={accent.red} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Text style={{ color: colors.text }} className="text-2xl font-bold">{program.name}</Text>
                    {program.description ? (
                        <Text style={{ color: colors.textSecondary }} className="text-sm mt-2 leading-5">
                            {program.description}
                        </Text>
                    ) : null}

                    <View className="flex-row items-center mt-3 flex-wrap">
                        {program.difficulty && (
                            <View
                                style={{ backgroundColor: getDifficultyColor(program.difficulty) + '20' }}
                                className="px-2.5 py-1 rounded-full mr-2 mb-1"
                            >
                                <Text style={{ color: getDifficultyColor(program.difficulty), fontSize: 11, fontWeight: '700' }}>
                                    {program.difficulty}
                                </Text>
                            </View>
                        )}
                        <View style={{ backgroundColor: isDark ? '#1a2332' : '#eef2ff' }} className="px-2.5 py-1 rounded-full mr-2 mb-1">
                            <Text style={{ color: accent.indigo, fontSize: 11, fontWeight: '600' }}>
                                {days.length} {days.length === 1 ? 'day' : 'days'}
                            </Text>
                        </View>
                        {program.durationWeeks && (
                            <View style={{ backgroundColor: isDark ? '#1a2332' : '#eef2ff' }} className="px-2.5 py-1 rounded-full mb-1">
                                <Text style={{ color: accent.indigo, fontSize: 11, fontWeight: '600' }}>
                                    {program.durationWeeks} weeks
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Days */}
                <View className="px-5 mt-2">
                    <Text style={{ color: colors.text }} className="font-bold text-base mb-3">Workout Days</Text>

                    {days.map((day: any, index: number) => {
                        const isExpanded = expandedDay === (day.id || index.toString());
                        const exercises: ProgramDayExercise[] = day.exercises || [];

                        return (
                            <View key={day.id || index} style={glassCard} className="rounded-2xl mb-3 overflow-hidden">
                                <TouchableOpacity
                                    className="p-4 flex-row items-center"
                                    onPress={() => setExpandedDay(isExpanded ? null : (day.id || index.toString()))}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ backgroundColor: accent.greenBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                                        <Text style={{ color: accent.green, fontWeight: '800', fontSize: 13 }}>{index + 1}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ color: colors.text }} className="font-bold text-sm">{day.name}</Text>
                                        <Text style={{ color: colors.textTertiary, fontSize: 11 }} className="mt-0.5">
                                            {exercises.length} exercises
                                        </Text>
                                    </View>
                                    {isExpanded
                                        ? <ChevronUp size={18} color={colors.textTertiary} />
                                        : <ChevronDown size={18} color={colors.textTertiary} />
                                    }
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight }} className="px-4 pb-4 pt-3">
                                        {exercises.map((ex, i) => (
                                            <View key={i} className="flex-row items-center py-2">
                                                <View style={{ backgroundColor: isDark ? '#1a2332' : '#f3f4f6' }} className="w-7 h-7 rounded-lg items-center justify-center mr-3">
                                                    <Dumbbell size={12} color={colors.textTertiary} />
                                                </View>
                                                <View className="flex-1">
                                                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{ex.name}</Text>
                                                </View>
                                                <Text style={{ color: accent.green, fontSize: 12, fontWeight: '700' }}>
                                                    {ex.suggestedSets}×{ex.suggestedReps}
                                                </Text>
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            className="mt-3 py-2.5 rounded-xl items-center flex-row justify-center"
                                            style={{ backgroundColor: accent.green }}
                                            onPress={() => handleStartDay(exercises, day.name)}
                                            activeOpacity={0.8}
                                        >
                                            <Play size={14} color="#fff" fill="#fff" />
                                            <Text className="text-white font-bold text-sm ml-1.5">Start Day</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
