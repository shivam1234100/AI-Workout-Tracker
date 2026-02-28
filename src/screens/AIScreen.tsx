import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon, ArrowLeft } from 'lucide-react-native';
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import ChatHistorySidebar from '../components/ChatHistorySidebar';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
}

interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
    messages: Message[];
}

// ─── Offline fallback ───
function generateOfflineResponse(query: string, workoutHistory: any[]): string {
    const lq = query.toLowerCase();
    let ctx = '';
    if (workoutHistory.length > 0) {
        const last = workoutHistory[0];
        const names = last.exercises?.map((e: any) => e.name).join(', ') || 'exercises';
        const days = Math.floor((Date.now() - new Date(last.endTime || last.date).getTime()) / 86400000);
        ctx = ` Your last workout was ${days}d ago (${names}).`;
    }
    if (lq.includes('chest') || lq.includes('bench')) return `Bench Press, Incline DB Press, Flyes — 3-4×8-12.${ctx}`;
    if (lq.includes('back') || lq.includes('pull')) return `Pull-ups, Rows, Lat Pulldowns. Squeeze shoulder blades!${ctx}`;
    if (lq.includes('leg') || lq.includes('squat')) return `Squats, Lunges, RDLs. Drive through heels.${ctx}`;
    if (lq.includes('shoulder')) return `OHP for mass, Lateral Raises for width, Face Pulls for rear.${ctx}`;
    if (lq.includes('arm') || lq.includes('bicep')) return `Superset Curls with Tricep Extensions.${ctx}`;
    if (lq.includes('today') || lq.includes('what should')) return `Try adding 2.5kg or 1-2 extra reps to your main lifts.${ctx}`;
    return `Focus on progressive overload, consistency, and form!${ctx}`;
}

// ─── Group messages into conversations (30-min gap = new convo) ───
function groupIntoConversations(messages: Message[]): Conversation[] {
    if (messages.length === 0) return [];
    const convos: Conversation[] = [];
    let cur: Message[] = [messages[0]];

    for (let i = 1; i < messages.length; i++) {
        const prevT = messages[i - 1].createdAt ? new Date(messages[i - 1].createdAt!).getTime() : 0;
        const curT = messages[i].createdAt ? new Date(messages[i].createdAt!).getTime() : 0;
        if (curT - prevT > 30 * 60 * 1000) {
            convos.push(buildConvo(cur));
            cur = [messages[i]];
        } else {
            cur.push(messages[i]);
        }
    }
    if (cur.length > 0) convos.push(buildConvo(cur));
    return convos.reverse();
}

function buildConvo(msgs: Message[]): Conversation {
    const firstUser = msgs.find(m => m.role === 'user');
    const title = firstUser
        ? firstUser.content.length > 40 ? firstUser.content.substring(0, 40) + '...' : firstUser.content
        : 'New conversation';
    const last = msgs[msgs.length - 1];
    const preview = last.role === 'assistant'
        ? (last.content.length > 60 ? last.content.substring(0, 60) + '...' : last.content) : '';
    const date = msgs[0].createdAt ? formatRelDate(new Date(msgs[0].createdAt)) : 'Today';
    return { id: msgs[0].id, title, preview, date, messages: msgs };
}

function formatRelDate(d: Date): string {
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function AIScreen() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [activeMessages, setActiveMessages] = useState<Message[]>([]);
    const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
    const [activeConvoTitle, setActiveConvoTitle] = useState('New Chat');
    const [showSidebar, setShowSidebar] = useState(true); // mobile: toggle list/chat

    const scrollRef = useRef<ScrollView>(null);
    const { token } = useAuthStore();
    const { history: workoutHistory } = useWorkoutStore();

    // Responsive: sidebar on wide screens (web), toggle on mobile
    const { width } = Dimensions.get('window');
    const isWideScreen = Platform.OS === 'web' && width >= 768;

    useEffect(() => { loadHistory(); }, []);

    // ─── Load history ───
    const loadHistory = async () => {
        setIsLoadingHistory(true);
        if (!token) { setIsLoadingHistory(false); return; }

        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 5000);
        try {
            const res = await fetch(`${API_URL}/ai/history`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: ctrl.signal,
            });
            clearTimeout(tid);
            if (res.ok) {
                const data = await res.json();
                setAllMessages(data.map((m: any) => ({
                    id: m.id, role: m.role, content: m.content, createdAt: m.createdAt,
                })));
            }
        } catch { clearTimeout(tid); }
        finally { setIsLoadingHistory(false); }
    };

    const conversations = groupIntoConversations(allMessages);

    // ─── Open a conversation ───
    const openConvo = (convo: Conversation) => {
        setActiveMessages(convo.messages);
        setActiveConvoId(convo.id);
        setActiveConvoTitle(convo.title);
        if (!isWideScreen) setShowSidebar(false);
    };

    // ─── New chat ───
    const newChat = () => {
        const welcome: Message = {
            id: 'welcome', role: 'assistant',
            content: '👋 Hey! I\'m your AI Coach. Ask me anything about training, nutrition, or your progress!',
            createdAt: new Date().toISOString(),
        };
        setActiveMessages([welcome]);
        setActiveConvoId(null);
        setActiveConvoTitle('New Chat');
        if (!isWideScreen) setShowSidebar(false);
    };

    // ─── Send message ───
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        // If on list view, start new chat first
        if (showSidebar && !isWideScreen) newChat();
        if (activeMessages.length === 0) newChat();

        const userMsg: Message = {
            id: Date.now().toString(), role: 'user',
            content: input.trim(), createdAt: new Date().toISOString(),
        };

        if (!activeMessages.some(m => m.role === 'user')) {
            setActiveConvoTitle(userMsg.content.length > 40 ? userMsg.content.substring(0, 40) + '...' : userMsg.content);
        }

        setActiveMessages(p => [...p, userMsg]);
        setAllMessages(p => [...p, userMsg]);
        setInput('');
        setIsLoading(true);
        if (!isWideScreen) setShowSidebar(false);

        try {
            const ctrl = new AbortController();
            const tid = setTimeout(() => ctrl.abort(), 15000);
            const res = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: userMsg.content }),
                signal: ctrl.signal,
            });
            clearTimeout(tid);
            if (res.ok) {
                const data = await res.json();
                const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, createdAt: new Date().toISOString() };
                setActiveMessages(p => [...p, aiMsg]);
                setAllMessages(p => [...p, aiMsg]);
            } else throw new Error();
        } catch {
            setTimeout(() => {
                const fb: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: generateOfflineResponse(userMsg.content, workoutHistory), createdAt: new Date().toISOString() };
                setActiveMessages(p => [...p, fb]);
                setAllMessages(p => [...p, fb]);
            }, 800);
        } finally { setIsLoading(false); }
    };

    // ─── Clear history ───
    const clearAll = () => {
        Alert.alert('Clear All History', 'Delete all conversations?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear', style: 'destructive', onPress: async () => {
                    try { await fetch(`${API_URL}/ai/history`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); } catch { }
                    setAllMessages([]);
                    setActiveMessages([]);
                    setActiveConvoId(null);
                    setShowSidebar(true);
                }
            }
        ]);
    };

    // ═══════════════════════════════════════
    // SIDEBAR (separate component)
    // ═══════════════════════════════════════
    const renderSidebar = () => (
        <ChatHistorySidebar
            conversations={conversations}
            activeConvoId={activeConvoId}
            isLoading={isLoadingHistory}
            isWideScreen={isWideScreen}
            onSelectConvo={openConvo}
            onNewChat={newChat}
            onClearAll={clearAll}
        />
    );

    // ═══════════════════════════════════════
    // CHAT PANEL (right / main area)
    // ═══════════════════════════════════════
    const renderChat = () => (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Chat Header */}
            <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-row items-center">
                {!isWideScreen && (
                    <TouchableOpacity onPress={() => setShowSidebar(true)} className="mr-3 p-1">
                        <ArrowLeft size={22} color="#4b5563" />
                    </TouchableOpacity>
                )}
                <Text className="text-gray-900 dark:text-white font-bold text-base flex-1" numberOfLines={1}>
                    {activeConvoTitle}
                </Text>
            </View>

            {/* Messages or Empty state */}
            {activeMessages.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
                        <Bot size={32} color="#2563eb" />
                    </View>
                    <Text className="text-gray-900 dark:text-white text-xl font-bold mb-2">What can I help with?</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                        Ask about workouts, nutrition, or your progress
                    </Text>
                    {/* Quick prompts */}
                    {['What should I train today?', 'How do I improve my bench press?', 'Give me a push/pull/legs split'].map((p, i) => (
                        <TouchableOpacity
                            key={i}
                            className="w-full bg-white dark:bg-gray-800 rounded-xl p-3.5 mb-2 border border-gray-200 dark:border-gray-700"
                            onPress={() => { setInput(p); }}
                            activeOpacity={0.7}
                        >
                            <Text className="text-gray-700 dark:text-gray-300 text-sm">{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <ScrollView
                    className="flex-1 p-4"
                    ref={scrollRef}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                >
                    {activeMessages.map((msg) => (
                        <View key={msg.id} className={`flex-row mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-2">
                                    <Bot size={16} color="#2563eb" />
                                </View>
                            )}
                            <View className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-none' : 'bg-white dark:bg-gray-800 rounded-tl-none shadow-sm'}`}>
                                <Text className={msg.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-gray-100'}>
                                    {msg.content}
                                </Text>
                                {msg.createdAt && msg.id !== 'welcome' && (
                                    <Text className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                )}
                            </View>
                            {msg.role === 'user' && (
                                <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center ml-2">
                                    <UserIcon size={16} color="#4b5563" />
                                </View>
                            )}
                        </View>
                    ))}
                    {isLoading && (
                        <View className="flex-row mb-4 justify-start">
                            <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-2">
                                <Bot size={16} color="#2563eb" />
                            </View>
                            <View className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                <ActivityIndicator size="small" color="#2563eb" />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row items-center">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-full px-4 py-3 mr-3 text-gray-900 dark:text-white max-h-24"
                        placeholder="Message AI Coach..."
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
        </View>
    );

    // ═══════════════════════════════════════
    // MAIN LAYOUT
    // ═══════════════════════════════════════
    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            {isWideScreen ? (
                /* ── Desktop/Web: Side-by-side layout ── */
                <View className="flex-1 flex-row">
                    {renderSidebar()}
                    {renderChat()}
                </View>
            ) : (
                /* ── Mobile: Toggle between sidebar and chat ── */
                showSidebar ? renderSidebar() : renderChat()
            )}
        </SafeAreaView>
    );
}
