import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_EXERCISES } from '../constants/mockData';
import { useTheme } from '../context/ThemeContext';
import { Search, ChevronRight, Filter } from 'lucide-react-native';

export default function ExercisesScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedBodyPart, setSelectedBodyPart] = React.useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = React.useState('All');
    const { isDark, colors } = useTheme();

    const bodyParts = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Full Body'];
    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return '#16a34a';
            case 'intermediate': return '#f97316';
            case 'advanced': return '#ef4444';
            default: return colors.textSecondary;
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
            style={{ backgroundColor: colors.card }}
            className="p-4 rounded-xl mb-3 shadow-sm flex-row items-center"
            onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
        >
            <Image
                source={{ uri: item.image }}
                style={{ width: 64, height: 64, borderRadius: 8 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                placeholder={{ blurhash: 'LKO2?V%2Tw=w]~RBVZRi};RPxuwH' }}
            />
            <View className="flex-1 ml-4">
                <Text style={{ color: colors.text }} className="font-bold text-lg">{item.name}</Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                    {item.muscleGroup} • <Text style={{ color: getDifficultyColor(item.difficulty) }} className="font-bold">{item.difficulty}</Text>
                </Text>
            </View>
            <ChevronRight color="#9ca3af" size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="p-4 pb-0">
            <Text style={{ color: colors.text }} className="text-2xl font-bold mb-4">Exercise Library</Text>

            {/* Search Bar */}
            <View className="flex-row items-center space-x-3 mb-4">
                <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="flex-1 flex-row items-center p-3 rounded-xl border">
                    <Search color="#9ca3af" size={20} className="mr-2" />
                    <TextInput
                        placeholder="Search exercises..."
                        style={{ color: colors.text }}
                        className="flex-1 text-base"
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filters */}
            <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-2 uppercase tracking-wider">Body Part</Text>
                <FlatList
                    horizontal
                    data={bodyParts}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedBodyPart(item)}
                            style={selectedBodyPart !== item ? { backgroundColor: isDark ? '#374151' : '#e5e7eb' } : undefined}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedBodyPart === item ? 'bg-blue-600' : ''}`}
                        >
                            <Text style={selectedBodyPart !== item ? { color: isDark ? '#d1d5db' : '#374151' } : undefined} className={`font-medium ${selectedBodyPart === item ? 'text-white' : ''}`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    className="mb-3"
                />

                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-2 uppercase tracking-wider">Difficulty</Text>
                <FlatList
                    horizontal
                    data={difficulties}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedDifficulty(item)}
                            style={selectedDifficulty !== item ? { backgroundColor: isDark ? '#374151' : '#e5e7eb' } : undefined}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedDifficulty === item ? 'bg-blue-600' : ''}`}
                        >
                            <Text style={selectedDifficulty !== item ? { color: isDark ? '#d1d5db' : '#374151' } : undefined} className={`font-medium ${selectedDifficulty === item ? 'text-white' : ''}`}>
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
                        <Text style={{ color: colors.textSecondary }}>No exercises found matches your filters.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
