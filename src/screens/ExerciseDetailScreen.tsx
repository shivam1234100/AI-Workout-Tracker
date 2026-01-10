import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PlayCircle, Youtube } from 'lucide-react-native';
import { useWorkoutStore } from '../store/workoutStore';
import { useColorScheme } from 'nativewind';

export default function ExerciseDetailScreen({ route, navigation }: any) {
    const { exercise } = route.params;
    const { activeWorkout, startWorkout, addExercise } = useWorkoutStore();
    const { colorScheme } = useColorScheme();

    const openVideoTutorial = async () => {
        // Use explicit videoUrl if available, otherwise search YouTube
        const query = encodeURIComponent(`${exercise.name} exercise form tutorial`);
        const url = exercise.videoUrl || `https://www.youtube.com/results?search_query=${query}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                await Linking.openURL(url); // Try opening anyway (browsers usually handle it)
            }
        } catch (error) {
            Alert.alert("Error", "Could not open video tutorial.");
        }
    };

    const handleAddToWorkout = () => {
        if (!activeWorkout) {
            Alert.alert(
                "Start Workout?",
                "No active workout found. Start one now?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Start & Add", onPress: () => {
                            startWorkout();
                            addExercise(exercise);
                            navigation.navigate('Main', { screen: 'Workout' });
                        }
                    }
                ]
            );
        } else {
            addExercise(exercise);
            navigation.navigate('Main', { screen: 'Workout' });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View className="relative">
                    <Image
                        source={{ uri: exercise.image }}
                        className="w-full h-72 bg-gray-200 dark:bg-gray-800"
                    />
                    <TouchableOpacity
                        className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 p-2 rounded-full"
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft color={colorScheme === 'dark' ? '#fff' : '#000'} size={24} />
                    </TouchableOpacity>
                </View>

                <View className="p-6 -mt-6 bg-white dark:bg-gray-900 rounded-t-3xl border-t border-transparent dark:border-gray-800">
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{exercise.name}</Text>
                            <Text className="text-blue-600 dark:text-blue-400 font-medium text-base">{exercise.muscleGroup} • {exercise.equipment}</Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${exercise.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30' :
                            exercise.difficulty === 'Intermediate' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                'bg-red-100 dark:bg-red-900/30'
                            }`}>
                            <Text className={`text-xs font-bold uppercase ${exercise.difficulty === 'Beginner' ? 'text-green-700 dark:text-green-400' :
                                exercise.difficulty === 'Intermediate' ? 'text-orange-700 dark:text-orange-400' :
                                    'text-red-700 dark:text-red-400'
                                }`}>{exercise.difficulty}</Text>
                        </View>
                    </View>

                    {/* Tutorial Button */}
                    <TouchableOpacity
                        className="flex-row items-center bg-red-600/10 dark:bg-red-900/20 p-3 rounded-xl mt-4 mb-2 self-start"
                        onPress={openVideoTutorial}
                    >
                        <Youtube size={20} color="#dc2626" className="mr-2" />
                        <Text className="text-red-600 dark:text-red-400 font-semibold">Watch Tutorial</Text>
                    </TouchableOpacity>

                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-6" />

                    <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">Instructions</Text>
                    {exercise.instructions.map((step: string, index: number) => (
                        <View key={index} className="flex-row mb-4">
                            <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 items-center justify-center mr-4">
                                <Text className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}</Text>
                            </View>
                            <Text className="flex-1 text-gray-600 dark:text-gray-300 text-base leading-6 mt-1">{step}</Text>
                        </View>
                    ))}

                    <View className="h-24" />
                </View>
            </ScrollView>

            {/* Floating Action Button for adding to workout */}
            <View className="absolute bottom-8 left-6 right-6">
                <TouchableOpacity
                    className="bg-blue-600 hover:bg-blue-700 py-4 rounded-xl flex-row justify-center items-center shadow-lg"
                    onPress={handleAddToWorkout}
                >
                    <PlayCircle color="white" size={24} className="mr-2" />
                    <Text className="text-white font-bold text-lg">Add to Workout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
