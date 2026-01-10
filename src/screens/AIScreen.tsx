import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon } from 'lucide-react-native';
import OpenAI from 'openai';

// Initialize OpenAI (will use key from env or mock if missing)
const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'mock_key',
    dangerouslyAllowBrowser: true // required for React Native
});

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AIScreen() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your AI Workout Assistant. How can I help you reach your fitness goals today?'
        }
    ]);

    const scrollViewRef = useRef<ScrollView>(null);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Preemptive check for valid API Key
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
        const isMockKey = !apiKey || apiKey === 'mock_key' || apiKey === 'placeholder' || !apiKey.startsWith('sk-');

        if (isMockKey) {
            // Simulate network delay for realism
            setTimeout(() => {
                const mockResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "This is a **Demo Response** because a valid OpenAI API Key was not found.\n\nTo enable the real AI Coach:\n1. Get an API Key from platform.openai.com\n2. Add it to your `.env` file as `EXPO_PUBLIC_OPENAI_API_KEY`\n3. Restart the app."
                };
                setMessages(prev => [...prev, mockResponse]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            // Real API Call
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are a helpful fitness assistant.' },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: userMessage.content }
                ],
                model: 'gpt-3.5-turbo',
            });

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: completion.choices[0].message.content || "I couldn't generate a response."
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error("AI Error:", error);
            // Fallback to demo response if API key fails/is invalid
            if (error?.status === 401 || error?.status === 403 || error?.message?.includes('API key')) {
                const demoMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "It looks like the AI service is not fully configured (Invalid API Key). But don't worry! I can still help you track workouts manually. To enable AI features, please add a valid OpenAI API key to your .env file."
                };
                setMessages(prev => [...prev, demoMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error connecting to the AI service. Please check your internet connection."
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">AI Coach</Text>
            </View>

            <ScrollView
                className="flex-1 p-4"
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        className={`flex-row mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-2">
                                <Bot size={16} color="#2563eb" />
                            </View>
                        )}

                        <View
                            className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user'
                                ? 'bg-blue-600 rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 rounded-tl-none shadow-sm'
                                }`}
                        >
                            <Text className={msg.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-gray-100'}>
                                {msg.content}
                            </Text>
                        </View>

                        {msg.role === 'user' && (
                            <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center ml-2">
                                <UserIcon size={16} color="#4b5563" className="dark:text-gray-300" />
                            </View>
                        )}
                    </View>
                ))}
                {isLoading && (
                    <View className="flex-row mb-4 justify-start">
                        <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-2">
                            <Bot size={16} color="#2563eb" />
                        </View>
                        <View className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm items-center justify-center">
                            <ActivityIndicator size="small" color="#2563eb" />
                        </View>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row items-center">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-full px-4 py-3 mr-3 text-gray-900 dark:text-white max-h-24"
                        placeholder="Ask me anything about workouts..."
                        placeholderTextColor="#9ca3af"
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity
                        className={`w-12 h-12 rounded-full items-center justify-center ${input.trim() ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                        onPress={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
