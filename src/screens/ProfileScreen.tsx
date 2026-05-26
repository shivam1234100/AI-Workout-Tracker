import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Ruler, Weight, Save, LogOut, ChevronDown, Sun, Moon, Bell, BellOff, Zap, Dumbbell, Leaf, FlameKindling, Plus, X, ShieldAlert, Bone, HeartPulse, AlertTriangle, FileText } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../context/ThemeContext';
import { useNotificationStore } from '../store/notificationStore';
import { useMedicalStore, MedicalCondition } from '../store/medicalStore';
import {
  requestNotificationPermissions,
  scheduleAllNotifications,
  sendTestNotification,
} from '../lib/notifications';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function ProfileScreen({ navigation }: any) {
    const { logout: signOut, user, updateProfile, fetchProfile } = useAuthStore();
    const { theme: themePreference, setTheme: setThemePreference } = useThemeStore();
    const { isDark, colors } = useTheme();
    const { prefs, permissionGranted, setPrefs, setPermissionGranted } = useNotificationStore();

    const { conditions, additionalNotes, addCondition, removeCondition, setAdditionalNotes } = useMedicalStore();

    const [height, setHeight] = useState(user?.height?.toString() || '');
    const [weight, setWeight] = useState(user?.weight?.toString() || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Medical condition input state
    const [conditionInput, setConditionInput] = useState('');
    const [conditionType, setConditionType] = useState<MedicalCondition['type']>('injury');

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setHeight(user.height?.toString() || '');
            setWeight(user.weight?.toString() || '');
            setGender(user.gender || '');
            setName(user.name || '');
        }
    }, [user?.height, user?.weight, user?.gender, user?.name]);

    useEffect(() => {
        const changed =
            name !== (user?.name || '') ||
            height !== (user?.height?.toString() || '') ||
            weight !== (user?.weight?.toString() || '') ||
            gender !== (user?.gender || '');
        setHasChanges(changed);
    }, [name, height, weight, gender, user]);

    const handleNotificationToggle = async (enabled: boolean) => {
        if (enabled && !permissionGranted) {
            const granted = await requestNotificationPermissions();
            setPermissionGranted(granted);
            if (!granted) {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to receive workout reminders and tips.',
                );
                return;
            }
        }
        const newPrefs = { ...prefs, enabled };
        setPrefs({ enabled });
        await scheduleAllNotifications(newPrefs);
    };

    const handlePrefToggle = async (key: keyof typeof prefs, value: boolean) => {
        const newPrefs = { ...prefs, [key]: value };
        setPrefs({ [key]: value });
        if (prefs.enabled && permissionGranted) {
            await scheduleAllNotifications(newPrefs);
        }
    };

    const handleReminderTimeChange = async (time: string) => {
        const newPrefs = { ...prefs, reminderTime: time };
        setPrefs({ reminderTime: time });
        if (prefs.enabled && permissionGranted) {
            await scheduleAllNotifications(newPrefs);
        }
    };

    const handleTestNotification = async () => {
        if (!permissionGranted) {
            Alert.alert('Permission Required', 'Enable notifications first to test them.');
            return;
        }
        await sendTestNotification();
        Alert.alert('Sent!', 'A test notification is on its way.');
    };

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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView className="flex-1 p-4">
                {/* Header */}
                <Text style={{ color: colors.text }} className="text-2xl font-bold mb-6">Profile</Text>

                {/* User Avatar & Email Card */}
                <View style={{ backgroundColor: colors.card }} className="rounded-2xl p-6 mb-4 shadow-sm items-center">
                    <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe' }} className="w-20 h-20 rounded-full items-center justify-center mb-3">
                        <UserIcon size={36} color="#2563eb" />
                    </View>
                    <Text style={{ color: colors.text }} className="text-lg font-bold">{user?.name || 'User'}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">{user?.email}</Text>
                </View>

                {/* Body Metrics Card */}
                <View style={{ backgroundColor: colors.card }} className="rounded-2xl p-5 mb-4 shadow-sm">
                    <Text style={{ color: colors.text }} className="text-lg font-bold mb-4">📏 Body Metrics</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs mb-4">
                        These help the AI Coach give you personalized workout and nutrition advice.
                    </Text>

                    {/* Name */}
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1.5">Name</Text>
                    <View style={{ backgroundColor: colors.inputBg }} className="flex-row items-center rounded-xl px-4 py-3 mb-4">
                        <UserIcon size={18} color={colors.textSecondary} />
                        <TextInput
                            style={{ color: colors.text }}
                            className="flex-1 ml-3"
                            placeholder="Your name"
                            placeholderTextColor="#9ca3af"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Height */}
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1.5">Height (cm)</Text>
                    <View style={{ backgroundColor: colors.inputBg }} className="flex-row items-center rounded-xl px-4 py-3 mb-4">
                        <Ruler size={18} color={colors.textSecondary} />
                        <TextInput
                            style={{ color: colors.text }}
                            className="flex-1 ml-3"
                            placeholder="e.g. 175"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={setHeight}
                        />
                        <Text style={{ color: colors.textTertiary }} className="text-sm">cm</Text>
                    </View>

                    {/* Weight */}
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1.5">Weight (kg)</Text>
                    <View style={{ backgroundColor: colors.inputBg }} className="flex-row items-center rounded-xl px-4 py-3 mb-4">
                        <Weight size={18} color={colors.textSecondary} />
                        <TextInput
                            style={{ color: colors.text }}
                            className="flex-1 ml-3"
                            placeholder="e.g. 70"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />
                        <Text style={{ color: colors.textTertiary }} className="text-sm">kg</Text>
                    </View>

                    {/* Gender */}
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-1.5">Gender</Text>
                    <TouchableOpacity
                        style={{ backgroundColor: colors.inputBg }}
                        className="flex-row items-center rounded-xl px-4 py-3.5 mb-2"
                        onPress={() => setShowGenderPicker(!showGenderPicker)}
                    >
                        <Text style={{ color: gender ? colors.text : colors.textTertiary }} className="flex-1">
                            {gender || 'Select gender'}
                        </Text>
                        <ChevronDown size={18} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {showGenderPicker && (
                        <View style={{ backgroundColor: colors.inputBg }} className="rounded-xl mb-4 overflow-hidden">
                            {GENDER_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={{ borderBottomColor: colors.border }}
                                    className={`px-4 py-3 border-b ${gender.toLowerCase() === opt.toLowerCase() ? 'bg-blue-50' : ''}`}
                                    onPress={() => { setGender(opt.toLowerCase()); setShowGenderPicker(false); }}
                                >
                                    <Text style={{ color: gender.toLowerCase() === opt.toLowerCase() ? '#2563eb' : colors.textSecondary }} className={gender.toLowerCase() === opt.toLowerCase() ? 'font-semibold' : ''}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* BMI Card */}
                {bmi && bmiInfo && (
                    <View style={{ backgroundColor: colors.card }} className="rounded-2xl p-5 mb-4 shadow-sm">
                        <Text style={{ color: colors.text }} className="text-lg font-bold mb-3">📊 Your Stats</Text>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <Text className="text-3xl font-bold" style={{ color: bmiInfo.color }}>{bmi}</Text>
                                <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">BMI</Text>
                                <Text className="text-xs font-medium mt-0.5" style={{ color: bmiInfo.color }}>{bmiInfo.label}</Text>
                            </View>
                            {weight && (
                                <View className="items-center flex-1">
                                    <Text className="text-3xl font-bold text-blue-600">{Math.round(parseFloat(weight) * 2)}</Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">Protein (g/day)</Text>
                                    <Text style={{ color: colors.textTertiary }} className="text-xs mt-0.5">≈2g/kg</Text>
                                </View>
                            )}
                            {height && weight && (
                                <View className="items-center flex-1">
                                    <Text className="text-3xl font-bold text-green-600">
                                        {Math.round((10 * parseFloat(weight) + 6.25 * parseFloat(height) - 125 + (gender === 'male' ? 5 : -161)) * 1.55)}
                                    </Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">Cal/day</Text>
                                    <Text style={{ color: colors.textTertiary }} className="text-xs mt-0.5">Maintenance</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Medical Conditions Card */}
                <View style={{ backgroundColor: colors.card }} className="rounded-2xl p-5 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-1">
                        <ShieldAlert size={20} color="#ef4444" />
                        <Text style={{ color: colors.text }} className="text-lg font-bold ml-2">Medical & Injuries</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-xs mb-4">
                        Add any injuries, health conditions, or allergies. The AI Coach will account for these when suggesting workouts and exercises.
                    </Text>

                    {/* Condition type selector */}
                    <View className="flex-row mb-3">
                        {([
                            { type: 'injury' as const, label: 'Injury', Icon: Bone, color: '#f59e0b' },
                            { type: 'condition' as const, label: 'Condition', Icon: HeartPulse, color: '#ef4444' },
                            { type: 'allergy' as const, label: 'Allergy', Icon: AlertTriangle, color: '#8b5cf6' },
                            { type: 'other' as const, label: 'Other', Icon: FileText, color: '#6b7280' },
                        ]).map(({ type, label, Icon, color }) => {
                            const isActive = conditionType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setConditionType(type)}
                                    activeOpacity={0.7}
                                    className="mr-2 px-3 py-1.5 rounded-lg flex-row items-center"
                                    style={{
                                        backgroundColor: isActive ? color + '20' : colors.inputBg,
                                        borderWidth: 1,
                                        borderColor: isActive ? color + '50' : 'transparent',
                                    }}
                                >
                                    <Icon size={12} color={isActive ? color : colors.textTertiary} />
                                    <Text style={{ color: isActive ? color : colors.textTertiary, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Input row */}
                    <View className="flex-row items-center mb-3">
                        <View style={{ backgroundColor: colors.inputBg, flex: 1, borderRadius: 12 }} className="flex-row items-center px-3 py-2.5 mr-2">
                            <TextInput
                                style={{ color: colors.text, flex: 1, fontSize: 13 }}
                                placeholder={
                                    conditionType === 'injury' ? 'e.g. Left knee ACL tear, Lower back pain...'
                                    : conditionType === 'condition' ? 'e.g. Asthma, Diabetes, High BP...'
                                    : conditionType === 'allergy' ? 'e.g. Lactose intolerant, Nut allergy...'
                                    : 'e.g. Pregnancy, Post-surgery recovery...'
                                }
                                placeholderTextColor={colors.textTertiary}
                                value={conditionInput}
                                onChangeText={setConditionInput}
                                onSubmitEditing={() => {
                                    if (conditionInput.trim()) {
                                        addCondition(conditionInput, conditionType);
                                        setConditionInput('');
                                    }
                                }}
                                returnKeyType="done"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (conditionInput.trim()) {
                                    addCondition(conditionInput, conditionType);
                                    setConditionInput('');
                                }
                            }}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: conditionInput.trim() ? '#2563eb' : (isDark ? '#374151' : '#e5e7eb'),
                                width: 40, height: 40, borderRadius: 12,
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Plus size={18} color={conditionInput.trim() ? 'white' : colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* Quick-add chips */}
                    {conditions.length === 0 && (
                        <View className="mb-3">
                            <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6 }}>Quick add:</Text>
                            <View className="flex-row flex-wrap">
                                {['Knee pain', 'Lower back injury', 'Shoulder impingement', 'Wrist pain', 'Asthma', 'High blood pressure'].map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        onPress={() => {
                                            const type = ['Asthma', 'High blood pressure'].includes(item) ? 'condition' : 'injury';
                                            addCondition(item, type as MedicalCondition['type']);
                                        }}
                                        activeOpacity={0.7}
                                        style={{ backgroundColor: colors.inputBg, borderRadius: 8, marginRight: 6, marginBottom: 6, paddingHorizontal: 10, paddingVertical: 5 }}
                                    >
                                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>+ {item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Listed conditions */}
                    {conditions.length > 0 && (
                        <View className="mb-3">
                            {conditions.map((c) => {
                                const typeConfig = {
                                    injury: { color: '#f59e0b', Icon: Bone, label: 'Injury' },
                                    condition: { color: '#ef4444', Icon: HeartPulse, label: 'Condition' },
                                    allergy: { color: '#8b5cf6', Icon: AlertTriangle, label: 'Allergy' },
                                    other: { color: '#6b7280', Icon: FileText, label: 'Other' },
                                }[c.type];
                                return (
                                    <View
                                        key={c.id}
                                        className="flex-row items-center py-2.5 px-3 rounded-xl mb-2"
                                        style={{ backgroundColor: typeConfig.color + '10', borderWidth: 1, borderColor: typeConfig.color + '25' }}
                                    >
                                        <View style={{ backgroundColor: typeConfig.color + '20', width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                            <typeConfig.Icon size={14} color={typeConfig.color} />
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{c.text}</Text>
                                            <Text style={{ color: typeConfig.color, fontSize: 10, fontWeight: '500' }}>{typeConfig.label}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert('Remove', `Remove "${c.text}"?`, [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Remove', style: 'destructive', onPress: () => removeCondition(c.id) },
                                                ]);
                                            }}
                                            activeOpacity={0.7}
                                            style={{ padding: 4 }}
                                        >
                                            <X size={16} color={colors.textTertiary} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Additional notes */}
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mb-1.5">Additional Notes (optional)</Text>
                    <TextInput
                        style={{
                            color: colors.text,
                            backgroundColor: colors.inputBg,
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 13,
                            minHeight: 60,
                            textAlignVertical: 'top',
                        }}
                        placeholder="Any extra details the AI should know (e.g. 'Doctor said avoid heavy squats for 3 months')"
                        placeholderTextColor={colors.textTertiary}
                        value={additionalNotes}
                        onChangeText={setAdditionalNotes}
                        multiline
                    />
                </View>

                {/* Theme Selector Card */}
                <View style={{ backgroundColor: colors.card }} className="rounded-2xl p-5 mb-4 shadow-sm">
                    <Text style={{ color: colors.text }} className="text-lg font-bold mb-4">🎨 Appearance</Text>
                    <View className="flex-row justify-between">
                        {[
                            { key: 'light' as const, label: 'Light', Icon: Sun },
                            { key: 'dark' as const, label: 'Dark', Icon: Moon },
                        ].map(({ key, label, Icon }) => {
                            const isActive = themePreference === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={{ backgroundColor: isActive ? '#2563eb' : colors.inputBg }}
                                    className="flex-1 items-center py-3 mx-1 rounded-xl"
                                    onPress={() => setThemePreference(key)}
                                    activeOpacity={0.7}
                                >
                                    <Icon size={20} color={isActive ? '#ffffff' : colors.textSecondary} />
                                    <Text
                                        style={{ color: isActive ? '#ffffff' : colors.textSecondary }}
                                        className="text-xs font-medium mt-1.5"
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Notifications Card */}
                <View style={{ backgroundColor: colors.card }} className="rounded-2xl p-5 mb-4 shadow-sm">
                    {/* Header row */}
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                            {prefs.enabled
                                ? <Bell size={20} color="#2563eb" />
                                : <BellOff size={20} color={colors.textSecondary} />
                            }
                            <Text style={{ color: colors.text }} className="text-lg font-bold ml-2">Notifications</Text>
                        </View>
                        <Switch
                            value={prefs.enabled}
                            onValueChange={handleNotificationToggle}
                            trackColor={{ false: isDark ? '#374151' : '#d1d5db', true: '#2563eb' }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-xs mb-4">
                        Daily motivation, workout reminders, health facts & diet tips.
                    </Text>

                    {prefs.enabled && (
                        <>
                            {/* Sub-toggles */}
                            {[
                                { key: 'motivation' as const, label: 'Motivation Boosts', sublabel: '8:00 AM & 5:30 PM', Icon: Zap, color: '#f59e0b' },
                                { key: 'workoutReminder' as const, label: 'Workout Reminder', sublabel: `Daily at ${prefs.reminderTime}`, Icon: Dumbbell, color: '#2563eb' },
                                { key: 'quirkyFacts' as const, label: 'Quirky Fitness Facts', sublabel: '12:15 PM', Icon: FlameKindling, color: '#ef4444' },
                                { key: 'dietTips' as const, label: 'Diet & Nutrition Tips', sublabel: '7:00 PM', Icon: Leaf, color: '#22c55e' },
                            ].map(({ key, label, sublabel, Icon, color }) => (
                                <View
                                    key={key}
                                    style={{ borderTopColor: colors.border }}
                                    className="flex-row items-center justify-between py-3 border-t"
                                >
                                    <View className="flex-row items-center flex-1 mr-3">
                                        <View style={{ backgroundColor: `${color}20` }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                                            <Icon size={18} color={color} />
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.text }} className="text-sm font-medium">{label}</Text>
                                            <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">{sublabel}</Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={prefs[key] as boolean}
                                        onValueChange={(v) => handlePrefToggle(key, v)}
                                        trackColor={{ false: isDark ? '#374151' : '#d1d5db', true: color }}
                                        thumbColor="#ffffff"
                                    />
                                </View>
                            ))}

                            {/* Reminder time picker */}
                            {prefs.workoutReminder && (
                                <View style={{ borderTopColor: colors.border }} className="pt-3 border-t mt-1">
                                    <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mb-2">Workout Reminder Time</Text>
                                    <View className="flex-row flex-wrap">
                                        {['06:00', '07:00', '08:00', '12:00', '17:00', '18:00', '19:00', '20:00'].map((t) => {
                                            const isActive = prefs.reminderTime === t;
                                            const [h] = t.split(':').map(Number);
                                            const label = h < 12 ? `${h === 0 ? 12 : h} AM` : `${h === 12 ? 12 : h - 12} PM`;
                                            return (
                                                <TouchableOpacity
                                                    key={t}
                                                    style={{
                                                        backgroundColor: isActive ? '#2563eb' : colors.inputBg,
                                                        marginRight: 8,
                                                        marginBottom: 8,
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg"
                                                    onPress={() => handleReminderTimeChange(t)}
                                                >
                                                    <Text style={{ color: isActive ? '#ffffff' : colors.textSecondary }} className="text-xs font-medium">
                                                        {label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            {/* Test notification button */}
                            <TouchableOpacity
                                style={{ borderTopColor: colors.border, marginTop: 4 }}
                                className="flex-row items-center justify-center py-3 border-t"
                                onPress={handleTestNotification}
                                activeOpacity={0.7}
                            >
                                <Bell size={15} color="#2563eb" />
                                <Text className="text-blue-600 text-sm font-medium ml-2">Send Test Notification</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={{ backgroundColor: hasChanges ? '#2563eb' : (isDark ? '#374151' : '#d1d5db') }}
                    className="rounded-xl py-4 items-center mb-4 flex-row justify-center"
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
