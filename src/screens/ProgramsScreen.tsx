import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { useProgramStore } from '../store/programStore';
import { COACH_PROGRAMS, CoachProgram, UserProgram } from '../constants/coachPrograms';
import { BookOpen, Plus, ChevronRight, Dumbbell, Crown, User } from 'lucide-react-native';

const getDifficultyColor = (d?: string) => {
    switch (d) {
        case 'Beginner': return accent.green;
        case 'Intermediate': return accent.amber;
        case 'Advanced': return accent.red;
        default: return accent.blue;
    }
};

export default function ProgramsScreen({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const { userPrograms, isLoading, fetchUserPrograms } = useProgramStore();

    useEffect(() => { fetchUserPrograms(); }, []);

    const glassCard = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    const renderCoachCard = (program: CoachProgram) => (
        <TouchableOpacity
            key={program.id}
            style={glassCard}
            className="mr-3 rounded-2xl p-4"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProgramDetail', { program, isCoach: true })}
        >
            <View style={{ width: 200 }}>
                <View className="flex-row items-center mb-2">
                    <View style={{ backgroundColor: accent.indigoBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-2.5">
                        <Crown size={16} color={accent.indigo} />
                    </View>
                    <View
                        style={{ backgroundColor: getDifficultyColor(program.difficulty) + '20' }}
                        className="px-2 py-0.5 rounded-full"
                    >
                        <Text style={{ color: getDifficultyColor(program.difficulty), fontSize: 10, fontWeight: '700' }}>
                            {program.difficulty}
                        </Text>
                    </View>
                </View>
                <Text style={{ color: colors.text }} className="font-bold text-base mb-1" numberOfLines={1}>
                    {program.name}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mb-3" numberOfLines={2}>
                    {program.description}
                </Text>
                <View className="flex-row items-center">
                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                        {program.days.length} days  ·  {program.durationWeeks} weeks
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderUserCard = (program: UserProgram) => (
        <TouchableOpacity
            key={program.id}
            style={glassCard}
            className="mx-5 mb-3 rounded-2xl p-4 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProgramDetail', { program, isCoach: false })}
        >
            <View style={{ backgroundColor: accent.greenBg }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                <Dumbbell size={18} color={accent.green} />
            </View>
            <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-bold text-base">{program.name}</Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                    {program.days?.length || 0} days
                    {program.difficulty ? `  ·  ${program.difficulty}` : ''}
                </Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4 pb-2">
                    <View className="flex-row items-center mb-1">
                        <BookOpen size={22} color={accent.green} />
                        <Text style={{ color: colors.text }} className="text-2xl font-bold ml-2">Programs</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">
                        Follow a structured plan to reach your goals
                    </Text>
                </View>

                {/* Coach Programs */}
                <View className="mt-5">
                    <View className="flex-row items-center px-5 mb-3">
                        <Crown size={16} color={accent.indigo} />
                        <Text style={{ color: colors.text }} className="font-bold text-base ml-2">Coach Programs</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
                    >
                        {COACH_PROGRAMS.map(renderCoachCard)}
                    </ScrollView>
                </View>

                {/* My Programs */}
                <View className="mt-7">
                    <View className="flex-row items-center justify-between px-5 mb-3">
                        <View className="flex-row items-center">
                            <User size={16} color={accent.green} />
                            <Text style={{ color: colors.text }} className="font-bold text-base ml-2">My Programs</Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: accent.green }}
                            onPress={() => navigation.navigate('CreateProgram')}
                            activeOpacity={0.8}
                        >
                            <Plus size={14} color="#fff" />
                            <Text className="text-white font-semibold text-xs ml-1">Create</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color={accent.green} style={{ marginTop: 20 }} />
                    ) : userPrograms.length === 0 ? (
                        <View style={glassCard} className="mx-5 rounded-2xl p-6 items-center">
                            <Dumbbell size={32} color={colors.textTertiary} />
                            <Text style={{ color: colors.textSecondary }} className="text-sm mt-3 text-center">
                                No custom programs yet.{'\n'}Create your first program to get started!
                            </Text>
                        </View>
                    ) : (
                        userPrograms.map(renderUserCard)
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
