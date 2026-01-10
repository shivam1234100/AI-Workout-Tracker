import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, Dumbbell } from 'lucide-react-native';

export default function WorkoutDetailScreen({ route, navigation }: any) {
    const { workout } = route.params;

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-gray-500">Workout not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-blue-600 font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center shadow-sm">
                <TouchableOpacity
                    className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={20} color="#374151" className="dark:text-gray-200" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">{workout.name || 'Workout Details'}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(workout.endTime)}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Stats Summary */}
                <View className="flex-row justify-between mb-6">
                    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-1 mr-2 shadow-sm items-center">
                        <Dumbbell size={20} color="#2563eb" className="mb-1" />
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">{workout.exercises?.length || 0}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs text-center">Exercises</Text>
                    </View>
                    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-1 ml-2 shadow-sm items-center">
                        <Clock size={20} color="#10b981" className="mb-1" />
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">
                            {workout.startTime && workout.endTime
                                ? Math.round((workout.endTime - workout.startTime) / 60000) + 'm'
                                : '-'}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs text-center">Duration</Text>
                    </View>
                </View>

                {/* Exercises List */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Exercises Performed</Text>
                {workout.exercises?.map((exercise: any, exIndex: number) => (
                    <View key={exercise.id || exIndex} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">{exercise.name}</Text>

                        {/* Header Row */}
                        <View className="flex-row mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <Text className="w-10 text-gray-400 text-xs font-bold uppercase text-center">Set</Text>
                            <Text className="flex-1 text-gray-400 text-xs font-bold uppercase text-center">kg</Text>
                            <Text className="flex-1 text-gray-400 text-xs font-bold uppercase text-center">Reps</Text>
                        </View>

                        {exercise.sets?.map((set: any, setIndex: number) => (
                            <View key={set.id || setIndex} className="flex-row items-center py-2">
                                <View className="w-10 items-center justify-center">
                                    <View className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
                                        <Text className="text-xs font-bold text-gray-500 dark:text-gray-300">{setIndex + 1}</Text>
                                    </View>
                                </View>
                                <Text className="flex-1 text-center text-gray-900 dark:text-white font-medium">{set.weight || 0}</Text>
                                <Text className="flex-1 text-center text-gray-900 dark:text-white font-medium">{set.reps || 0}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
