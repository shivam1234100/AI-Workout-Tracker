import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutStore } from '../store/workoutStore';
import { Plus, Trash2, Check, Clock, PlayCircle } from 'lucide-react-native';

export default function WorkoutScreen({ navigation }: any) {
    const {
        activeWorkout,
        startWorkout,
        finishWorkout,
        addSet,
        updateSet,
        removeSet
    } = useWorkoutStore();

    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeWorkout) {
            // Calculate duration from startTime
            interval = setInterval(() => {
                const now = Date.now();
                const start = activeWorkout.startTime || now;
                setDuration(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeWorkout]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleFinish = () => {
        Alert.alert(
            "Finish Workout",
            "Are you sure you want to finish this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish", onPress: () => {
                        finishWorkout();
                        navigation.navigate('History');
                    }
                }
            ]
        );
    };

    if (!activeWorkout) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 p-4 justify-center items-center">
                <View className="bg-blue-100 p-6 rounded-full mb-6">
                    <PlayCircle size={64} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">No Active Workout</Text>
                <Text className="text-gray-500 mb-8 text-center px-8">Ready to hit the gym? Start a new workout to track your sets and reps.</Text>
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
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 flex-row justify-between items-center shadow-sm z-10">
                <View>
                    <Text className="text-lg font-bold text-gray-900">Current Session</Text>
                    <View className="flex-row items-center mt-1">
                        <Clock size={14} color="#2563eb" className="mr-1" />
                        <Text className="text-blue-600 font-medium">{formatTime(duration)}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onPress={handleFinish}
                >
                    <Text className="text-white font-bold">Finish</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {activeWorkout.exercises.length === 0 ? (
                    <View className="items-center py-10">
                        <Text className="text-gray-500">No exercises added yet.</Text>
                        <TouchableOpacity
                            className="mt-4"
                            onPress={() => navigation.navigate('Exercises')}
                        >
                            <Text className="text-blue-600 font-bold">Browse Library</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    activeWorkout.exercises.map((exercise, exerciseIndex) => (
                        <View key={exercise.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                            <Text className="text-lg font-bold text-gray-900 mb-3">{exercise.name}</Text>

                            {/* Header Row */}
                            <View className="flex-row mb-2 px-2">
                                <Text className="w-10 text-gray-400 text-xs font-bold uppercase text-center">Set</Text>
                                <Text className="flex-1 text-gray-400 text-xs font-bold uppercase text-center">kg</Text>
                                <Text className="flex-1 text-gray-400 text-xs font-bold uppercase text-center">Reps</Text>
                                <Text className="w-10 text-gray-400 text-xs font-bold uppercase text-center">Done</Text>
                            </View>

                            {exercise.sets.map((set, setIndex) => (
                                <View key={set.id} className={`flex-row items-center mb-2 px-2 py-2 rounded-lg ${set.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <Text className="w-10 text-center font-bold text-gray-500">{setIndex + 1}</Text>

                                    <TextInput
                                        className="flex-1 bg-white mx-2 rounded border border-gray-200 text-center py-1 text-gray-900 font-medium"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        value={set.weight.toString()}
                                        onChangeText={(val) => updateSet(exerciseIndex, setIndex, 'weight', Number(val))}
                                    />

                                    <TextInput
                                        className="flex-1 bg-white mx-2 rounded border border-gray-200 text-center py-1 text-gray-900 font-medium"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        value={set.reps.toString()}
                                        onChangeText={(val) => updateSet(exerciseIndex, setIndex, 'reps', Number(val))}
                                    />

                                    <TouchableOpacity
                                        className={`w-8 h-8 rounded justify-center items-center ${set.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                                        onPress={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                                    >
                                        <Check size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View className="flex-row justify-center mt-3 space-x-4">
                                <TouchableOpacity
                                    className="bg-blue-50 px-4 py-2 rounded-lg flex-row items-center"
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
                    className="bg-blue-50 border border-blue-200 border-dashed p-4 rounded-xl items-center flex-row justify-center mt-2"
                    onPress={() => navigation.navigate('Exercises')}
                >
                    <Plus size={20} color="#2563eb" className="mr-2" />
                    <Text className="text-blue-600 font-bold">Add Exercise</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
