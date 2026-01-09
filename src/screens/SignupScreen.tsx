import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';

export default function SignupScreen({ navigation }: any) {
    const { isLoaded, signUp, setActive } = useSignUp();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            await signUp.create({
                emailAddress,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            setPendingVerification(true);
        } catch (err: any) {
            Alert.alert("Error", err.errors[0]?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            await setActive({ session: completeSignUp.createdSessionId });
        } catch (err: any) {
            Alert.alert("Error", err.errors[0]?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center p-6">
            <Text className="text-3xl font-bold mb-8 text-center text-gray-900">
                {pendingVerification ? "Verify Email" : "Create Account"}
            </Text>

            {!pendingVerification ? (
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
            ) : (
                <View className="space-y-4">
                    <View>
                        <Text className="mb-2 text-gray-600 font-medium">Verification Code</Text>
                        <TextInput
                            value={code}
                            placeholder="Enter code..."
                            onChangeText={setCode}
                            className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                        />
                    </View>
                    <TouchableOpacity
                        className="bg-blue-600 w-full py-4 rounded-xl items-center mt-6"
                        onPress={onPressVerify}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Verify Email</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
