import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutStore } from '../store/workoutStore';
import { useTheme } from '../context/ThemeContext';
import { Plus, Trash2, Check, Clock, PlayCircle, X } from 'lucide-react-native';

export default function WorkoutScreen({ navigation }: any) {
    const {
        activeWorkout,
        startWorkout,
        finishWorkout,
        addSet,
        updateSet,
        removeSet
    } = useWorkoutStore();
    const { isDark, colors } = useTheme();

    const [duration, setDuration] = useState(0);
    const [isFinishModalVisible, setFinishModalVisible] = useState(false);
    const [workoutName, setWorkoutName] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeWorkout && activeWorkout.startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const start = activeWorkout.startTime || now;
                setDuration(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeWorkout, activeWorkout?.startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleFinishPress = () => {
        setWorkoutName('');
        setFinishModalVisible(true);
    };

    const confirmFinish = async () => {
        await finishWorkout(workoutName.trim() || undefined);
        setFinishModalVisible(false);
        navigation.navigate('History');
    };

    if (!activeWorkout) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="p-4 justify-center items-center">
                <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe' }} className="p-6 rounded-full mb-6">
                    <PlayCircle size={64} color="#2563eb" />
                </View>
                <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">No Active Workout</Text>
                <Text style={{ color: colors.textSecondary }} className="mb-8 text-center px-8">Ready to hit the gym? Start a new workout to track your sets and reps.</Text>
                <TouchableOpacity
                    className="bg-blue-600 px-8 py-4 rounded-xl w-full max-w-xs items-center shadow-lg"
                    onPress={startWorkout}
                >
                    <Text className="text-white font-bold text-lg">Start Empty Workout</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{ backgroundColor: colors.card, borderBottomColor: colors.border }} className="p-4 flex-row justify-between items-center shadow-sm z-10 border-b">
                <View>
                    <Text style={{ color: colors.text }} className="text-lg font-bold">Current Session</Text>
                    <View className="flex-row items-center mt-1">
                        <Clock size={14} color="#2563eb" className="mr-1" />
                        <Text className="text-blue-600 font-medium">{formatTime(duration)}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onPress={handleFinishPress}
                >
                    <Text className="text-white font-bold">Finish</Text>
                </TouchableOpacity>
            </View>

            {/* Finish Workout Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isFinishModalVisible}
                onRequestClose={() => setFinishModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 justify-end"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <View style={{ backgroundColor: colors.background }} className="rounded-t-3xl p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text style={{ color: colors.text }} className="text-2xl font-bold">Save Workout</Text>
                                <TouchableOpacity onPress={() => setFinishModalVisible(false)}>
                                    <X size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">Workout Name (Optional)</Text>
                            <TextInput
                                style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }}
                                className="p-4 rounded-xl text-lg mb-6 border"
                                placeholder="e.g. Leg Day Destruction"
                                placeholderTextColor="#9ca3af"
                                value={workoutName}
                                onChangeText={setWorkoutName}
                                autoFocus
                            />

                            <TouchableOpacity
                                className="bg-blue-600 py-4 rounded-xl items-center shadow-lg mb-4"
                                onPress={confirmFinish}
                            >
                                <Text className="text-white font-bold text-lg">Save & Finish</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {activeWorkout.exercises.length === 0 ? (
                    <View className="items-center py-10">
                        <Text style={{ color: colors.textSecondary }}>No exercises added yet.</Text>
                        <TouchableOpacity
                            className="mt-4"
                            onPress={() => navigation.navigate('Exercises')}
                        >
                            <Text className="text-blue-600 font-bold">Browse Library</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    activeWorkout.exercises.map((exercise, exerciseIndex) => (
                        <View key={exercise.id} style={{ backgroundColor: colors.card }} className="rounded-xl p-4 mb-4 shadow-sm">
                            <Text style={{ color: colors.text }} className="text-lg font-bold mb-3">{exercise.name}</Text>

                            {/* Header Row */}
                            <View className="flex-row mb-2 px-2">
                                <Text style={{ color: colors.textTertiary }} className="w-10 text-xs font-bold uppercase text-center">Set</Text>
                                <Text style={{ color: colors.textTertiary }} className="flex-1 text-xs font-bold uppercase text-center">kg</Text>
                                <Text style={{ color: colors.textTertiary }} className="flex-1 text-xs font-bold uppercase text-center">Reps</Text>
                                <Text style={{ color: colors.textTertiary }} className="w-10 text-xs font-bold uppercase text-center">Done</Text>
                            </View>

                            {exercise.sets.map((set, setIndex) => (
                                <View key={set.id} style={{ backgroundColor: set.completed ? (isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4') : colors.inputBg }} className="flex-row items-center mb-2 px-2 py-2 rounded-lg">
                                    <Text style={{ color: colors.textSecondary }} className="w-10 text-center font-bold">{setIndex + 1}</Text>

                                    <TextInput
                                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                                        className="flex-1 mx-2 rounded border text-center py-1 font-medium"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={set.weight.toString()}
                                        onChangeText={(val) => updateSet(exerciseIndex, setIndex, 'weight', Number(val))}
                                    />

                                    <TextInput
                                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                                        className="flex-1 mx-2 rounded border text-center py-1 font-medium"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={set.reps.toString()}
                                        onChangeText={(val) => updateSet(exerciseIndex, setIndex, 'reps', Number(val))}
                                    />

                                    <TouchableOpacity
                                        className={`w-8 h-8 rounded justify-center items-center ${set.completed ? 'bg-green-500' : ''}`}
                                        style={!set.completed ? { backgroundColor: isDark ? '#4b5563' : '#d1d5db' } : undefined}
                                        onPress={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                                    >
                                        <Check size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View className="flex-row justify-center mt-3 space-x-4">
                                <TouchableOpacity
                                    style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }}
                                    className="px-4 py-2 rounded-lg flex-row items-center"
                                    onPress={() => addSet(exerciseIndex)}
                                >
                                    <Plus size={16} color="#2563eb" className="mr-1" />
                                    <Text className="text-blue-600 font-bold text-sm">Add Set</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {/* Add Exercise Button at Bottom */}
                <TouchableOpacity
                    style={{ borderColor: isDark ? '#1e40af' : '#bfdbfe', backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }}
                    className="border border-dashed p-4 rounded-xl items-center flex-row justify-center mt-2"
                    onPress={() => navigation.navigate('Exercises')}
                >
                    <Plus size={20} color="#2563eb" className="mr-2" />
                    <Text className="text-blue-600 font-bold">Add Exercise</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
