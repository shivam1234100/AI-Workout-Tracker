import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_RECENT_WORKOUTS } from '../constants/mockData';
import { Calendar, ChevronRight, Activity } from 'lucide-react-native';

export default function HistoryScreen() {
    const renderItem = ({ item }: any) => (
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center">
            <View className="bg-purple-50 p-3 rounded-lg mr-4">
                <Calendar color="#7c3aed" size={24} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            <View className="items-end">
                <Text className="text-gray-900 font-bold">{item.exercises} Exercises</Text>
                <View className="flex-row items-center mt-1">
                    <Text className="text-blue-600 text-xs font-bold">View Details</Text>
                    <ChevronRight size={12} color="#2563eb" />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4 pb-0">
            <Text className="text-2xl font-bold text-gray-900 mb-6">Workout History</Text>

            {/* Summary Cards */}
            <View className="flex-row justify-between mb-6">
                <View className="bg-white p-4 rounded-xl flex-1 mr-2 shadow-sm">
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-1">This Week</Text>
                    <Text className="text-2xl font-bold text-gray-900">3</Text>
                    <Text className="text-gray-400 text-xs">Workouts</Text>
                </View>
                <View className="bg-white p-4 rounded-xl flex-1 ml-2 shadow-sm">
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Total Time</Text>
                    <Text className="text-2xl font-bold text-gray-900">4h 12m</Text>
                    <Text className="text-gray-400 text-xs">Minutes</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-4">Past Workouts</Text>
            <FlatList
                data={MOCK_RECENT_WORKOUTS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </SafeAreaView>
    );
}
