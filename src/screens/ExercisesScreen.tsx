import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_EXERCISES } from '../constants/mockData';
import { Search, ChevronRight, Filter } from 'lucide-react-native';

export default function ExercisesScreen({ navigation }: any) {
    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center"
            onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
        >
            <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-lg bg-gray-200 mr-4"
            />
            <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.muscleGroup} • {item.difficulty}</Text>
            </View>
            <ChevronRight color="#9ca3af" size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4 pb-0">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Exercise Library</Text>

            {/* Search Bar */}
            <View className="flex-row items-center space-x-3 mb-6">
                <View className="flex-1 bg-white flex-row items-center p-3 rounded-xl border border-gray-200">
                    <Search color="#9ca3af" size={20} className="mr-2" />
                    <TextInput
                        placeholder="Search exercises..."
                        className="flex-1 text-gray-900 text-base"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <TouchableOpacity className="bg-white p-3 rounded-xl border border-gray-200">
                    <Filter color="#4b5563" size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_EXERCISES}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </SafeAreaView>
    );
}
