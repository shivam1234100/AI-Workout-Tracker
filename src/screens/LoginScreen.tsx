import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { Mail, Lock, Phone, Dumbbell } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
    const { login, isLoading } = useAuthStore();
    const { isDark, colors } = useTheme();
    const [mode, setMode] = useState<'email' | 'phone'>('email');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!identifier.trim() || !password) {
            Alert.alert('Error', `Please enter ${mode === 'email' ? 'email' : 'phone'} and password`);
            return;
        }
        const input: any = { password };
        if (mode === 'email') input.email = identifier.trim();
        else input.phone = identifier.trim();

        const res = await login(input);
        if (!res.success) {
            Alert.alert('Login failed', res.error || 'Try again');
        }
    };

    const inputStyle = {
        backgroundColor: colors.inputBg,
        borderColor: colors.borderInput,
        color: colors.text,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                    <View className="items-center mb-8">
                        <View style={{ backgroundColor: accent.green, ...shadows.glow(accent.green) }} className="w-16 h-16 rounded-3xl items-center justify-center mb-4">
                            <Dumbbell size={28} color="white" />
                        </View>
                        <Text style={{ color: colors.text }} className="text-3xl font-bold mb-1">Welcome Back</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-sm">Sign in to continue your fitness journey</Text>
                    </View>

                    {/* Mode toggle */}
                    <View
                        style={{ backgroundColor: isDark ? '#1a1f2e' : '#f3f4f6', borderColor: colors.borderLight, borderWidth: 1 }}
                        className="flex-row rounded-xl p-1 mb-4"
                    >
                        <TouchableOpacity
                            className="flex-1 py-2 rounded-lg items-center"
                            style={{ backgroundColor: mode === 'email' ? accent.green : 'transparent' }}
                            onPress={() => { setMode('email'); setIdentifier(''); }}
                        >
                            <Text style={{ color: mode === 'email' ? 'white' : colors.textSecondary, fontWeight: '700', fontSize: 13 }}>Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 py-2 rounded-lg items-center"
                            style={{ backgroundColor: mode === 'phone' ? accent.green : 'transparent' }}
                            onPress={() => { setMode('phone'); setIdentifier(''); }}
                        >
                            <Text style={{ color: mode === 'phone' ? 'white' : colors.textSecondary, fontWeight: '700', fontSize: 13 }}>Phone</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-3">
                        <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase mb-1.5 ml-1">
                            {mode === 'email' ? 'Email' : 'Phone Number'}
                        </Text>
                        <View style={[inputStyle, { borderWidth: 1 }]} className="rounded-xl px-4 py-3 flex-row items-center">
                            {mode === 'email'
                                ? <Mail size={16} color={colors.textTertiary} />
                                : <Phone size={16} color={colors.textTertiary} />
                            }
                            <TextInput
                                className="flex-1 ml-3 text-base"
                                style={{ color: colors.text }}
                                placeholder={mode === 'email' ? 'you@example.com' : '+1234567890'}
                                placeholderTextColor={colors.textTertiary}
                                value={identifier}
                                onChangeText={setIdentifier}
                                autoCapitalize="none"
                                keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'}
                            />
                        </View>
                    </View>

                    <View className="mb-2">
                        <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase mb-1.5 ml-1">Password</Text>
                        <View style={[inputStyle, { borderWidth: 1 }]} className="rounded-xl px-4 py-3 flex-row items-center">
                            <Lock size={16} color={colors.textTertiary} />
                            <TextInput
                                className="flex-1 ml-3 text-base"
                                style={{ color: colors.text }}
                                placeholder="Your password"
                                placeholderTextColor={colors.textTertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {mode === 'email' && (
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="self-end mb-4 mt-1">
                            <Text style={{ color: accent.green, fontSize: 13, fontWeight: '600' }}>Forgot password?</Text>
                        </TouchableOpacity>
                    )}
                    {mode === 'phone' && <View className="mb-4" />}

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={{ backgroundColor: accent.green, opacity: isLoading ? 0.6 : 1, ...shadows.glow(accent.green) }}
                        className="rounded-xl py-3.5 items-center mb-4"
                        activeOpacity={0.85}
                    >
                        {isLoading
                            ? <ActivityIndicator color="white" />
                            : <Text className="text-white font-bold text-base">Sign In</Text>
                        }
                    </TouchableOpacity>

                    <View className="flex-row justify-center">
                        <Text style={{ color: colors.textSecondary }} className="text-sm">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={{ color: accent.green }} className="text-sm font-bold">Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
