import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useProgramStore, useProgramDraftStore } from '../store/programStore';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react-native';

export default function CreateProgramScreen({ route, navigation }: any) {
    const editProgram = route?.params?.editProgram;
    const { isDark, colors } = useTheme();
    const { createProgram, updateProgram } = useProgramStore();
    const draft = useProgramDraftStore();

    // Load editProgram into draft only on first mount
    useEffect(() => {
        if (editProgram && draft.editingId !== editProgram.id) {
            draft.loadFrom(editProgram);
        } else if (!editProgram && !draft.name && draft.days.length === 0) {
            // Fresh draft - don't reset if user already started
        }
    }, []);

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const inputStyle = {
        backgroundColor: colors.inputBg || (isDark ? '#1a1f2e' : '#f9fafb'),
        borderWidth: 1,
        borderColor: colors.borderInput || colors.borderLight,
        color: colors.text,
    };

    const addDay = () => {
        draft.setDays([...draft.days, {
            id: Math.random().toString(),
            name: `Day ${draft.days.length + 1}`,
            exercises: [],
        }]);
    };

    const removeDay = (id: string) => {
        draft.setDays(draft.days.filter(d => d.id !== id));
    };

    const updateDayName = (id: string, newName: string) => {
        draft.setDays(draft.days.map(d => d.id === id ? { ...d, name: newName } : d));
    };

    const removeExerciseFromDay = (dayId: string, exerciseIndex: number) => {
        draft.setDays(draft.days.map(d => {
            if (d.id !== dayId) return d;
            return { ...d, exercises: d.exercises.filter((_, i) => i !== exerciseIndex) };
        }));
    };

    const updateExerciseField = (dayId: string, exIndex: number, field: 'suggestedSets' | 'suggestedReps', value: string) => {
        draft.setDays(draft.days.map(d => {
            if (d.id !== dayId) return d;
            const exercises = [...d.exercises];
            exercises[exIndex] = { ...exercises[exIndex], [field]: parseInt(value) || 0 };
            return { ...d, exercises };
        }));
    };

    const handleSave = async () => {
        if (!draft.name.trim()) {
            Alert.alert('Error', 'Please enter a program name');
            return;
        }
        if (draft.days.length === 0) {
            Alert.alert('Error', 'Add at least one day to your program');
            return;
        }

        const data = {
            name: draft.name.trim(),
            description: draft.description.trim() || undefined,
            difficulty: draft.difficulty,
            durationWeeks: parseInt(draft.durationWeeks) || undefined,
            days: draft.days.map((d, i) => ({
                name: d.name,
                order: i,
                exercises: d.exercises,
            })),
        };

        try {
            if (editProgram) {
                await updateProgram(editProgram.id, data);
            } else {
                await createProgram(data);
            }
            draft.reset();
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Save failed', e?.message || 'Could not save program. Make sure the backend is running.');
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Discard changes?',
            'Your program draft will be lost.',
            [
                { text: 'Keep editing', style: 'cancel' },
                {
                    text: 'Discard', style: 'destructive', onPress: () => {
                        draft.reset();
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={handleCancel} className="p-1 mr-3">
                            <ArrowLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text }} className="text-xl font-bold">
                            {editProgram ? 'Edit Program' : 'Create Program'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSave}
                        className="px-4 py-2 rounded-full flex-row items-center"
                        style={{ backgroundColor: accent.green }}
                        activeOpacity={0.8}
                    >
                        <Check size={16} color="#fff" />
                        <Text className="text-white font-bold text-sm ml-1">Save</Text>
                    </TouchableOpacity>
                </View>

                <View className="px-5 mt-2">
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-1.5 uppercase tracking-wider">
                        Program Name *
                    </Text>
                    <TextInput
                        style={[inputStyle, { fontSize: 15 }]}
                        className="rounded-xl px-4 py-3 mb-4"
                        placeholder="e.g. My Push Pull Legs"
                        placeholderTextColor={colors.textTertiary}
                        value={draft.name}
                        onChangeText={(v) => draft.setField('name', v)}
                    />

                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-1.5 uppercase tracking-wider">
                        Description
                    </Text>
                    <TextInput
                        style={[inputStyle, { fontSize: 14 }]}
                        className="rounded-xl px-4 py-3 mb-4"
                        placeholder="Brief description of your program"
                        placeholderTextColor={colors.textTertiary}
                        value={draft.description}
                        onChangeText={(v) => draft.setField('description', v)}
                        multiline
                        numberOfLines={2}
                    />

                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-1.5 uppercase tracking-wider">
                        Difficulty
                    </Text>
                    <View className="flex-row mb-4">
                        {difficulties.map(d => (
                            <TouchableOpacity
                                key={d}
                                className="mr-2 px-3.5 py-2 rounded-xl"
                                style={{
                                    backgroundColor: draft.difficulty === d
                                        ? getDifficultyColor(d) + '20'
                                        : isDark ? '#1a1f2e' : '#f3f4f6',
                                    borderWidth: draft.difficulty === d ? 1.5 : 1,
                                    borderColor: draft.difficulty === d ? getDifficultyColor(d) : colors.borderLight,
                                }}
                                onPress={() => draft.setField('difficulty', d)}
                            >
                                <Text style={{
                                    color: draft.difficulty === d ? getDifficultyColor(d) : colors.textSecondary,
                                    fontSize: 12, fontWeight: '700',
                                }}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-1.5 uppercase tracking-wider">
                        Duration (weeks)
                    </Text>
                    <TextInput
                        style={[inputStyle, { fontSize: 15, width: 100 }]}
                        className="rounded-xl px-4 py-3 mb-6"
                        placeholder="e.g. 8"
                        placeholderTextColor={colors.textTertiary}
                        value={draft.durationWeeks}
                        onChangeText={(v) => draft.setField('durationWeeks', v)}
                        keyboardType="numeric"
                    />
                </View>

                <View className="px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text style={{ color: colors.text }} className="font-bold text-base">
                            Workout Days ({draft.days.length})
                        </Text>
                        <TouchableOpacity
                            className="flex-row items-center px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: accent.green }}
                            onPress={addDay}
                            activeOpacity={0.8}
                        >
                            <Plus size={14} color="#fff" />
                            <Text className="text-white font-semibold text-xs ml-1">Add Day</Text>
                        </TouchableOpacity>
                    </View>

                    {draft.days.map((day, dayIndex) => (
                        <View key={day.id} style={glassCard} className="rounded-2xl mb-3 p-4">
                            <View className="flex-row items-center mb-3">
                                <View style={{ backgroundColor: accent.greenBg }} className="w-8 h-8 rounded-lg items-center justify-center mr-2.5">
                                    <Text style={{ color: accent.green, fontWeight: '800', fontSize: 12 }}>{dayIndex + 1}</Text>
                                </View>
                                <TextInput
                                    style={[inputStyle, { flex: 1, fontSize: 14 }]}
                                    className="rounded-lg px-3 py-2"
                                    value={day.name}
                                    onChangeText={(v) => updateDayName(day.id, v)}
                                    placeholder="Day name"
                                    placeholderTextColor={colors.textTertiary}
                                />
                                <TouchableOpacity onPress={() => removeDay(day.id)} className="ml-2 p-1.5">
                                    <Trash2 size={16} color={accent.red} />
                                </TouchableOpacity>
                            </View>

                            {day.exercises.map((ex, exIndex) => (
                                <View key={exIndex} className="flex-row items-center py-2 ml-10"
                                    style={{ borderTopWidth: exIndex > 0 ? 1 : 0, borderTopColor: colors.borderLight }}>
                                    <Text style={{ color: colors.text, fontSize: 13, flex: 1 }} numberOfLines={1}>
                                        {ex.name}
                                    </Text>
                                    <TextInput
                                        style={[inputStyle, { width: 38, textAlign: 'center', fontSize: 12 }]}
                                        className="rounded-md px-1 py-1 mx-1"
                                        value={ex.suggestedSets.toString()}
                                        onChangeText={(v) => updateExerciseField(day.id, exIndex, 'suggestedSets', v)}
                                        keyboardType="numeric"
                                    />
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>×</Text>
                                    <TextInput
                                        style={[inputStyle, { width: 38, textAlign: 'center', fontSize: 12 }]}
                                        className="rounded-md px-1 py-1 mx-1"
                                        value={ex.suggestedReps.toString()}
                                        onChangeText={(v) => updateExerciseField(day.id, exIndex, 'suggestedReps', v)}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity onPress={() => removeExerciseFromDay(day.id, exIndex)} className="ml-1 p-1">
                                        <Trash2 size={13} color={accent.red} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                className="flex-row items-center justify-center py-2 mt-2 rounded-xl"
                                style={{ backgroundColor: isDark ? '#1a2332' : '#f0fdf4', borderWidth: 1, borderColor: accent.green + '30' }}
                                onPress={() => navigation.navigate('Main', { screen: 'Exercises', params: { mode: 'program', forDayId: day.id } })}
                                activeOpacity={0.7}
                            >
                                <Plus size={14} color={accent.green} />
                                <Text style={{ color: accent.green, fontSize: 12, fontWeight: '600' }} className="ml-1">
                                    Add Exercise
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {draft.days.length === 0 && (
                        <View style={glassCard} className="rounded-2xl p-6 items-center">
                            <Text style={{ color: colors.textTertiary }} className="text-sm text-center">
                                Add workout days to your program
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const getDifficultyColor = (d?: string) => {
    switch (d) {
        case 'Beginner': return accent.green;
        case 'Intermediate': return accent.amber;
        case 'Advanced': return accent.red;
        default: return accent.blue;
    }
};
