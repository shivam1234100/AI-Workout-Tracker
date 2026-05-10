import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SectionList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutStore } from '../store/workoutStore';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { Calendar, ChevronRight, Trash2, Dumbbell, TrendingUp, Clock } from 'lucide-react-native';

export default function HistoryScreen({ navigation }: any) {
    const { history, deleteWorkout, fetchHistory } = useWorkoutStore();
    const { isDark, colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await fetchHistory();
            setIsLoading(false);
        })();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert("Delete Workout", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await deleteWorkout(id);
                    } catch {
                        Alert.alert('Error', 'Failed to delete workout. Please try again.');
                    }
                }
            }
        ]);
    };

    // ─── Group by date ───
    const sections = useMemo(() => {
        const groups: Record<string, any[]> = {};
        history.forEach((w: any) => {
            const d = new Date(w.endTime || w.date);
            const key = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
            if (!groups[key]) groups[key] = [];
            groups[key].push(w);
        });
        return Object.entries(groups).map(([title, data]) => ({ title, data }));
    }, [history]);

    // ─── Stats ───
    const totalExercises = history.reduce((a: number, w: any) => a + (w.exercises?.length || 0), 0);
    const totalVolume = history.reduce((acc: number, w: any) =>
        acc + (w.exercises?.reduce((a: number, e: any) =>
            a + (Array.isArray(e.sets) ? e.sets.reduce((s: number, set: any) => s + ((set.weight || 0) * (set.reps || 0)), 0) : 0), 0) || 0), 0);

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const renderItem = ({ item }: any) => {
        const setCount = item.exercises?.reduce((a: number, e: any) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0) || 0;
        const time = item.startTime && item.endTime
            ? Math.round((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 60000)
            : null;

        return (
            <View style={glassCard} className="mx-4 mb-2.5 rounded-2xl overflow-hidden flex-row items-center">
                {/* Tap-to-navigate area */}
                <TouchableOpacity
                    className="flex-1 p-4 flex-row items-center"
                    onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
                    activeOpacity={0.7}
                >
                    <View style={{ backgroundColor: accent.greenBg }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                        <Dumbbell size={18} color={accent.green} />
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: colors.text }} className="font-bold text-base">{item.name || 'Workout'}</Text>
                        <View className="flex-row items-center mt-2 flex-wrap">
                            <View style={{ backgroundColor: accent.greenBg }} className="px-2.5 py-1 rounded-lg mr-2">
                                <Text style={{ color: accent.green }} className="text-xs font-bold">{(item.exercises?.length || 0) + ' exercises'}</Text>
                            </View>
                            <View style={{ backgroundColor: accent.indigoBg }} className="px-2.5 py-1 rounded-lg mr-2">
                                <Text style={{ color: accent.indigo }} className="text-xs font-bold">{setCount + ' sets'}</Text>
                            </View>
                            {time ? (
                                <View style={{ backgroundColor: accent.amberBg }} className="px-2.5 py-1 rounded-lg">
                                    <Text style={{ color: accent.amber }} className="text-xs font-bold">{time + 'm'}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Delete button — separate sibling so it isn't swallowed by the nav touch */}
                <TouchableOpacity
                    className="px-4 py-6"
                    onPress={() => handleDelete(item.id)}
                    activeOpacity={0.5}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Trash2 size={18} color={accent.red} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="px-5 pt-3 pb-4">
                <Text style={{ color: colors.text, letterSpacing: -0.5 }} className="text-2xl font-bold">History</Text>
                <Text style={{ color: colors.textTertiary }} className="text-sm mt-1">{history.length} workouts logged</Text>
            </View>

            {/* Summary Cards */}
            <View className="flex-row px-4 mb-4">
                <View style={glassCard} className="flex-1 p-4 rounded-2xl mr-2 flex-row items-center">
                    <View style={{ backgroundColor: accent.greenBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <Dumbbell size={18} color={accent.green} />
                    </View>
                    <View>
                        <Text style={{ color: colors.text, letterSpacing: -0.3 }} className="text-xl font-bold">{history.length}</Text>
                        <Text style={{ color: colors.textTertiary }} className="text-xs font-medium">Workouts</Text>
                    </View>
                </View>
                <View style={glassCard} className="flex-1 p-4 rounded-2xl ml-2 flex-row items-center">
                    <View style={{ backgroundColor: accent.amberBg }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <TrendingUp size={18} color={accent.amber} />
                    </View>
                    <View>
                        <Text style={{ color: colors.text, letterSpacing: -0.3 }} className="text-xl font-bold">{totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}</Text>
                        <Text style={{ color: colors.textTertiary }} className="text-xs font-medium">Volume (kg)</Text>
                    </View>
                </View>
            </View>

            {isLoading && (
                <View className="items-center py-4">
                    <ActivityIndicator color="#2563eb" />
                </View>
            )}

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="flex-row items-center px-5 pt-5 pb-2">
                        <View style={{ backgroundColor: accent.green, width: 3, height: 14, borderRadius: 2, marginRight: 8 }} />
                        <Text style={{ color: colors.textTertiary, letterSpacing: 1 }} className="text-xs font-bold">{title}</Text>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <View style={{ backgroundColor: accent.greenBg }} className="w-16 h-16 rounded-2xl items-center justify-center mb-4">
                            <Dumbbell size={32} color={accent.green} />
                        </View>
                        <Text style={{ color: colors.text }} className="font-bold text-base mb-1">No Workouts Yet</Text>
                        <Text style={{ color: colors.textTertiary }} className="text-center text-sm">Start training today!</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
