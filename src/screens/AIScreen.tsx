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

        try {
            // Mock response if key is placeholder
            if (process.env.EXPO_PUBLIC_OPENAI_API_KEY === 'placeholder' || !process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
                const mockResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "I'm currently in demo mode because the OpenAI API key hasn't been set yet. Once configured, I can generate personalized workout plans, explain exercises, and provide motivation!"
                };
                setMessages(prev => [...prev, mockResponse]);
            } else {
                // Real API Call
                const completion = await openai.chat.completions.create({
                    messages: [{ role: 'system', content: 'You are a helpful fitness assistant.' }, ...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage.content }],
                    model: 'gpt-3.5-turbo',
                });

                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: completion.choices[0].message.content || "I couldn't generate a response."
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error connecting to the AI service. Please check your internet connection or API key."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-4 bg-white border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900 text-center">AI Coach</Text>
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
                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                <Bot size={16} color="#2563eb" />
                            </View>
                        )}

                        <View
                            className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-blue-600 rounded-tr-none'
                                    : 'bg-white rounded-tl-none shadow-sm'
                                }`}
                        >
                            <Text className={msg.role === 'user' ? 'text-white' : 'text-gray-900'}>
                                {msg.content}
                            </Text>
                        </View>

                        {msg.role === 'user' && (
                            <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center ml-2">
                                <UserIcon size={16} color="#4b5563" />
                            </View>
                        )}
                    </View>
                ))}
                {isLoading && (
                    <View className="flex-row mb-4 justify-start">
                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                            <Bot size={16} color="#2563eb" />
                        </View>
                        <View className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm items-center justify-center">
                            <ActivityIndicator size="small" color="#2563eb" />
                        </View>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View className="p-4 bg-white border-t border-gray-200 flex-row items-center">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-gray-900 max-h-24"
                        placeholder="Ask me anything about workouts..."
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity
                        className={`w-12 h-12 rounded-full items-center justify-center ${input.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
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
