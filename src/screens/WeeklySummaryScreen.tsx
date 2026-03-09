import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Dumbbell, Clock, Flame, Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

interface WeeklySummaryData {
    id: string;
    weekStart: string;
    weekEnd: string;
    summary: string;
    stats: string;
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
    const { isDark, colors } = useTheme();

    useEffect(() => {
        generateCurrentWeekSummary();
        fetchPastSummaries();
    }, []);

    const generateCurrentWeekSummary = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`${API_URL}/summary/weekly`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (response.ok) { const data = await response.json(); setCurrentSummary(data); }
        } catch (error) { console.error('Failed to generate summary:', error); }
        finally { setIsGenerating(false); }
    };

    const fetchPastSummaries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/summary/weekly`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                const now = new Date();
                const dayOfWeek = now.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() + mondayOffset);
                weekStart.setHours(0, 0, 0, 0);
                const past = data.filter((s: WeeklySummaryData) => new Date(s.weekStart).getTime() < weekStart.getTime());
                setPastSummaries(past);
            }
        } catch (error) { console.error('Failed to fetch summaries:', error); }
        finally { setIsLoading(false); }
    };

    const onRefresh = useCallback(() => { generateCurrentWeekSummary(); fetchPastSummaries(); }, []);
    const parseStats = (statsStr: string): ParsedStats | null => { try { return JSON.parse(statsStr); } catch { return null; } };
    const formatWeekRange = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    };

    const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string; color: string }) => (
        <View style={{ backgroundColor: colors.card }} className="p-4 rounded-2xl flex-1 mx-1 shadow-sm items-center">
            {icon}
            <Text style={{ color: colors.text }} className="text-xl font-bold mt-2">{value}</Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">{label}</Text>
        </View>
    );

    const stats = currentSummary ? parseStats(currentSummary.stats) : null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{ backgroundColor: colors.card, borderBottomColor: colors.border }} className="p-4 border-b flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="text-xl font-bold">Weekly Insights</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={isGenerating} onRefresh={onRefresh} colors={["#2563eb"]} />}
            >
                <View className="p-4">
                    {/* Current Week Header */}
                    <View className="mb-4">
                        <Text style={{ color: colors.text }} className="text-lg font-bold">This Week</Text>
                        {currentSummary && (
                            <Text style={{ color: colors.textSecondary }} className="text-sm">
                                {formatWeekRange(currentSummary.weekStart, currentSummary.weekEnd)}
                            </Text>
                        )}
                    </View>

                    {/* Stats Cards */}
                    {isGenerating && !stats ? (
                        <View className="h-28 items-center justify-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                            <Text style={{ color: colors.textSecondary }} className="mt-3 text-sm">Analyzing your workouts...</Text>
                        </View>
                    ) : stats ? (
                        <>
                            <View className="flex-row mb-3">
                                <StatCard icon={<Dumbbell size={22} color="#2563eb" />} value={String(stats.totalWorkouts)} label="Workouts" color="#2563eb" />
                                <StatCard icon={<Flame size={22} color="#ef4444" />} value={stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : String(stats.totalVolume)} label="Volume (kg)" color="#ef4444" />
                                <StatCard icon={<Clock size={22} color="#7c3aed" />} value={String(stats.totalDurationMin)} label="Minutes" color="#7c3aed" />
                            </View>
                            <View className="flex-row mb-6">
                                <StatCard icon={<TrendingUp size={22} color="#10b981" />} value={String(stats.totalSets)} label="Total Sets" color="#10b981" />
                                <StatCard icon={<Calendar size={22} color="#f59e0b" />} value={String(stats.totalReps)} label="Total Reps" color="#f59e0b" />
                                <View className="flex-1 mx-1" />
                            </View>
                        </>
                    ) : (
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-6 rounded-xl items-center border border-dashed mb-6">
                            <Text style={{ color: colors.textTertiary }} className="text-center">No workouts this week yet.{'\n'}Start training to see your insights!</Text>
                        </View>
                    )}

                    {/* AI Summary Card */}
                    {currentSummary && (
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl p-5 mb-8 shadow-sm border">
                            <View className="flex-row items-center mb-3">
                                <Text style={{ color: colors.text }} className="text-lg font-bold">🤖 AI Coach Analysis</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="leading-6">{currentSummary.summary}</Text>
                        </View>
                    )}

                    {/* Past Summaries */}
                    {pastSummaries.length > 0 && (
                        <>
                            <Text style={{ color: colors.text }} className="text-lg font-bold mb-4">Past Weeks</Text>
                            {pastSummaries.map((summary) => {
                                const pastStats = parseStats(summary.stats);
                                const isExpanded = expandedPast === summary.id;
                                return (
                                    <TouchableOpacity
                                        key={summary.id}
                                        style={{ backgroundColor: colors.card }}
                                        className="rounded-xl p-4 mb-3 shadow-sm"
                                        onPress={() => setExpandedPast(isExpanded ? null : summary.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                <Text style={{ color: colors.text }} className="font-bold">{formatWeekRange(summary.weekStart, summary.weekEnd)}</Text>
                                                {pastStats && (
                                                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                                                        {pastStats.totalWorkouts} workouts • {pastStats.totalVolume.toLocaleString()}kg volume
                                                    </Text>
                                                )}
                                            </View>
                                            {isExpanded ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                                        </View>
                                        {isExpanded && (
                                            <View style={{ borderTopColor: colors.border }} className="mt-4 pt-3 border-t">
                                                <Text style={{ color: colors.textSecondary }} className="leading-6">{summary.summary}</Text>
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
