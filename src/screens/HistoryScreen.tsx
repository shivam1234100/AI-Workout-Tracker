import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutStore } from '../store/workoutStore';
import { Calendar, ChevronRight, Activity, Trash2 } from 'lucide-react-native';

export default function HistoryScreen({ navigation }: any) {
    const { history, deleteWorkout } = useWorkoutStore();

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout from your history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteWorkout(id)
                }
            ]
        );
    };

    const renderItem = ({ item }: any) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm flex-row items-center">
            <TouchableOpacity
                className="flex-1 flex-row items-center cursor-pointer" // cursor-pointer for web feel if helpful
                onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
            >
                <View className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg mr-4">
                    <Calendar color="#7c3aed" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-bold text-lg">{item.name || 'Workout'}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">{new Date(item.endTime || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </View>
                <View className="items-end mr-3">
                    <Text className="text-gray-900 dark:text-white font-bold">{item.exercises?.length || 0} Exercises</Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">View</Text>
                        <ChevronRight size={12} color="#2563eb" />
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                className="p-2 -mr-2"
                onPress={() => handleDelete(item.id)}
            >
                <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 pb-0">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workout History</Text>

            {/* Summary Cards */}
            <View className="flex-row justify-between mb-6">
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-1 mr-2 shadow-sm">
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Total</Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">{history.length}</Text>
                    <Text className="text-gray-400 text-xs">Workouts</Text>
                </View>
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-1 ml-2 shadow-sm">
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Unique</Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">{new Set(history.map(w => w.name)).size}</Text>
                    <Text className="text-gray-400 text-xs">Types</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Past Workouts</Text>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-400 text-center">No workouts completed yet.</Text>
                        <Text className="text-gray-400 text-center text-sm mt-1">Start your first workout today!</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </SafeAreaView>
    );
}
