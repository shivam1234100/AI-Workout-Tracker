import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }: any) {
    const { colors } = useTheme();
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
            if (!response.ok) throw new Error(data.error || 'Failed to generate reset code');
            if (data.resetCode) {
                setResetCode(data.resetCode);
                Alert.alert("Reset Code Generated", `Your reset code is: ${data.resetCode}\n\nEnter this code below to reset your password.`, [{ text: "OK", onPress: () => setStep('reset') }]);
            } else {
                Alert.alert("Reset Code Sent", "A 6-digit reset code has been sent to your email.", [{ text: "OK", onPress: () => setStep('reset') }]);
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to generate reset code");
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async () => {
        if (!resetCode || !newPassword || !confirmPassword) { Alert.alert("Error", "Please fill in all fields"); return; }
        if (newPassword !== confirmPassword) { Alert.alert("Error", "Passwords do not match"); return; }
        if (newPassword.length < 6) { Alert.alert("Error", "Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetCode, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to reset password');
            Alert.alert("Password Reset Successful", "Your password has been reset. Please log in with your new password.", [{ text: "OK", onPress: () => navigation.navigate('Login') }]);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="justify-center p-6">
            <Text style={{ color: colors.text }} className="text-3xl font-bold mb-2 text-center">
                {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mb-8">
                {step === 'email' ? 'Enter your email to receive a reset link' : 'Enter the reset code from your email'}
            </Text>

            {step === 'email' ? (
                <View className="space-y-4">
                    <View>
                        <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">Email</Text>
                        <TextInput autoCapitalize="none" keyboardType="email-address" value={email} placeholder="Enter your email..." placeholderTextColor="#9ca3af" onChangeText={setEmail}
                            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                            className="w-full border rounded-xl p-4" />
                    </View>
                    <TouchableOpacity className="bg-blue-600 w-full py-4 rounded-xl items-center mt-6" onPress={onSendResetLink} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Send Reset Link</Text>}
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="space-y-4">
                    <View>
                        <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">Reset Code</Text>
                        <TextInput autoCapitalize="characters" value={resetCode} placeholder="Enter reset code..." placeholderTextColor="#9ca3af" onChangeText={setResetCode}
                            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                            className="w-full border rounded-xl p-4" />
                    </View>
                    <View>
                        <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">New Password</Text>
                        <TextInput value={newPassword} placeholder="Enter new password..." placeholderTextColor="#9ca3af" secureTextEntry onChangeText={setNewPassword}
                            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                            className="w-full border rounded-xl p-4" />
                    </View>
                    <View>
                        <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">Confirm Password</Text>
                        <TextInput value={confirmPassword} placeholder="Confirm new password..." placeholderTextColor="#9ca3af" secureTextEntry onChangeText={setConfirmPassword}
                            style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                            className="w-full border rounded-xl p-4" />
                    </View>
                    <TouchableOpacity className="bg-blue-600 w-full py-4 rounded-xl items-center mt-6" onPress={onResetPassword} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Reset Password</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStep('email')} className="mt-4 items-center">
                        <Text className="text-blue-600 font-medium">← Back to Email</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6 items-center">
                <Text style={{ color: colors.textSecondary }}>Remember your password? <Text className="text-blue-600 font-semibold">Log in</Text></Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
