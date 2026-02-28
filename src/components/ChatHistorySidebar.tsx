import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Bot, Trash2, Sparkles, PenSquare, MessageSquare } from 'lucide-react-native';

interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
    messages: any[];
}

interface ChatHistorySidebarProps {
    conversations: Conversation[];
    activeConvoId: string | null;
    isLoading: boolean;
    isWideScreen: boolean;
    onSelectConvo: (convo: Conversation) => void;
    onNewChat: () => void;
    onClearAll: () => void;
}

export default function ChatHistorySidebar({
    conversations,
    activeConvoId,
    isLoading,
    isWideScreen,
    onSelectConvo,
    onNewChat,
    onClearAll,
}: ChatHistorySidebarProps) {

    return (
        <View
            className={
                isWideScreen
                    ? 'w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900'
                    : 'flex-1 bg-gray-50 dark:bg-gray-900'
            }
        >
            {/* ─── Header ─── */}
            <View className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <View className="flex-row items-center">
                    <Sparkles size={18} color="#2563eb" />
                    <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">AI Coach</Text>
                </View>
                {conversations.length > 0 && (
                    <TouchableOpacity onPress={onClearAll} className="p-2">
                        <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            {/* ─── New Chat Button (always on top) ─── */}
            <View className="px-3 pt-3 pb-1">
                <TouchableOpacity
                    className="bg-blue-600 rounded-xl p-3.5 flex-row items-center justify-center shadow-sm"
                    onPress={onNewChat}
                    activeOpacity={0.8}
                >
                    <PenSquare size={16} color="white" />
                    <Text className="text-white font-bold ml-2 text-sm">New Chat</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Conversation List ─── */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View className="items-center py-16">
                        <ActivityIndicator size="small" color="#2563eb" />
                        <Text className="text-gray-400 text-xs mt-2">Loading chats...</Text>
                    </View>
                ) : conversations.length === 0 ? (
                    <View className="items-center py-16 px-6">
                        <View className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-3">
                            <Bot size={28} color="#2563eb" />
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
                            No conversations yet
                        </Text>
                        <Text className="text-gray-400 dark:text-gray-500 text-center text-xs mt-1">
                            Tap "New Chat" to get started
                        </Text>
                    </View>
                ) : (
                    <View className="py-1">
                        {(() => {
                            let lastDate = '';
                            return conversations.map((convo) => {
                                const showDate = convo.date !== lastDate;
                                lastDate = convo.date;
                                const isActive = convo.id === activeConvoId;

                                return (
                                    <View key={convo.id}>
                                        {showDate && (
                                            <Text className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider px-4 pt-4 pb-1.5">
                                                {convo.date}
                                            </Text>
                                        )}
                                        <TouchableOpacity
                                            className={`mx-2 px-3 py-3 rounded-lg mb-0.5 flex-row items-center ${isActive ? 'bg-blue-100 dark:bg-blue-900/40' : ''}`}
                                            onPress={() => onSelectConvo(convo)}
                                            activeOpacity={0.7}
                                        >
                                            <MessageSquare
                                                size={14}
                                                color={isActive ? '#2563eb' : '#9ca3af'}
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text
                                                className={`flex-1 text-sm ${isActive ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-800 dark:text-gray-200'}`}
                                                numberOfLines={1}
                                            >
                                                {convo.title}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            });
                        })()}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
