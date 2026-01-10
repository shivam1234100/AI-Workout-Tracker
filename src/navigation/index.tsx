import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Home, Dumbbell, PlayCircle, History, BrainCircuit, User } from 'lucide-react-native';


import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AIScreen from '../screens/AIScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                },
                tabBarActiveTintColor: '#2563eb', // blue-600
                tabBarInactiveTintColor: '#9ca3af', // gray-400
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    tabBarLabel: 'Home'
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
                    tabBarLabel: 'Library'
                }}
            />
            <Tab.Screen
                name="Workout"
                component={WorkoutScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <PlayCircle color={color} size={size} />,
                    tabBarLabel: 'Start'
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
                    tabBarLabel: 'History'
                }}
            />
            <Tab.Screen
                name="AI"
                component={AIScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <BrainCircuit color={color} size={size} />,
                    tabBarLabel: 'AI Coach'
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
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
        </Stack.Navigator>
    );
}

import { useAuthStore } from '../store/authStore';

export default function RootNavigator() {
    const { isAuthenticated } = useAuthStore();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
                    <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
                </>
            ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
            )}
        </Stack.Navigator>
    );
}
