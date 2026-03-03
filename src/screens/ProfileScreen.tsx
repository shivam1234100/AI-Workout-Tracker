import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Ruler, Weight, Save, LogOut, ChevronDown } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function ProfileScreen({ navigation }: any) {
    const { signOut, user, updateProfile, fetchProfile } = useAuthStore();

    const [height, setHeight] = useState(user?.height?.toString() || '');
    const [weight, setWeight] = useState(user?.weight?.toString() || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Sync state when user data loads from fetchProfile
    useEffect(() => {
        if (user) {
            setHeight(user.height?.toString() || '');
            setWeight(user.weight?.toString() || '');
            setGender(user.gender || '');
            setName(user.name || '');
        }
    }, [user?.height, user?.weight, user?.gender, user?.name]);

    // Track changes
    useEffect(() => {
        const changed =
            name !== (user?.name || '') ||
            height !== (user?.height?.toString() || '') ||
            weight !== (user?.weight?.toString() || '') ||
            gender !== (user?.gender || '');
        setHasChanges(changed);
    }, [name, height, weight, gender, user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                name: name.trim() || undefined,
                height: height ? parseFloat(height) : undefined,
                weight: weight ? parseFloat(weight) : undefined,
                gender: gender || undefined,
            });
            setHasChanges(false);
            Alert.alert('✅ Profile Updated', 'Your profile has been saved. AI Coach will now use your body metrics for personalized advice!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // BMI calculation
    const bmi = height && weight
        ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)
        : null;

    const getBmiCategory = (bmiVal: number) => {
        if (bmiVal < 18.5) return { label: 'Underweight', color: '#3b82f6' };
        if (bmiVal < 25) return { label: 'Normal', color: '#22c55e' };
        if (bmiVal < 30) return { label: 'Overweight', color: '#f59e0b' };
        return { label: 'Obese', color: '#ef4444' };
    };

    const bmiInfo = bmi ? getBmiCategory(parseFloat(bmi)) : null;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ScrollView className="flex-1 p-4">
                {/* Header */}
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</Text>

                {/* User Avatar & Email Card */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm items-center">
                    <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-3">
                        <UserIcon size={36} color="#2563eb" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user?.email}</Text>
                </View>

                {/* Body Metrics Card */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">📏 Body Metrics</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                        These help the AI Coach give you personalized workout and nutrition advice.
                    </Text>

                    {/* Name */}
                    <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">Name</Text>
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl px-4 py-3 mb-4">
                        <UserIcon size={18} color="#6b7280" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900 dark:text-white"
                            placeholder="Your name"
                            placeholderTextColor="#9ca3af"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Height */}
                    <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">Height (cm)</Text>
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl px-4 py-3 mb-4">
                        <Ruler size={18} color="#6b7280" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900 dark:text-white"
                            placeholder="e.g. 175"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={setHeight}
                        />
                        <Text className="text-gray-400 text-sm">cm</Text>
                    </View>

                    {/* Weight */}
                    <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">Weight (kg)</Text>
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl px-4 py-3 mb-4">
                        <Weight size={18} color="#6b7280" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900 dark:text-white"
                            placeholder="e.g. 70"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />
                        <Text className="text-gray-400 text-sm">kg</Text>
                    </View>

                    {/* Gender */}
                    <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1.5">Gender</Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl px-4 py-3.5 mb-2"
                        onPress={() => setShowGenderPicker(!showGenderPicker)}
                    >
                        <Text className={`flex-1 ${gender ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {gender || 'Select gender'}
                        </Text>
                        <ChevronDown size={18} color="#6b7280" />
                    </TouchableOpacity>

                    {showGenderPicker && (
                        <View className="bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-4 overflow-hidden">
                            {GENDER_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    className={`px-4 py-3 border-b border-gray-200 dark:border-gray-600 ${gender.toLowerCase() === opt.toLowerCase() ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    onPress={() => { setGender(opt.toLowerCase()); setShowGenderPicker(false); }}
                                >
                                    <Text className={`${gender.toLowerCase() === opt.toLowerCase() ? 'text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* BMI Card */}
                {bmi && bmiInfo && (
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">📊 Your Stats</Text>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <Text className="text-3xl font-bold" style={{ color: bmiInfo.color }}>{bmi}</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">BMI</Text>
                                <Text className="text-xs font-medium mt-0.5" style={{ color: bmiInfo.color }}>{bmiInfo.label}</Text>
                            </View>
                            {weight && (
                                <View className="items-center flex-1">
                                    <Text className="text-3xl font-bold text-blue-600">{Math.round(parseFloat(weight) * 2)}</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Protein (g/day)</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">≈2g/kg</Text>
                                </View>
                            )}
                            {height && weight && (
                                <View className="items-center flex-1">
                                    <Text className="text-3xl font-bold text-green-600">
                                        {Math.round((10 * parseFloat(weight) + 6.25 * parseFloat(height) - 125 + (gender === 'male' ? 5 : -161)) * 1.55)}
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Cal/day</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">Maintenance</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                    className={`rounded-xl py-4 items-center mb-4 flex-row justify-center ${hasChanges ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    onPress={handleSave}
                    disabled={!hasChanges || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Save size={18} color="white" />
                            <Text className="text-white font-semibold ml-2">
                                {hasChanges ? 'Save Profile' : 'No Changes'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    className="bg-red-500/10 border border-red-500/30 rounded-xl py-4 items-center mb-8 flex-row justify-center"
                    onPress={() => {
                        Alert.alert('Log Out', 'Are you sure you want to log out?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Log Out', style: 'destructive', onPress: signOut },
                        ]);
                    }}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-red-500 font-semibold ml-2">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
