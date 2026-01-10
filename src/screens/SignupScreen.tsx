import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

export default function SignupScreen({ navigation }: any) {
    const { signUp } = useAuthStore();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignUpPress = async () => {
        if (!emailAddress || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await signUp(emailAddress, password);
            // Navigation handled by RootNavigator state change
        } catch (err: any) {
            Alert.alert("Error", "Message failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center p-6">
            <Text className="text-3xl font-bold mb-8 text-center text-gray-900">Create Account</Text>

            <View className="space-y-4">
                <View>
                    <Text className="mb-2 text-gray-600 font-medium">Email</Text>
                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Enter email..."
                        onChangeText={setEmailAddress}
                        className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                    />
                </View>

                <View>
                    <Text className="mb-2 text-gray-600 font-medium">Password</Text>
                    <TextInput
                        value={password}
                        placeholder="Enter password..."
                        secureTextEntry={true}
                        onChangeText={setPassword}
                        className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-600 w-full py-4 rounded-xl items-center mt-6"
                    onPress={onSignUpPress}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4 items-center">
                    <Text className="text-gray-500">Already have an account? <Text className="text-blue-600 font-semibold">Log in</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
