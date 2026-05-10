import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { Mail, Lock, User, Phone, Dumbbell, Zap } from 'lucide-react-native';

export default function SignupScreen({ navigation }: any) {
    const [mode, setMode] = useState<'email' | 'phone'>('email');
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuthStore();
    const { isDark, colors } = useTheme();

    const handleSignup = async () => {
        if (!name || !identifier || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const input: any = { name, password };
            if (mode === 'email') input.email = identifier.trim();
            else input.phone = identifier.trim();

            const result = await register(input);
            if (!result.success) {
                Alert.alert('Signup Failed', result.error || 'Please try again');
            }
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const glassInput = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                    <View className="items-center mb-8">
                        <View style={{
                            backgroundColor: accent.greenBg,
                            borderWidth: 2,
                            borderColor: 'rgba(16,185,129,0.2)',
                            ...shadows.glow(accent.green),
                        }} className="w-20 h-20 rounded-3xl items-center justify-center mb-4">
                            <Dumbbell size={36} color={accent.green} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-3xl font-bold">Create Account</Text>
                        <Text style={{ color: colors.textSecondary }} className="mt-1.5 text-sm">Start your fitness journey</Text>
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

                    <View style={glassInput} className="rounded-2xl p-4 mb-3 flex-row items-center">
                        <View style={{ backgroundColor: accent.purpleBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                            <User size={16} color={accent.purple} />
                        </View>
                        <TextInput
                            style={{ color: colors.text }}
                            className="flex-1 text-base"
                            placeholder="Full Name"
                            placeholderTextColor={colors.textTertiary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={glassInput} className="rounded-2xl p-4 mb-3 flex-row items-center">
                        <View style={{ backgroundColor: accent.greenBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                            {mode === 'email' ? <Mail size={16} color={accent.green} /> : <Phone size={16} color={accent.green} />}
                        </View>
                        <TextInput
                            style={{ color: colors.text }}
                            className="flex-1 text-base"
                            placeholder={mode === 'email' ? 'Email' : 'Phone (e.g. +1234567890)'}
                            placeholderTextColor={colors.textTertiary}
                            value={identifier}
                            onChangeText={setIdentifier}
                            keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={glassInput} className="rounded-2xl p-4 mb-6 flex-row items-center">
                        <View style={{ backgroundColor: accent.indigoBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                            <Lock size={16} color={accent.indigo} />
                        </View>
                        <TextInput
                            style={{ color: colors.text }}
                            className="flex-1 text-base"
                            placeholder="Password (min 6 characters)"
                            placeholderTextColor={colors.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: accent.green,
                            ...shadows.glow(accent.green),
                            opacity: isLoading ? 0.6 : 1,
                        }}
                        className="py-4 rounded-2xl items-center mb-6 flex-row justify-center"
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : (
                            <>
                                <Zap size={18} color="white" />
                                <Text className="text-white font-bold text-base ml-2">Create Account</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center">
                        <Text style={{ color: colors.textSecondary }} className="text-sm">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ color: accent.green }} className="text-sm font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
