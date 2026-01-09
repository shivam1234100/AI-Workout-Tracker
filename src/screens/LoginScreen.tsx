import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/clerk-expo';

export default function LoginScreen({ navigation }: any) {
    const { signIn, setActive, isLoaded } = useSignIn();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });

            // This indicates the user is signed in
            await setActive({ session: completeSignIn.createdSessionId });
        } catch (err: any) {
            Alert.alert("Error", err.errors[0]?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center p-6">
            <Text className="text-3xl font-bold mb-8 text-center text-gray-900">Welcome Back</Text>

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
                    onPress={onSignInPress}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Log In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-4 items-center">
                    <Text className="text-gray-500">Don't have an account? <Text className="text-blue-600 font-semibold">Sign up</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
