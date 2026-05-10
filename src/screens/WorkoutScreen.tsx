import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutStore } from '../store/workoutStore';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import CircularProgress from '../components/CircularProgress';
import { Plus, Trash2, Check, PlayCircle, X, Dumbbell, Zap } from 'lucide-react-native';

export default function WorkoutScreen({ navigation }: any) {
    const { activeWorkout, startWorkout, finishWorkout, addSet, updateSet, removeSet, removeExercise } = useWorkoutStore();
    const { isDark, colors } = useTheme();
    const [duration, setDuration] = useState(0);
    const [isFinishModalVisible, setFinishModalVisible] = useState(false);
    const [workoutName, setWorkoutName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeWorkout && activeWorkout.startTime) {
            interval = setInterval(() => {
                setDuration(Math.floor((Date.now() - (activeWorkout.startTime || Date.now())) / 1000));
            }, 1000);
        } else { setDuration(0); }
        return () => clearInterval(interval);
    }, [activeWorkout, activeWorkout?.startTime]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleFinishPress = () => { setWorkoutName(''); setFinishModalVisible(true); };
    const confirmFinish = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await finishWorkout(workoutName.trim() || undefined);
            setFinishModalVisible(false);
            navigation.navigate('History');
        } catch (e) {
            Alert.alert('Error', 'Failed to save workout. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const durationProgress = Math.min(duration / 3600, 1);

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    if (!activeWorkout) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="justify-center items-center p-6">
                <View style={{ backgroundColor: accent.greenBg, ...shadows.glow(accent.green) }} className="w-28 h-28 rounded-full items-center justify-center mb-8">
                    <Dumbbell size={44} color={accent.green} />
                </View>
                <Text style={{ color: colors.text, letterSpacing: -0.5 }} className="text-3xl font-bold mb-2">Ready to Train?</Text>
                <Text style={{ color: colors.textSecondary, lineHeight: 22 }} className="mb-10 text-center text-base">Start a new workout session to track your sets, reps, and progress.</Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: accent.green,
                        ...shadows.glow(accent.green),
                    }}
                    className="px-12 py-4.5 rounded-2xl flex-row items-center"
                    onPress={startWorkout}
                    activeOpacity={0.8}
                >
                    <Zap size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Start Workout</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const completedSets = activeWorkout.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
    const totalSets = activeWorkout.exercises.reduce((a, e) => a + e.sets.length, 0);
    const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header with timer */}
            <View style={{ backgroundColor: colors.card, borderBottomColor: colors.borderLight, borderBottomWidth: 1, ...shadows.sm }} className="px-5 py-3.5 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <CircularProgress size={48} strokeWidth={4} progress={durationProgress} color={accent.green} trackColor={isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.15)'} showGlow>
                        <Text style={{ color: accent.green }} className="text-xs font-bold">{formatTime(duration)}</Text>
                    </CircularProgress>
                    <View className="ml-3">
                        <Text style={{ color: colors.text }} className="font-bold text-base">Active Session</Text>
                        <Text style={{ color: colors.textTertiary }} className="text-xs mt-0.5">{completedSets}/{totalSets} sets • {progressPercent}%</Text>
                    </View>
                </View>
                <TouchableOpacity style={{ backgroundColor: accent.green, ...shadows.glow(accent.green) }} className="px-5 py-2.5 rounded-xl" onPress={handleFinishPress}>
                    <Text className="text-white font-bold">Finish</Text>
                </TouchableOpacity>
            </View>

            {/* Finish Modal */}
            <Modal animationType="slide" transparent visible={isFinishModalVisible} onRequestClose={() => setFinishModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end">
                    <View className="flex-1 bg-black/60 justify-end">
                        <View style={{ backgroundColor: colors.background, ...shadows.lg }} className="rounded-t-3xl p-6">
                            <View className="w-10 h-1 rounded-full bg-gray-500 self-center mb-5 opacity-40" />
                            <View className="flex-row justify-between items-center mb-6">
                                <Text style={{ color: colors.text, letterSpacing: -0.5 }} className="text-2xl font-bold">Save Workout</Text>
                                <TouchableOpacity onPress={() => setFinishModalVisible(false)} style={{ backgroundColor: colors.cardGlass }} className="w-8 h-8 rounded-full items-center justify-center">
                                    <X size={18} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="mb-2 font-semibold text-sm">Workout Name</Text>
                            <TextInput
                                style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.borderInput, borderWidth: 1 }}
                                className="p-4 rounded-xl text-lg mb-6"
                                placeholder="e.g. Leg Day"
                                placeholderTextColor={colors.textTertiary}
                                value={workoutName}
                                onChangeText={setWorkoutName}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={{ backgroundColor: isSaving ? '#6b9e6b' : accent.green, ...(isSaving ? {} : shadows.glow(accent.green)) }}
                                className="py-4 rounded-2xl items-center mb-4 flex-row justify-center"
                                onPress={confirmFinish}
                                disabled={isSaving}
                                activeOpacity={0.8}
                            >
                                {isSaving ? (
                                    <>
                                        <ActivityIndicator color="white" size="small" />
                                        <Text className="text-white font-bold text-lg ml-2">Saving...</Text>
                                    </>
                                ) : (
                                    <Text className="text-white font-bold text-lg">Save & Finish</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {activeWorkout.exercises.length === 0 ? (
                    <View className="items-center py-12">
                        <Text style={{ color: colors.textSecondary }} className="text-base">No exercises added yet.</Text>
                        <TouchableOpacity className="mt-4" onPress={() => navigation.navigate('Exercises')}>
                            <Text style={{ color: accent.green }} className="font-bold text-base">Browse Library →</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    activeWorkout.exercises.map((exercise, exerciseIndex) => (
                        <View key={exercise.id} style={glassCard} className="rounded-2xl p-4 mb-3">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text style={{ color: colors.text }} className="font-bold text-base flex-1 mr-2">{exercise.name}</Text>
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: accent.greenBg }} className="px-2.5 py-1 rounded-lg mr-2">
                                        <Text style={{ color: accent.green }} className="text-xs font-bold">{exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => Alert.alert('Remove Exercise', `Remove "${exercise.name}" from this workout?`, [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Remove', style: 'destructive', onPress: () => removeExercise(exerciseIndex) }
                                        ])}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        style={{ backgroundColor: accent.redBg }}
                                        className="w-8 h-8 rounded-lg items-center justify-center"
                                    >
                                        <Trash2 size={14} color={accent.red} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Header Row */}
                            <View className="flex-row mb-2 px-1">
                                <Text style={{ color: colors.textTertiary }} className="w-8 text-xs font-bold text-center">SET</Text>
                                <Text style={{ color: colors.textTertiary }} className="flex-1 text-xs font-bold text-center">KG</Text>
                                <Text style={{ color: colors.textTertiary }} className="flex-1 text-xs font-bold text-center">REPS</Text>
                                <Text style={{ color: colors.textTertiary }} className="w-10 text-xs font-bold text-center">✓</Text>
                            </View>

                            {exercise.sets.map((set, setIndex) => (
                                <View key={set.id} style={{ backgroundColor: set.completed ? (isDark ? 'rgba(16,185,129,0.06)' : '#f0fdf4') : 'transparent' }} className="flex-row items-center px-1 py-2.5 rounded-xl mb-1">
                                    <Text style={{ color: set.completed ? accent.green : colors.textSecondary }} className="w-8 text-center font-bold text-sm">{setIndex + 1}</Text>
                                    <TextInput
                                        style={{ backgroundColor: colors.cardElevated, color: colors.text, borderColor: colors.borderLight, borderWidth: 1 }}
                                        className="flex-1 mx-1.5 rounded-xl text-center py-2 text-sm font-medium"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textTertiary}
                                        value={set.weight.toString()}
                                        onChangeText={(val) => updateSet(exerciseIndex, setIndex, 'weight', Number(val))}
                                    />
                                    <TextInput
                                        style={{ backgroundColor: colors.cardElevated, color: colors.text, borderColor: colors.borderLight, borderWidth: 1 }}
                                        className="flex-1 mx-1.5 rounded-xl text-center py-2 text-sm font-medium"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textTertiary}
                                        value={set.reps.toString()}
                                        onChangeText={(val) => updateSet(exerciseIndex, setIndex, 'reps', Number(val))}
                                    />
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: set.completed ? accent.green : (isDark ? '#2a2a3a' : '#e5e7eb'),
                                            ...(set.completed ? shadows.glow(accent.green) : {}),
                                        }}
                                        className="w-9 h-9 rounded-xl justify-center items-center"
                                        onPress={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                                    >
                                        <Check size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={{ backgroundColor: accent.greenBg }}
                                className="mt-3 py-2.5 rounded-xl flex-row items-center justify-center"
                                onPress={() => addSet(exerciseIndex)}
                            >
                                <Plus size={14} color={accent.green} />
                                <Text style={{ color: accent.green }} className="font-bold text-xs ml-1.5">Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                {/* Add Exercise button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: accent.green,
                        ...shadows.glow(accent.green),
                    }}
                    className="mt-3 py-4 rounded-2xl flex-row items-center justify-center"
                    onPress={() => navigation.navigate('Exercises')}
                    activeOpacity={0.8}
                >
                    <Plus size={18} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Add Exercise</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
