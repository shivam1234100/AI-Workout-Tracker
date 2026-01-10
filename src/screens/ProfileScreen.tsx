import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

export default function ProfileScreen({ navigation }: any) {
    const { signOut, user } = useAuthStore();

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</Text>

            <View className="bg-white p-6 rounded-xl mb-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800">{user?.email}</Text>
                <Text className="text-gray-500 mt-1">Local Account</Text>
            </View>

            <TouchableOpacity
                className="bg-red-500 px-6 py-3 rounded-xl items-center"
                onPress={() => signOut()}
            >
                <Text className="text-white font-semibold">Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
