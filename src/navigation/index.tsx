import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Platform } from 'react-native';

import { Home, Dumbbell, PlayCircle, History, BrainCircuit, User, BookOpen } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme, accent } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AIScreen from '../screens/AIScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import WeeklySummaryScreen from '../screens/WeeklySummaryScreen';
import ProgramsScreen from '../screens/ProgramsScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import CreateProgramScreen from '../screens/CreateProgramScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 4,
        }}>
            {focused && (
                <View style={{
                    position: 'absolute',
                    top: -4,
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: accent.green,
                }} />
            )}
            {children}
        </View>
    );
}

function MainTabs() {
    const { isDark, colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 0.5,
                    borderTopColor: colors.tabBarBorder,
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    paddingTop: 8,
                    ...(isDark ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                    } : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                    }),
                    elevation: 12,
                },
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><Home color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'Home'
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><Dumbbell color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'Library'
                }}
            />
            <Tab.Screen
                name="Workout"
                component={WorkoutScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><PlayCircle color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'Start'
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><History color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'History'
                }}
            />
            <Tab.Screen
                name="Programs"
                component={ProgramsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><BookOpen color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'Programs'
                }}
            />
            <Tab.Screen
                name="AI"
                component={AIScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><BrainCircuit color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'AI Coach'
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon focused={focused}><User color={color} size={22} /></TabIcon>
                    ),
                    tabBarLabel: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

export default function RootNavigator() {
    const { isAuthenticated } = useAuthStore();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
                    <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
                    <Stack.Screen name="WeeklySummary" component={WeeklySummaryScreen} />
                    <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
                    <Stack.Screen name="CreateProgram" component={CreateProgramScreen} />
                </>
            ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
            )}
        </Stack.Navigator>
    );
}
