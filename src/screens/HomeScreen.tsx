import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useContentStore } from '../store/contentStore';
import { useTheme } from '../context/ThemeContext';
import { Play, TrendingUp, Calendar, Activity, User, Dumbbell, ChevronRight, PlayCircle, Quote } from 'lucide-react-native';

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuthStore();
    const { history } = useWorkoutStore();
    const { dailyQuote, isLoading, fetchContent } = useContentStore();
    const { isDark, colors } = useTheme();

    useEffect(() => {
        fetchContent();
    }, []);

    const onRefresh = useCallback(() => {
        fetchContent(true);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const lastWorkoutDate = history.length > 0 ? history[0].endTime : null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="pb-0">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={["#2563eb"]} />
                }
            >
                <View className="p-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">{getGreeting()},</Text>
                            <Text style={{ color: colors.text }} className="text-2xl font-bold">{user?.name || user?.email?.split('@')[0] || 'Athlete'}</Text>
                        </View>
                        <TouchableOpacity
                            style={{ backgroundColor: colors.card }}
                            className="p-2 rounded-full shadow-sm"
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <User color={colors.textSecondary} size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Daily Motivation Card */}
                    {dailyQuote ? (
                        <View className="bg-blue-600 rounded-2xl p-5 mb-8 shadow-lg relative overflow-hidden">
                            <View className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/30 rounded-full" />
                            <View className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-500/30 rounded-full" />
                            <View className="flex-row items-center mb-2">
                                <Quote size={20} color="rgba(255,255,255,0.8)" className="mr-2" />
                                <Text className="text-blue-100 font-bold uppercase text-xs tracking-wider">Daily Motivation</Text>
                            </View>
                            <Text className="text-white text-lg font-bold italic mb-3 leading-6">"{dailyQuote.text}"</Text>
                            <Text className="text-blue-200 text-sm font-medium self-end">- Anonymous</Text>
                        </View>
                    ) : (
                        <View className="h-40 bg-blue-600/10 rounded-2xl mb-8 items-center justify-center">
                            <ActivityIndicator color="#2563eb" />
                        </View>
                    )}

                    {/* Quick Stats Row */}
                    <View className="flex-row justify-between mb-8">
                        <View style={{ backgroundColor: colors.card }} className="p-4 rounded-2xl flex-1 mr-2 shadow-sm items-center">
                            <Dumbbell color="#2563eb" size={24} className="mb-2" />
                            <Text style={{ color: colors.text }} className="text-2xl font-bold">{history.length}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-xs">Workouts</Text>
                        </View>
                        <View style={{ backgroundColor: colors.card }} className="p-4 rounded-2xl flex-1 mx-2 shadow-sm items-center">
                            <Activity color="#ec4899" size={24} className="mb-2" />
                            <Text style={{ color: colors.text }} className="text-2xl font-bold">
                                {history.reduce((acc: number, curr: any) => acc + (curr.exercises?.length || 0), 0)}
                            </Text>
                            <Text style={{ color: colors.textSecondary }} className="text-xs">Sets Done</Text>
                        </View>
                        <View style={{ backgroundColor: colors.card }} className="p-4 rounded-2xl flex-1 ml-2 shadow-sm items-center">
                            <Calendar color="#7c3aed" size={24} className="mb-2" />
                            <Text style={{ color: colors.text }} className="text-lg font-bold mb-1">
                                {lastWorkoutDate ? new Date(lastWorkoutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                            </Text>
                            <Text style={{ color: colors.textSecondary }} className="text-xs">Last Active</Text>
                        </View>
                    </View>

                    {/* Weekly Insights Card */}
                    <TouchableOpacity
                        className="bg-emerald-600 rounded-2xl p-5 mb-8 shadow-lg relative overflow-hidden"
                        onPress={() => navigation.navigate('WeeklySummary')}
                        activeOpacity={0.8}
                    >
                        <View className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/30 rounded-full" />
                        <View className="absolute -left-3 -bottom-3 w-16 h-16 bg-emerald-500/30 rounded-full" />
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-emerald-100 font-bold uppercase text-xs tracking-wider mb-1">📊 Weekly Insights</Text>
                                <Text className="text-white text-lg font-bold">View Your Training Summary</Text>
                                <Text className="text-emerald-200 text-sm mt-1">AI-powered analysis of your week</Text>
                            </View>
                            <View className="bg-emerald-500/40 p-3 rounded-xl">
                                <TrendingUp color="white" size={24} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Recent Activity */}
                    <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Recent Activity</Text>
                    <View className="mb-8">
                        {history.slice(0, 3).map((workout: any) => (
                            <TouchableOpacity
                                key={workout.id}
                                style={{ backgroundColor: colors.card }}
                                className="p-4 rounded-xl mb-3 shadow-sm flex-row items-center"
                                onPress={() => navigation.navigate('WorkoutDetail', { workout })}
                            >
                                <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe' }} className="p-3 rounded-xl mr-4">
                                    <PlayCircle color="#2563eb" size={24} />
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: colors.text }} className="text-lg font-bold">{workout.name || 'Workout'}</Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-sm">
                                        {new Date(workout.endTime || Date.now()).toLocaleDateString()} • {workout.exercises?.length || 0} Exercises
                                    </Text>
                                </View>
                                <ChevronRight color="#9ca3af" size={20} />
                            </TouchableOpacity>
                        ))}
                        {history.length === 0 && (
                            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-6 rounded-xl items-center border border-dashed">
                                <Text style={{ color: colors.textTertiary }}>No recent activity</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
