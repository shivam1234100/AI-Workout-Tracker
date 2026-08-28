import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Sparkles, TrendingUp, Dumbbell, Clock, Flame } from 'lucide-react-native';

interface ParsedStats {
    totalWorkouts: number;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    totalDurationMin: number;
    exercises?: Record<string, { count: number; maxWeight: number }>;
}

export default function WeeklySummaryScreen({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<string>('');
    const [stats, setStats] = useState<ParsedStats | null>(null);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        if (!token) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/summary/weekly`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSummary(data.summary || '');
                if (data.stats) {
                    try { setStats(typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats); } catch {}
                }
            }
        } catch (e: any) {
            const msg = e?.message || '';
            if (!msg.includes('Aborted') && !msg.includes('Network request failed')) {
                console.error('Summary load failed:', e);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-3 pb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <Sparkles size={22} color={accent.purple} />
                        <Text style={{ color: colors.text }} className="text-2xl font-bold ml-2">Weekly Summary</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                        AI-powered analysis of your training
                    </Text>
                </View>

                {isLoading ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color={accent.purple} />
                        <Text style={{ color: colors.textSecondary }} className="text-sm mt-3">Generating your summary...</Text>
                    </View>
                ) : (
                    <>
                        {stats && (
                            <View className="px-4 flex-row flex-wrap mb-3">
                                <View style={[glassCard, { width: '47%' }]} className="rounded-2xl p-3 m-1">
                                    <View style={{ backgroundColor: accent.indigoBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                                        <Dumbbell size={16} color={accent.indigo} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-xl font-bold">{stats.totalWorkouts}</Text>
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Workouts</Text>
                                </View>
                                <View style={[glassCard, { width: '47%' }]} className="rounded-2xl p-3 m-1">
                                    <View style={{ backgroundColor: accent.amberBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                                        <TrendingUp size={16} color={accent.amber} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-xl font-bold">{stats.totalSets}</Text>
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Sets</Text>
                                </View>
                                <View style={[glassCard, { width: '47%' }]} className="rounded-2xl p-3 m-1">
                                    <View style={{ backgroundColor: accent.greenBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                                        <Flame size={16} color={accent.green} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-xl font-bold">{Math.round(stats.totalVolume).toLocaleString()}</Text>
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Volume (kg)</Text>
                                </View>
                                <View style={[glassCard, { width: '47%' }]} className="rounded-2xl p-3 m-1">
                                    <View style={{ backgroundColor: accent.cyanBg }} className="w-9 h-9 rounded-xl items-center justify-center mb-2">
                                        <Clock size={16} color={accent.cyan} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-xl font-bold">{Math.round(stats.totalDurationMin)}m</Text>
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Duration</Text>
                                </View>
                            </View>
                        )}

                        {summary ? (
                            <View style={glassCard} className="mx-5 rounded-2xl p-5">
                                <Text style={{ color: colors.text, lineHeight: 22, fontSize: 14 }}>{summary}</Text>
                            </View>
                        ) : (
                            <View style={glassCard} className="mx-5 rounded-2xl p-6 items-center">
                                <Text style={{ color: colors.textSecondary }} className="text-sm text-center">
                                    Complete some workouts this week to see your summary.
                                </Text>
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
