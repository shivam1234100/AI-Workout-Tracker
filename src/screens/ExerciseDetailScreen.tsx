import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, PlayCircle, Youtube, Plus, Dumbbell } from 'lucide-react-native';
import { useWorkoutStore } from '../store/workoutStore';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import React from 'react';

export default function ExerciseDetailScreen({ route, navigation }: any) {
    const { exercise } = route.params;
    const { activeWorkout, addExercise, startWorkout } = useWorkoutStore();

    const handleAddToWorkout = () => {
        if (!activeWorkout) startWorkout();
        addExercise(exercise);
        navigation.navigate('Main', { screen: 'Workout' });
    };
    const { isDark, colors } = useTheme();

    const getDifficultyColor = (d: string) => {
        switch (d) { case 'Beginner': return accent.green; case 'Intermediate': return accent.amber; case 'Advanced': return accent.red; default: return accent.blue; }
    };
    const getDifficultyBg = (d: string) => {
        switch (d) { case 'Beginner': return accent.greenBg; case 'Intermediate': return accent.amberBg; case 'Advanced': return accent.redBg; default: return accent.blueBg; }
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
                {/* Hero image with gradient overlay */}
                <View className="relative">
                    {exercise.image && (
                        <Image source={{ uri: exercise.image }} style={{ width: '100%', height: 260 }} contentFit="cover" />
                    )}
                    {/* Gradient overlay for text contrast */}
                    <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
                        backgroundColor: 'transparent',
                    }} />
                    <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                        backgroundColor: colors.background, opacity: 0.7,
                    }} />
                    <View className="absolute top-4 left-4">
                        <TouchableOpacity
                            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)', ...shadows.sm }}
                            className="w-10 h-10 rounded-full items-center justify-center"
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="px-5 pt-5 pb-10">
                    <Text style={{ color: colors.text, letterSpacing: -0.5 }} className="text-2xl font-bold mb-3">{exercise.name}</Text>
                    <View className="flex-row items-center mb-6 flex-wrap">
                        <View style={{ backgroundColor: getDifficultyBg(exercise.difficulty), borderWidth: 1, borderColor: `${getDifficultyColor(exercise.difficulty)}20` }} className="px-3.5 py-1.5 rounded-xl mr-2">
                            <Text style={{ color: getDifficultyColor(exercise.difficulty) }} className="text-xs font-bold">{exercise.difficulty}</Text>
                        </View>
                        <View style={{ backgroundColor: accent.blueBg, borderWidth: 1, borderColor: 'rgba(59,130,246,0.1)' }} className="px-3.5 py-1.5 rounded-xl mr-2">
                            <Text style={{ color: accent.blue }} className="text-xs font-bold">{exercise.muscleGroup}</Text>
                        </View>
                        {exercise.equipment && (
                            <View style={{ backgroundColor: colors.cardGlass, borderWidth: 1, borderColor: colors.borderLight }} className="px-3.5 py-1.5 rounded-xl">
                                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">{exercise.equipment}</Text>
                            </View>
                        )}
                    </View>

                    {/* Instructions */}
                    {exercise.instructions && (
                        <View style={glassCard} className="rounded-2xl p-5 mb-4">
                            <Text style={{ color: colors.textSecondary, letterSpacing: 1 }} className="text-xs font-bold uppercase mb-4">How to Perform</Text>
                            {exercise.instructions.map((step: string, i: number) => (
                                <View key={i} className="flex-row mb-4">
                                    <View style={{ backgroundColor: accent.greenBg, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' }} className="w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5">
                                        <Text style={{ color: accent.green }} className="text-xs font-bold">{i + 1}</Text>
                                    </View>
                                    <Text style={{ color: colors.text, lineHeight: 22 }} className="flex-1 text-base">{step}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Video Link */}
                    {exercise.videoUrl && (
                        <TouchableOpacity
                            style={{
                                backgroundColor: isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(239,68,68,0.12)' : '#fecaca',
                                ...shadows.sm,
                            }}
                            className="rounded-2xl p-4 mb-4 flex-row items-center"
                            onPress={() => Linking.openURL(exercise.videoUrl)}
                        >
                            <View style={{ backgroundColor: accent.redBg }} className="w-11 h-11 rounded-xl items-center justify-center">
                                <Youtube size={22} color={accent.red} />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text style={{ color: colors.text }} className="font-bold">Watch Tutorial</Text>
                                <Text style={{ color: colors.textTertiary }} className="text-xs mt-0.5">Video demonstration on YouTube</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Add to Workout */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: accent.green,
                            ...shadows.glow(accent.green),
                        }}
                        className="py-4 rounded-2xl flex-row items-center justify-center mt-2"
                        onPress={handleAddToWorkout}
                        activeOpacity={0.8}
                    >
                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold text-base ml-2">
                            {activeWorkout ? 'Add to Workout' : 'Start Workout & Add'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
