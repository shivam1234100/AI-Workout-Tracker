import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

export default function SignupScreen({ navigation }: any) {
    const { signUp } = useAuthStore();
    const { colors } = useTheme();

    const [firstName, setFirstName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignUpPress = async () => {
        if (!firstName || !emailAddress || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            await signUp(emailAddress, password, firstName);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="justify-center p-6">
            <Text style={{ color: colors.text }} className="text-3xl font-bold mb-8 text-center">Create Account</Text>

            <View className="space-y-4">
                <View>
                    <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">First Name</Text>
                    <TextInput
                        autoCapitalize="words"
                        value={firstName}
                        placeholder="Enter your first name..."
                        placeholderTextColor="#9ca3af"
                        onChangeText={setFirstName}
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                        className="w-full border rounded-xl p-4"
                    />
                </View>

                <View>
                    <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">Email</Text>
                    <TextInput
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={emailAddress}
                        placeholder="Enter email..."
                        placeholderTextColor="#9ca3af"
                        onChangeText={setEmailAddress}
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                        className="w-full border rounded-xl p-4"
                    />
                </View>

                <View>
                    <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium">Password</Text>
                    <TextInput
                        value={password}
                        placeholder="Enter password (min 6 characters)..."
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={true}
                        onChangeText={setPassword}
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.borderInput, color: colors.text }}
                        className="w-full border rounded-xl p-4"
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
                    <Text style={{ color: colors.textSecondary }}>Already have an account? <Text className="text-blue-600 font-semibold">Log in</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
