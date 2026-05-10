import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, accent, shadows } from '../context/ThemeContext';
import { MessageSquare, Trash2, Plus, Sparkles } from 'lucide-react-native';

interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
    messages: any[];
}

interface Props {
    conversations: Conversation[];
    activeConvoId: string | null;
    isLoading: boolean;
    isWideScreen: boolean;
    onSelectConvo: (c: Conversation) => void;
    onNewChat: () => void;
    onClearAll: () => void;
}

export default function ChatHistorySidebar({ conversations, activeConvoId, isLoading, isWideScreen, onSelectConvo, onNewChat, onClearAll }: Props) {
    const { isDark, colors } = useTheme();

    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.background,
            width: isWideScreen ? 320 : '100%',
            borderRightWidth: isWideScreen ? 1 : 0,
            borderRightColor: colors.borderLight,
        }}>
            {/* Header */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }} className="px-5 pt-4 pb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View style={{ backgroundColor: accent.blueBg }} className="w-9 h-9 rounded-xl items-center justify-center mr-2.5">
                        <Sparkles size={16} color={accent.blue} />
                    </View>
                    <Text style={{ color: colors.text }} className="text-lg font-bold">AI Coach</Text>
                </View>
                {conversations.length > 0 && (
                    <TouchableOpacity onPress={onClearAll} className="p-2">
                        <Trash2 size={18} color={accent.red} />
                    </TouchableOpacity>
                )}
            </View>

            {/* New chat button */}
            <View className="px-5 pt-4 pb-2">
                <TouchableOpacity
                    style={{ backgroundColor: accent.blue, ...shadows.glow(accent.blue) }}
                    className="rounded-xl py-3 flex-row items-center justify-center"
                    onPress={onNewChat}
                    activeOpacity={0.85}
                >
                    <Plus size={16} color="#fff" />
                    <Text className="text-white font-bold text-sm ml-1.5">New Chat</Text>
                </TouchableOpacity>
            </View>

            {/* Conversations list */}
            <View className="px-5 mt-4">
                <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700' }} className="uppercase tracking-wider mb-2">
                    Recent Chats
                </Text>
            </View>

            {isLoading ? (
                <View className="items-center mt-8">
                    <ActivityIndicator color={accent.blue} />
                </View>
            ) : conversations.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8" style={{ paddingBottom: 80 }}>
                    <View style={{ backgroundColor: isDark ? '#1a2332' : '#f3f4f6' }} className="w-14 h-14 rounded-2xl items-center justify-center mb-4">
                        <MessageSquare size={24} color={colors.textTertiary} />
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-sm text-center">
                        No conversations yet.{'\n'}Start chatting with your AI Coach!
                    </Text>
                </View>
            ) : (
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                    {conversations.map(c => (
                        <TouchableOpacity
                            key={c.id}
                            onPress={() => onSelectConvo(c)}
                            className="px-5 py-3 flex-row items-start"
                            style={{
                                backgroundColor: activeConvoId === c.id ? (isDark ? '#1a2332' : '#f0f9ff') : 'transparent',
                                borderLeftWidth: 3,
                                borderLeftColor: activeConvoId === c.id ? accent.blue : 'transparent',
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={{ backgroundColor: accent.blueBg }} className="w-8 h-8 rounded-lg items-center justify-center mr-3 mt-0.5">
                                <MessageSquare size={14} color={accent.blue} />
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: colors.text }} className="text-sm font-semibold" numberOfLines={1}>{c.title}</Text>
                                {c.preview ? (
                                    <Text style={{ color: colors.textTertiary, fontSize: 11 }} className="mt-0.5" numberOfLines={1}>{c.preview}</Text>
                                ) : null}
                                <Text style={{ color: colors.textTertiary, fontSize: 10 }} className="mt-1">{c.date}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
