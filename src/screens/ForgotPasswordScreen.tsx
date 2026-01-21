import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'reset'>('email');

    const onSendResetLink = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate reset code');
            }

            // If resetCode is returned (email not configured), pre-fill it
            if (data.resetCode) {
                setResetCode(data.resetCode);
                Alert.alert(
                    "Reset Code Generated",
                    `Your reset code is: ${data.resetCode}\n\nEnter this code below to reset your password.`,
                    [{ text: "OK", onPress: () => setStep('reset') }]
                );
            } else {
                Alert.alert(
                    "Reset Code Sent",
                    "A 6-digit reset code has been sent to your email. Please check your inbox.",
                    [{ text: "OK", onPress: () => setStep('reset') }]
                );
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to generate reset code");
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async () => {
        if (!resetCode || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetCode, newPassword }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            Alert.alert(
                "Password Reset Successful",
                "Your password has been reset. Please log in with your new password.",
                [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center p-6">
            <Text className="text-3xl font-bold mb-2 text-center text-gray-900">
                {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text className="text-gray-500 text-center mb-8">
                {step === 'email'
                    ? 'Enter your email to receive a reset link'
                    : 'Enter the reset code from your email'
                }
            </Text>

            {step === 'email' ? (
                <View className="space-y-4">
                    <View>
                        <Text className="mb-2 text-gray-600 font-medium">Email</Text>
                        <TextInput
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            placeholder="Enter your email..."
                            onChangeText={setEmail}
                            className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-blue-600 w-full py-4 rounded-xl items-center mt-6"
                        onPress={onSendResetLink}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Reset Link</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="space-y-4">
                    <View>
                        <Text className="mb-2 text-gray-600 font-medium">Reset Code</Text>
                        <TextInput
                            autoCapitalize="characters"
                            value={resetCode}
                            placeholder="Enter reset code from email..."
                            onChangeText={setResetCode}
                            className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 text-gray-600 font-medium">New Password</Text>
                        <TextInput
                            value={newPassword}
                            placeholder="Enter new password..."
                            secureTextEntry={true}
                            onChangeText={setNewPassword}
                            className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 text-gray-600 font-medium">Confirm Password</Text>
                        <TextInput
                            value={confirmPassword}
                            placeholder="Confirm new password..."
                            secureTextEntry={true}
                            onChangeText={setConfirmPassword}
                            className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-900"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-blue-600 w-full py-4 rounded-xl items-center mt-6"
                        onPress={onResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Reset Password</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setStep('email')}
                        className="mt-4 items-center"
                    >
                        <Text className="text-blue-600 font-medium">← Back to Email</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="mt-6 items-center"
            >
                <Text className="text-gray-500">Remember your password? <Text className="text-blue-600 font-semibold">Log in</Text></Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
