import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PlayCircle } from 'lucide-react-native';
import { useWorkoutStore } from '../store/workoutStore';

export default function ExerciseDetailScreen({ route, navigation }: any) {
    const { exercise } = route.params;
    const { activeWorkout, startWorkout, addExercise } = useWorkoutStore();

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
                            // Need a small timeout or improved store logic to ensure sync, 
                            // but Zustand is sync usually.
                            addExercise(exercise);
                            navigation.navigate('Workout');
                        }
                    }
                ]
            );
        } else {
            addExercise(exercise);
            navigation.navigate('Workout');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View className="relative">
                    <Image
                        source={{ uri: exercise.image }}
                        className="w-full h-72 bg-gray-200"
                    />
                    <TouchableOpacity
                        className="absolute top-4 left-4 bg-white/80 p-2 rounded-full"
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft color="#000" size={24} />
                    </TouchableOpacity>
                </View>

                <View className="p-6 -mt-6 bg-white rounded-t-3xl">
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-3xl font-bold text-gray-900 mb-1">{exercise.name}</Text>
                            <Text className="text-blue-600 font-medium text-base">{exercise.muscleGroup} • {exercise.equipment}</Text>
                        </View>
                        <View className="bg-orange-100 px-3 py-1 rounded-full">
                            <Text className="text-orange-700 text-xs font-bold uppercase">{exercise.difficulty}</Text>
                        </View>
                    </View>

                    <View className="h-[1px] bg-gray-100 my-6" />

                    <Text className="text-xl font-bold text-gray-900 mb-4">Instructions</Text>
                    {exercise.instructions.map((step: string, index: number) => (
                        <View key={index} className="flex-row mb-4">
                            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-4">
                                <Text className="text-blue-600 font-bold">{index + 1}</Text>
                            </View>
                            <Text className="flex-1 text-gray-600 text-base leading-6 mt-1">{step}</Text>
                        </View>
                    ))}

                    <View className="h-24" />
                </View>
            </ScrollView>

            {/* Floating Action Button for adding to workout */}
            <View className="absolute bottom-8 left-6 right-6">
                <TouchableOpacity
                    className="bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg active:bg-blue-700"
                    onPress={handleAddToWorkout}
                >
                    <PlayCircle color="white" size={24} className="mr-2" />
                    <Text className="text-white font-bold text-lg">Add to Workout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
