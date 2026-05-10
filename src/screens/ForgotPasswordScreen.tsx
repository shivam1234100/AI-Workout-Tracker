import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { API_URL } from '../constants/api';
import { ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
    const { colors } = useTheme();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const requestCode = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Enter your email');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            if (data.resetCode) {
                Alert.alert('Reset Code', `Your code: ${data.resetCode}`);
            } else {
                Alert.alert('Sent', 'Check your email for the code');
            }
            setStep(2);
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!code || !newPassword) {
            Alert.alert('Error', 'Enter code and new password');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: code, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            Alert.alert('Success', 'Password reset successful', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        backgroundColor: colors.inputBg,
        borderColor: colors.borderInput,
        color: colors.text,
        borderWidth: 1,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={{ color: colors.text }} className="text-3xl font-bold mb-2">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mb-6">
                        {step === 1 ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
                    </Text>

                    {step === 1 ? (
                        <>
                            <View className="mb-4">
                                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase mb-1.5 ml-1">Email</Text>
                                <View style={inputStyle} className="rounded-xl px-4 py-3 flex-row items-center">
                                    <Mail size={16} color={colors.textTertiary} />
                                    <TextInput
                                        className="flex-1 ml-3 text-base"
                                        style={{ color: colors.text }}
                                        placeholder="you@example.com"
                                        placeholderTextColor={colors.textTertiary}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={requestCode}
                                disabled={isLoading}
                                style={{ backgroundColor: accent.green, opacity: isLoading ? 0.6 : 1 }}
                                className="rounded-xl py-3.5 items-center"
                                activeOpacity={0.85}
                            >
                                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Send Reset Code</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View className="mb-3">
                                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase mb-1.5 ml-1">Reset Code</Text>
                                <View style={inputStyle} className="rounded-xl px-4 py-3 flex-row items-center">
                                    <KeyRound size={16} color={colors.textTertiary} />
                                    <TextInput
                                        className="flex-1 ml-3 text-base"
                                        style={{ color: colors.text }}
                                        placeholder="6-digit code"
                                        placeholderTextColor={colors.textTertiary}
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase mb-1.5 ml-1">New Password</Text>
                                <View style={inputStyle} className="rounded-xl px-4 py-3 flex-row items-center">
                                    <Lock size={16} color={colors.textTertiary} />
                                    <TextInput
                                        className="flex-1 ml-3 text-base"
                                        style={{ color: colors.text }}
                                        placeholder="New password"
                                        placeholderTextColor={colors.textTertiary}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={resetPassword}
                                disabled={isLoading}
                                style={{ backgroundColor: accent.green, opacity: isLoading ? 0.6 : 1 }}
                                className="rounded-xl py-3.5 items-center"
                                activeOpacity={0.85}
                            >
                                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Reset Password</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
