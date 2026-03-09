import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Bot, Trash2, Sparkles, PenSquare, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

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
    const { isDark, colors } = useTheme();

    return (
        <View
            style={{
                backgroundColor: isWideScreen ? (isDark ? '#111827' : '#f3f4f6') : colors.background,
                borderRightWidth: isWideScreen ? 1 : 0,
                borderRightColor: colors.border,
            }}
            className={isWideScreen ? 'w-72' : 'flex-1'}
        >
            {/* Header */}
            <View style={{ backgroundColor: colors.card, borderBottomColor: colors.border }} className="p-4 flex-row items-center justify-between border-b">
                <View className="flex-row items-center">
                    <Sparkles size={18} color="#2563eb" />
                    <Text style={{ color: colors.text }} className="text-lg font-bold ml-2">AI Coach</Text>
                </View>
                {conversations.length > 0 && (
                    <TouchableOpacity onPress={onClearAll} className="p-2">
                        <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            {/* New Chat Button */}
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

            {/* Conversation List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View className="items-center py-16">
                        <ActivityIndicator size="small" color="#2563eb" />
                        <Text style={{ color: colors.textTertiary }} className="text-xs mt-2">Loading chats...</Text>
                    </View>
                ) : conversations.length === 0 ? (
                    <View className="items-center py-16 px-6">
                        <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe' }} className="w-14 h-14 rounded-full items-center justify-center mb-3">
                            <Bot size={28} color="#2563eb" />
                        </View>
                        <Text style={{ color: colors.textSecondary }} className="text-center text-sm">No conversations yet</Text>
                        <Text style={{ color: colors.textTertiary }} className="text-center text-xs mt-1">Tap "New Chat" to get started</Text>
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
                                            <Text style={{ color: colors.textTertiary }} className="text-xs font-bold uppercase tracking-wider px-4 pt-4 pb-1.5">
                                                {convo.date}
                                            </Text>
                                        )}
                                        <TouchableOpacity
                                            style={{ backgroundColor: isActive ? (isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe') : 'transparent' }}
                                            className="mx-2 px-3 py-3 rounded-lg mb-0.5 flex-row items-center"
                                            onPress={() => onSelectConvo(convo)}
                                            activeOpacity={0.7}
                                        >
                                            <MessageSquare
                                                size={14}
                                                color={isActive ? '#2563eb' : colors.textTertiary}
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text
                                                style={{ color: isActive ? '#2563eb' : colors.text }}
                                                className={`flex-1 text-sm ${isActive ? 'font-bold' : ''}`}
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
