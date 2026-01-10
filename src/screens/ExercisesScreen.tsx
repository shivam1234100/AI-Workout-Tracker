import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_EXERCISES } from '../constants/mockData';
import { Search, ChevronRight, Filter } from 'lucide-react-native';

export default function ExercisesScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedBodyPart, setSelectedBodyPart] = React.useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = React.useState('All');

    const bodyParts = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Glutes'];
    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'text-green-600';
            case 'intermediate': return 'text-orange-500';
            case 'advanced': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const filteredExercises = MOCK_EXERCISES.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBodyPart = selectedBodyPart === 'All' || ex.muscleGroup === selectedBodyPart;
        const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;
        return matchesSearch && matchesBodyPart && matchesDifficulty;
    });

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm flex-row items-center"
            onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
        >
            <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 mr-4"
            />
            <View className="flex-1">
                <Text className="text-gray-900 dark:text-white font-bold text-lg">{item.name}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {item.muscleGroup} • <Text className={`font-bold ${getDifficultyColor(item.difficulty)}`}>{item.difficulty}</Text>
                </Text>
            </View>
            <ChevronRight color="#9ca3af" size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 pb-0">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Exercise Library</Text>

            {/* Search Bar */}
            <View className="flex-row items-center space-x-3 mb-4">
                <View className="flex-1 bg-white dark:bg-gray-800 flex-row items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Search color="#9ca3af" size={20} className="mr-2" />
                    <TextInput
                        placeholder="Search exercises..."
                        className="flex-1 text-gray-900 dark:text-white text-base"
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filters */}
            <View className="mb-4">
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Body Part</Text>
                <FlatList
                    horizontal
                    data={bodyParts}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedBodyPart(item)}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedBodyPart === item ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                            <Text className={`font-medium ${selectedBodyPart === item ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    className="mb-3"
                />

                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Difficulty</Text>
                <FlatList
                    horizontal
                    data={difficulties}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedDifficulty(item)}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedDifficulty === item ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                            <Text className={`font-medium ${selectedDifficulty === item ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="items-center py-10">
                        <Text className="text-gray-500 dark:text-gray-400">No exercises found matches your filters.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
