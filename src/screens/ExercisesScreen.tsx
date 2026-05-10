import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_EXERCISES } from '../constants/mockData';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgramDraftStore } from '../store/programStore';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { Search, Plus, Dumbbell, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Full Body'];

export default function ExercisesScreen({ navigation, route }: any) {
    const { activeWorkout, addExercise, startWorkout } = useWorkoutStore();
    const addExerciseToDay = useProgramDraftStore((s) => s.addExerciseToDay);
    const mode = route?.params?.mode;
    const forDayId = route?.params?.forDayId;

    const handleAddExercise = (item: any) => {
        if (mode === 'program' && forDayId) {
            addExerciseToDay(forDayId, {
                exerciseId: item._id,
                name: item.name,
                suggestedSets: 3,
                suggestedReps: 10,
            });
            navigation.setParams({ mode: undefined, forDayId: undefined });
            navigation.navigate('CreateProgram');
            return;
        }
        if (!activeWorkout) startWorkout();
        addExercise(item);
        navigation.navigate('Workout');
    };
    const { isDark, colors } = useTheme();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filtered = MOCK_EXERCISES.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || e.muscleGroup === filter;
        return matchesSearch && matchesFilter;
    });

    const getDifficultyColor = (d: string) => {
        switch (d) {
            case 'Beginner': return accent.green;
            case 'Intermediate': return accent.amber;
            case 'Advanced': return accent.red;
            default: return accent.blue;
        }
    };

    const getDifficultyBg = (d: string) => {
        switch (d) {
            case 'Beginner': return accent.greenBg;
            case 'Intermediate': return accent.amberBg;
            case 'Advanced': return accent.redBg;
            default: return accent.blueBg;
        }
    };

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="px-5 pt-3">
                <Text style={{ color: colors.text, letterSpacing: -0.5 }} className="text-2xl font-bold mb-1">Exercises</Text>
                <Text style={{ color: colors.textTertiary }} className="text-sm mb-4">{MOCK_EXERCISES.length} exercises available</Text>

                {/* Search */}
                <View style={{ ...glassCard, borderColor: colors.borderInput }} className="flex-row items-center px-4 py-3.5 rounded-2xl mb-4">
                    <Search size={18} color={colors.textTertiary} />
                    <TextInput
                        className="flex-1 ml-3 text-base"
                        style={{ color: colors.text }}
                        placeholder="Search exercises..."
                        placeholderTextColor={colors.textTertiary}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Filters */}
                <FlatList
                    horizontal
                    data={MUSCLE_GROUPS}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    className="mb-4"
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                backgroundColor: filter === item ? accent.green : colors.card,
                                borderWidth: 1,
                                borderColor: filter === item ? accent.green : colors.borderLight,
                                ...(filter === item ? shadows.glow(accent.green) : {}),
                            }}
                            className="px-4 py-2.5 rounded-xl mr-2"
                            onPress={() => setFilter(item)}
                        >
                            <Text style={{ color: filter === item ? 'white' : colors.textSecondary }} className="text-sm font-bold">{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={glassCard}
                        className="rounded-2xl mb-3 overflow-hidden flex-row"
                        onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={{ width: 88, height: 88 }}
                            contentFit="cover"
                        />
                        <View className="flex-1 p-4 justify-center">
                            <Text style={{ color: colors.text }} className="font-bold text-sm">{item.name}</Text>
                            <View className="flex-row items-center mt-2">
                                <View style={{ backgroundColor: getDifficultyBg(item.difficulty) }} className="px-2.5 py-1 rounded-lg mr-2">
                                    <Text style={{ color: getDifficultyColor(item.difficulty) }} className="text-xs font-bold">{item.difficulty}</Text>
                                </View>
                                <Text style={{ color: colors.textTertiary }} className="text-xs font-medium">{item.muscleGroup}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ backgroundColor: accent.greenBg }}
                            className="w-14 items-center justify-center"
                            onPress={() => handleAddExercise(item)}
                        >
                            <View style={{ backgroundColor: accent.green, ...shadows.glow(accent.green) }} className="w-8 h-8 rounded-xl items-center justify-center">
                                <Plus size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
