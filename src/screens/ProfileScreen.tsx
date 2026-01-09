import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function ProfileScreen({ navigation }: any) {
    const { signOut } = useAuth();
    const { user } = useUser();

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

            <View className="bg-white p-6 rounded-xl mb-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800">{user?.primaryEmailAddress?.emailAddress}</Text>
                <Text className="text-gray-500 mt-1">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '...'}</Text>
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
