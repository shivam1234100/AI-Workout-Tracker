import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Dumbbell, Clock, Flame, Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';

interface WeeklySummaryData {
    id: string;
    weekStart: string;
    weekEnd: string;
    summary: string;
    stats: string; // JSON string
    createdAt: string;
}

interface ParsedStats {
    totalWorkouts: number;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    totalDurationMin: number;
    exercises: Record<string, { count: number; maxWeight: number }>;
}

export default function WeeklySummaryScreen({ navigation }: any) {
    const [currentSummary, setCurrentSummary] = useState<WeeklySummaryData | null>(null);
    const [pastSummaries, setPastSummaries] = useState<WeeklySummaryData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPast, setExpandedPast] = useState<string | null>(null);

    const { token } = useAuthStore();

    useEffect(() => {
        generateCurrentWeekSummary();
        fetchPastSummaries();
    }, []);

    // ─────────────────────────────────────────
    // Generate this week's summary
    // ─────────────────────────────────────────
    const generateCurrentWeekSummary = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`${API_URL}/summary/weekly`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentSummary(data);
            }
        } catch (error) {
            console.error('Failed to generate summary:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // ─────────────────────────────────────────
    // Fetch past summaries
    // ─────────────────────────────────────────
    const fetchPastSummaries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/summary/weekly`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                // Filter out current week (already shown separately)
                const now = new Date();
                const dayOfWeek = now.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() + mondayOffset);
                weekStart.setHours(0, 0, 0, 0);

                const past = data.filter((s: WeeklySummaryData) =>
                    new Date(s.weekStart).getTime() < weekStart.getTime()
                );
                setPastSummaries(past);
            }
        } catch (error) {
            console.error('Failed to fetch summaries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        generateCurrentWeekSummary();
        fetchPastSummaries();
    }, []);

    const parseStats = (statsStr: string): ParsedStats | null => {
        try {
            return JSON.parse(statsStr);
        } catch {
            return null;
        }
    };

    const formatWeekRange = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    };

    // ─────────────────────────────────────────
    // Stat Card component
    // ─────────────────────────────────────────
    const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex-1 mx-1 shadow-sm items-center">
            {icon}
            <Text className="text-xl font-bold text-gray-900 dark:text-white mt-2">{value}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{label}</Text>
        </View>
    );

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────
    const stats = currentSummary ? parseStats(currentSummary.stats) : null;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={24} color="#4b5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Weekly Insights</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={isGenerating} onRefresh={onRefresh} colors={["#2563eb"]} />
                }
            >
                <View className="p-4">
                    {/* Current Week Header */}
                    <View className="mb-4">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">This Week</Text>
                        {currentSummary && (
                            <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                {formatWeekRange(currentSummary.weekStart, currentSummary.weekEnd)}
                            </Text>
                        )}
                    </View>

                    {/* Stats Cards */}
                    {isGenerating && !stats ? (
                        <View className="h-28 items-center justify-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                            <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Analyzing your workouts...</Text>
                        </View>
                    ) : stats ? (
                        <>
                            <View className="flex-row mb-3">
                                <StatCard
                                    icon={<Dumbbell size={22} color="#2563eb" />}
                                    value={String(stats.totalWorkouts)}
                                    label="Workouts"
                                    color="#2563eb"
                                />
                                <StatCard
                                    icon={<Flame size={22} color="#ef4444" />}
                                    value={stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : String(stats.totalVolume)}
                                    label="Volume (kg)"
                                    color="#ef4444"
                                />
                                <StatCard
                                    icon={<Clock size={22} color="#7c3aed" />}
                                    value={String(stats.totalDurationMin)}
                                    label="Minutes"
                                    color="#7c3aed"
                                />
                            </View>
                            <View className="flex-row mb-6">
                                <StatCard
                                    icon={<TrendingUp size={22} color="#10b981" />}
                                    value={String(stats.totalSets)}
                                    label="Total Sets"
                                    color="#10b981"
                                />
                                <StatCard
                                    icon={<Calendar size={22} color="#f59e0b" />}
                                    value={String(stats.totalReps)}
                                    label="Total Reps"
                                    color="#f59e0b"
                                />
                                <View className="flex-1 mx-1" />
                            </View>
                        </>
                    ) : (
                        <View className="bg-white dark:bg-gray-800 p-6 rounded-xl items-center border border-dashed border-gray-300 dark:border-gray-700 mb-6">
                            <Text className="text-gray-400 dark:text-gray-500 text-center">No workouts this week yet.{'\n'}Start training to see your insights!</Text>
                        </View>
                    )}

                    {/* AI Summary Card */}
                    {currentSummary && (
                        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <View className="flex-row items-center mb-3">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">🤖 AI Coach Analysis</Text>
                            </View>
                            <Text className="text-gray-700 dark:text-gray-300 leading-6">
                                {currentSummary.summary}
                            </Text>
                        </View>
                    )}

                    {/* Past Summaries */}
                    {pastSummaries.length > 0 && (
                        <>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Past Weeks</Text>
                            {pastSummaries.map((summary) => {
                                const pastStats = parseStats(summary.stats);
                                const isExpanded = expandedPast === summary.id;

                                return (
                                    <TouchableOpacity
                                        key={summary.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
                                        onPress={() => setExpandedPast(isExpanded ? null : summary.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                <Text className="text-gray-900 dark:text-white font-bold">
                                                    {formatWeekRange(summary.weekStart, summary.weekEnd)}
                                                </Text>
                                                {pastStats && (
                                                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                        {pastStats.totalWorkouts} workouts • {pastStats.totalVolume.toLocaleString()}kg volume
                                                    </Text>
                                                )}
                                            </View>
                                            {isExpanded ? (
                                                <ChevronUp size={20} color="#9ca3af" />
                                            ) : (
                                                <ChevronDown size={20} color="#9ca3af" />
                                            )}
                                        </View>

                                        {isExpanded && (
                                            <View className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <Text className="text-gray-700 dark:text-gray-300 leading-6">
                                                    {summary.summary}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </>
                    )}

                    {isLoading && (
                        <View className="items-center py-4">
                            <ActivityIndicator size="small" color="#2563eb" />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
