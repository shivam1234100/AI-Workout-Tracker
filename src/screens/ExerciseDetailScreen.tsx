import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PlayCircle, Youtube } from 'lucide-react-native';
import { useWorkoutStore } from '../store/workoutStore';
import { useTheme } from '../context/ThemeContext';

export default function ExerciseDetailScreen({ route, navigation }: any) {
    const { exercise } = route.params;
    const { activeWorkout, startWorkout, addExercise } = useWorkoutStore();
    const { isDark, colors } = useTheme();

    const openVideoTutorial = async () => {
        const query = encodeURIComponent(`${exercise.name} exercise form tutorial`);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${query}`;
        const url = exercise.videoUrl || youtubeSearchUrl;
        try {
            await Linking.openURL(url);
        } catch (error) {
            try { await Linking.openURL(youtubeSearchUrl); }
            catch { Alert.alert("Error", "Could not open video tutorial."); }
        }
    };

    const handleAddToWorkout = () => {
        if (!activeWorkout) {
            Alert.alert("Start Workout?", "No active workout found. Start one now?", [
                { text: "Cancel", style: "cancel" },
                { text: "Start & Add", onPress: () => { startWorkout(); addExercise(exercise); navigation.navigate('Main', { screen: 'Workout' }); } }
            ]);
        } else {
            addExercise(exercise);
            navigation.navigate('Main', { screen: 'Workout' });
        }
    };

    const getDiffBg = () => {
        if (exercise.difficulty === 'Beginner') return isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4';
        if (exercise.difficulty === 'Intermediate') return isDark ? 'rgba(249,115,22,0.15)' : '#fff7ed';
        return isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2';
    };
    const getDiffText = () => {
        if (exercise.difficulty === 'Beginner') return isDark ? '#4ade80' : '#15803d';
        if (exercise.difficulty === 'Intermediate') return isDark ? '#fb923c' : '#c2410c';
        return isDark ? '#f87171' : '#b91c1c';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="relative">
                    <Image source={{ uri: exercise.image }} style={{ width: '100%', height: 288, backgroundColor: colors.cardAlt }} />
                    <TouchableOpacity
                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }}
                        className="absolute top-4 left-4 p-2 rounded-full"
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft color={isDark ? '#fff' : '#000'} size={24} />
                    </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: colors.background, borderTopColor: colors.border }} className="p-6 -mt-6 rounded-t-3xl border-t">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-2">
                            <Text style={{ color: colors.text }} className="text-3xl font-bold mb-1">{exercise.name}</Text>
                            <Text className="text-blue-600 font-medium text-base">{exercise.muscleGroup} • {exercise.equipment}</Text>
                        </View>
                        <View style={{ backgroundColor: getDiffBg() }} className="px-3 py-1 rounded-full">
                            <Text style={{ color: getDiffText() }} className="text-xs font-bold uppercase">{exercise.difficulty}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{ backgroundColor: isDark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.1)' }}
                        className="flex-row items-center p-3 rounded-xl mt-4 mb-2 self-start"
                        onPress={openVideoTutorial}
                    >
                        <Youtube size={20} color="#dc2626" className="mr-2" />
                        <Text style={{ color: isDark ? '#f87171' : '#dc2626' }} className="font-semibold">Watch Tutorial</Text>
                    </TouchableOpacity>

                    <View style={{ backgroundColor: colors.border }} className="h-[1px] my-6" />

                    <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Instructions</Text>
                    {exercise.instructions.map((step: string, index: number) => (
                        <View key={index} className="flex-row mb-4">
                            <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff' }} className="w-8 h-8 rounded-full items-center justify-center mr-4">
                                <Text className="text-blue-600 font-bold">{index + 1}</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="flex-1 text-base leading-6 mt-1">{step}</Text>
                        </View>
                    ))}
                    <View className="h-24" />
                </View>
            </ScrollView>

            <View className="absolute bottom-8 left-6 right-6">
                <TouchableOpacity className="bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg" onPress={handleAddToWorkout}>
                    <PlayCircle color="white" size={24} className="mr-2" />
                    <Text className="text-white font-bold text-lg">Add to Workout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
