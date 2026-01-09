import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { MOCK_STATS, MOCK_RECENT_WORKOUTS } from '../constants/mockData';
import { Play, TrendingUp, Calendar, Activity } from 'lucide-react-native';

export default function HomeScreen({ navigation }: any) {
    const { user } = useUser();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium text-base">{getGreeting()},</Text>
                    <Text className="text-3xl font-bold text-gray-900">{user?.firstName || 'Athlete'}!</Text>
                </View>

                {/* Start Workout Card */}
                <TouchableOpacity
                    className="bg-blue-600 p-6 rounded-2xl shadow-sm mb-6 flex-row justify-between items-center"
                    onPress={() => navigation.navigate('Workout')}
                >
                    <View>
                        <Text className="text-white text-xl font-bold mb-1">Start Workout</Text>
                        <Text className="text-blue-100">Ready to crush it today?</Text>
                    </View>
                    <View className="bg-blue-500/30 p-3 rounded-full">
                        <Play color="white" size={28} fill="white" />
                    </View>
                </TouchableOpacity>

                {/* Quick Stats Grid */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Your Progress</Text>
                <View className="flex-row justify-between mb-6">
                    <View className="bg-white p-4 rounded-xl flex-1 mr-2 shadow-sm items-center justify-center">
                        <Activity size={24} color="#f59e0b" className="mb-2" />
                        <Text className="text-2xl font-bold text-gray-900">{MOCK_STATS.totalWorkouts}</Text>
                        <Text className="text-gray-500 text-xs">Workouts</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl flex-1 mx-2 shadow-sm items-center justify-center">
                        <TrendingUp size={24} color="#10b981" className="mb-2" />
                        <Text className="text-2xl font-bold text-gray-900">{MOCK_STATS.totalExercises}</Text>
                        <Text className="text-gray-500 text-xs">Exercises</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl flex-1 ml-2 shadow-sm items-center justify-center">
                        <Calendar size={24} color="#6366f1" className="mb-2" />
                        <Text className="text-base font-bold text-gray-900 mt-2">{new Date(MOCK_STATS.lastWorkout).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                        <Text className="text-gray-500 text-xs">Last Active</Text>
                    </View>
                </View>

                {/* Recent Workouts */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Recent Activity</Text>
                {MOCK_RECENT_WORKOUTS.map((workout) => (
                    <View key={workout.id} className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center border border-gray-100">
                        <View className="bg-blue-50 p-3 rounded-lg mr-4">
                            <DumbbellIcon color="#2563eb" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-semibold">{workout.name}</Text>
                            <Text className="text-gray-500 text-sm">{workout.exercises} Exercises</Text>
                        </View>
                        <Text className="text-gray-400 text-sm">{new Date(workout.date).toLocaleDateString()}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

// Small helper component for the list icon if needed, or import form Lucide
function DumbbellIcon({ size, color }: any) {
    return <Activity size={size} color={color} />
}
