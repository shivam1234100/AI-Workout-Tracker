import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon, ArrowLeft } from 'lucide-react-native';
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import { useTheme } from '../context/ThemeContext';

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
        ctx = `\n\n📊 Based on your data: Your last workout was ${days} day${days !== 1 ? 's' : ''} ago (${names}).`;
    }

    if (lq.includes('weekly') || lq.includes('week plan') || lq.includes('workout plan') || lq.includes('split') || lq.includes('routine') || lq.includes('program') || lq.includes('schedule'))
        return `Here's a weekly workout plan:\n\n📅 Day 1 — Chest & Triceps\n• Bench Press: 4×8-10\n• Incline DB Press: 3×10-12\n• Cable Flyes: 3×12-15\n• Tricep Dips: 3×10-12\n• Overhead Extension: 3×12\n\n📅 Day 2 — Back & Biceps\n• Deadlifts: 4×6-8\n• Barbell Rows: 4×8-10\n• Lat Pulldowns: 3×10-12\n• Barbell Curls: 3×10-12\n• Hammer Curls: 3×12\n\n📅 Day 3 — Rest / Active Recovery\n\n📅 Day 4 — Shoulders & Abs\n• OHP: 4×8-10\n• Lateral Raises: 4×12-15\n• Face Pulls: 3×15-20\n• Planks: 3×45-60 sec\n\n📅 Day 5 — Legs\n• Squats: 4×8-10\n• RDLs: 3×10-12\n• Leg Press: 3×12\n• Lunges: 3×12 each\n• Calf Raises: 4×15-20\n\n📅 Day 6 — Full Body / Weak Points\n📅 Day 7 — Rest\n\n💡 Increase weight by 2.5kg when you complete all sets at the top rep range.${ctx}`;

    if (lq.includes('chest') || lq.includes('bench') || lq.includes('pec'))
        return `Chest Day:\n\n1. Flat Bench Press — 4×6-8 (heavy compound, rest 2-3 min)\n2. Incline DB Press — 3×8-12 (upper chest, 30-45° incline)\n3. Cable Flyes — 3×12-15 (squeeze at peak for 1 sec)\n4. Dips (lean forward) — 3×10-12\n5. Push-ups — 2 sets to failure\n\n🔑 Tips: Retract shoulder blades, control the eccentric 2-3 sec, don't bounce off chest.${ctx}`;

    if (lq.includes('back') || lq.includes('pull') || lq.includes('row') || lq.includes('lat'))
        return `Back Day:\n\n1. Pull-ups — 4×6-10 (wider grip = more lats)\n2. Barbell Rows — 4×8-10 (pull to lower chest)\n3. Lat Pulldowns — 3×10-12\n4. Seated Cable Rows — 3×10-12\n5. Single-Arm DB Rows — 3×10-12 each\n6. Face Pulls — 3×15-20\n\n🔑 Tips: Pull with elbows, squeeze shoulder blades, use straps if grip limits you.${ctx}`;

    if (lq.includes('leg') || lq.includes('squat') || lq.includes('lunge') || lq.includes('quad') || lq.includes('hamstring') || lq.includes('glute'))
        return `Leg Day:\n\n1. Barbell Squats — 4×6-8 (go to parallel or below)\n2. Romanian Deadlifts — 3×10-12 (hamstrings & glutes)\n3. Leg Press — 3×10-12\n4. Walking Lunges — 3×12 each leg\n5. Leg Curls — 3×12-15\n6. Calf Raises — 4×15-20\n\n🔑 Tips: Drive through heels, brace core, don't skip hamstrings!${ctx}`;

    if (lq.includes('shoulder') || lq.includes('delt'))
        return `Shoulder Day:\n\n1. Overhead Press — 4×6-8 (primary mass builder)\n2. Lateral Raises — 4×12-15 (don't swing, control negative)\n3. Face Pulls — 3×15-20 (rear delts & posture)\n4. Rear Delt Flyes — 3×12-15\n5. Cable Lateral Raises — 3×12-15\n6. Shrugs — 3×12-15\n\n🔑 Tips: Go lighter on laterals with strict form. Hit rear delts 2-3× per week.${ctx}`;

    if (lq.includes('arm') || lq.includes('bicep') || lq.includes('tricep') || lq.includes('curl'))
        return `Arm Day:\n\nBiceps:\n1. Barbell Curls — 3×8-10\n2. Incline DB Curls — 3×10-12\n3. Hammer Curls — 3×10-12\n4. Concentration Curls — 2×12-15\n\nTriceps:\n1. Close-Grip Bench — 3×8-10\n2. Overhead Extension — 3×10-12\n3. Rope Pushdowns — 3×12-15\n4. Dips — 2× to failure\n\n🔑 Triceps = 2/3 of arm size. Superset bi's & tri's for max pump. Train arms 2×/week.${ctx}`;

    if (lq.includes('abs') || lq.includes('core') || lq.includes('six pack'))
        return `Core Workout (3-4×/week):\n\n1. Hanging Leg Raises — 3×12-15\n2. Cable Crunches — 3×15-20\n3. Plank — 3×45-60 sec\n4. Russian Twists — 3×20 total\n5. Dead Bugs — 3×12 each side\n6. Ab Wheel Rollouts — 3×8-12\n\n🔑 Abs are revealed through low body fat — diet matters more than crunches!${ctx}`;

    if (lq.includes('nutrition') || lq.includes('diet') || lq.includes('eat') || lq.includes('food') || lq.includes('meal') || lq.includes('protein') || lq.includes('calorie') || lq.includes('macro'))
        return `Nutrition Guide:\n\n• Protein: 1.6-2.2g/kg bodyweight (chicken, eggs, fish, whey)\n• Carbs: 3-5g/kg (oats, rice, potatoes)\n• Fats: 0.8-1.2g/kg (olive oil, avocado, nuts)\n\nSample Day:\n🌅 Breakfast: 3 eggs + oats + banana (~500 cal)\n🥗 Lunch: Chicken + rice + veggies (~600 cal)\n🍎 Snack: Greek yogurt + nuts (~300 cal)\n🍗 Dinner: Salmon + sweet potato + salad (~600 cal)\n\n💡 Muscle gain = 300-500 cal surplus. Fat loss = 300-500 cal deficit. Track for 2-3 weeks to learn portions.${ctx}`;

    if (lq.includes('weight loss') || lq.includes('lose weight') || lq.includes('burn fat') || lq.includes('cut') || lq.includes('lean'))
        return `Fat Loss Strategy:\n\n1. Calorie Deficit — Eat 300-500 below TDEE, aim for 0.5-1 kg/week\n2. High Protein — 2.0-2.4g/kg to preserve muscle\n3. Keep Lifting — Don't stop strength training during a cut\n4. Cardio — 2-3 sessions of 20-30 min walking/cycling, or 1-2 HIIT\n5. Sleep 7-9 hrs, walk 8k-10k steps/day, cut liquid calories\n\n⚠️ Don't cut too aggressively or do excessive cardio. Track weekly weight averages, not daily.${ctx}`;

    if (lq.includes('muscle') || lq.includes('bulk') || lq.includes('gain') || lq.includes('mass') || lq.includes('bigger'))
        return `Muscle Gain Blueprint:\n\n1. Calorie Surplus — 300-500 above maintenance, 0.25-0.5 kg/week gain\n2. Protein — 1.6-2.2g/kg across 4-5 meals\n3. Training — Each muscle 2×/week, 10-20 sets/muscle/week, 6-12 reps\n4. Progressive Overload — Add weight or reps every session\n5. Sleep 7-9 hrs, rest 1-2 days/week\n\n📈 Beginners gain ~1 kg muscle/month. Intermediates ~0.5 kg/month. Consistency is everything.${ctx}`;

    if (lq.includes('rest') || lq.includes('recover') || lq.includes('sleep') || lq.includes('sore') || lq.includes('tired'))
        return `Recovery Guide:\n\n😴 Sleep: 7-9 hrs/night, consistent schedule, cool dark room\n\n🚶 Active Recovery: Light walking, foam rolling, yoga on rest days\n\n🥗 Nutrition: Protein + carbs post-workout, anti-inflammatory foods, stay hydrated\n\n⚠️ Signs you need rest: Soreness >3 days, declining performance, poor sleep, no motivation\n\n💡 Wait 48-72 hrs before training the same muscle group again.${ctx}`;

    if (lq.includes('today') || lq.includes('what should') || lq.includes('suggest') || lq.includes('recommend'))
        return `Here's a great Full Body workout for today:\n\n1. Barbell Squats: 3×8\n2. Bench Press: 3×8\n3. Barbell Rows: 3×10\n4. Overhead Press: 3×8\n5. Romanian Deadlifts: 3×10\n6. Plank: 3×45 sec\n\n💡 Rest 90-120 sec between compounds. Try to beat last session's numbers!${ctx}`;

    if (lq.includes('hiit') || lq.includes('cardio') || lq.includes('run') || lq.includes('endurance'))
        return `HIIT Workout (20 min):\n\n4 rounds, 40 sec work / 20 sec rest:\n1. Burpees\n2. Mountain Climbers\n3. Jump Squats\n4. Push-ups\n5. High Knees\n6. Plank to Push-up\n\nAlternative: Sprint 30 sec → Walk 60 sec × 8-10 rounds\n\n🔑 Limit to 2-3×/week. Great for fat loss (EPOC effect). Don't combine with heavy leg days.${ctx}`;

    if (lq.includes('form') || lq.includes('technique') || lq.includes('how to'))
        return `Form Guide for Major Lifts:\n\n🏋️ Bench: Retract shoulder blades, grip wider than shoulders, lower to mid-chest, feet flat.\n\n🏋️ Squat: Bar on upper traps, feet shoulder-width, break at hips & knees together, go to parallel.\n\n🏋️ Deadlift: Bar over mid-foot, hinge at hips, flat back, drive through heels, squeeze glutes at top.\n\n🏋️ OHP: Grip just outside shoulders, press straight up, brace core.\n\n⚠️ Start light, film yourself, stop if sharp pain. Tempo: 2 sec down, 1 sec up.${ctx}`;

    if (lq.includes('hello') || lq.includes('hi') || lq.includes('hey'))
        return `Hey! 👋 I'm your AI Coach. Ask me about:\n\n📋 Workout Plans — "Give me a weekly plan"\n💪 Exercises — "How to train chest?"\n🥗 Nutrition — "What should I eat?"\n📈 Progress — "How to break a plateau?"\n🔥 Fat Loss / Muscle Gain\n😴 Recovery & Sleep\n💊 Supplements\n\nJust ask anything specific and I'll give you a detailed answer!${ctx}`;

    return `Here's some general guidance:\n\n💡 Key Principles:\n1. Progressive Overload — Add weight or reps each session\n2. Consistency — Train 3-5×/week for months\n3. Proper Form — Quality > quantity\n4. Recovery — Sleep 7-9 hrs, eat 1.6-2.2g protein/kg\n5. Patience — Results show in 8-12 weeks\n\nTry asking about specific topics like:\n• "Give me a weekly workout plan"\n• "How to train chest/back/legs"\n• "What should I eat?"\n• "How to lose weight?"\n\nI'll give you a detailed, actionable answer! 🏋️${ctx}`;
}


function groupIntoConversations(messages: Message[]): Conversation[] {
    if (messages.length === 0) return [];
    const convos: Conversation[] = [];
    let cur: Message[] = [messages[0]];
    for (let i = 1; i < messages.length; i++) {
        const prevT = messages[i - 1].createdAt ? new Date(messages[i - 1].createdAt!).getTime() : 0;
        const curT = messages[i].createdAt ? new Date(messages[i].createdAt!).getTime() : 0;
        if (curT - prevT > 30 * 60 * 1000) { convos.push(buildConvo(cur)); cur = [messages[i]]; }
        else { cur.push(messages[i]); }
    }
    if (cur.length > 0) convos.push(buildConvo(cur));
    return convos.reverse();
}

function buildConvo(msgs: Message[]): Conversation {
    const firstUser = msgs.find(m => m.role === 'user');
    const title = firstUser ? (firstUser.content.length > 40 ? firstUser.content.substring(0, 40) + '...' : firstUser.content) : 'New conversation';
    const last = msgs[msgs.length - 1];
    const preview = last.role === 'assistant' ? (last.content.length > 60 ? last.content.substring(0, 60) + '...' : last.content) : '';
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

export default function AIScreen() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [activeMessages, setActiveMessages] = useState<Message[]>([]);
    const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
    const [activeConvoTitle, setActiveConvoTitle] = useState('New Chat');
    const [showSidebar, setShowSidebar] = useState(true);
    const scrollRef = useRef<ScrollView>(null);
    const { token } = useAuthStore();
    const { history: workoutHistory } = useWorkoutStore();
    const { isDark, colors } = useTheme();
    const { width } = Dimensions.get('window');
    const isWideScreen = Platform.OS === 'web' && width >= 768;

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        if (!token) { setIsLoadingHistory(false); return; }
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 5000);
        try {
            const res = await fetch(`${API_URL}/ai/history`, { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal });
            clearTimeout(tid);
            if (res.ok) {
                const data = await res.json();
                setAllMessages(data.map((m: any) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })));
            }
        } catch { clearTimeout(tid); }
        finally { setIsLoadingHistory(false); }
    };

    const conversations = groupIntoConversations(allMessages);

    const openConvo = (convo: Conversation) => {
        setActiveMessages(convo.messages); setActiveConvoId(convo.id); setActiveConvoTitle(convo.title);
        if (!isWideScreen) setShowSidebar(false);
    };

    const newChat = () => {
        const welcome: Message = { id: 'welcome', role: 'assistant', content: '👋 Hey! I\'m your AI Coach. Ask me anything about training, nutrition, or your progress!', createdAt: new Date().toISOString() };
        setActiveMessages([welcome]); setActiveConvoId(null); setActiveConvoTitle('New Chat');
        if (!isWideScreen) setShowSidebar(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        if (showSidebar && !isWideScreen) newChat();
        if (activeMessages.length === 0) newChat();
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), createdAt: new Date().toISOString() };
        if (!activeMessages.some(m => m.role === 'user')) {
            setActiveConvoTitle(userMsg.content.length > 40 ? userMsg.content.substring(0, 40) + '...' : userMsg.content);
        }
        setActiveMessages(p => [...p, userMsg]); setAllMessages(p => [...p, userMsg]); setInput(''); setIsLoading(true);
        if (!isWideScreen) setShowSidebar(false);
        try {
            const ctrl = new AbortController(); const tid = setTimeout(() => ctrl.abort(), 15000);
            const res = await fetch(`${API_URL}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: userMsg.content }), signal: ctrl.signal });
            clearTimeout(tid);
            if (res.ok) { const data = await res.json(); const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, createdAt: new Date().toISOString() }; setActiveMessages(p => [...p, aiMsg]); setAllMessages(p => [...p, aiMsg]); }
            else throw new Error();
        } catch {
            setTimeout(() => { const fb: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: generateOfflineResponse(userMsg.content, workoutHistory), createdAt: new Date().toISOString() }; setActiveMessages(p => [...p, fb]); setAllMessages(p => [...p, fb]); }, 800);
        } finally { setIsLoading(false); }
    };

    const clearAll = () => {
        Alert.alert('Clear All History', 'Delete all conversations?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear', style: 'destructive', onPress: async () => {
                    try { await fetch(`${API_URL}/ai/history`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); } catch { }
                    setAllMessages([]); setActiveMessages([]); setActiveConvoId(null); setShowSidebar(true);
                }
            }
        ]);
    };

    const renderSidebar = () => (
        <ChatHistorySidebar conversations={conversations} activeConvoId={activeConvoId} isLoading={isLoadingHistory} isWideScreen={isWideScreen} onSelectConvo={openConvo} onNewChat={newChat} onClearAll={clearAll} />
    );

    const renderChat = () => (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Chat Header */}
            <View style={{ backgroundColor: colors.card, borderBottomColor: colors.border }} className="p-4 border-b flex-row items-center">
                {!isWideScreen && (
                    <TouchableOpacity onPress={() => setShowSidebar(true)} className="mr-3 p-1">
                        <ArrowLeft size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                <Text style={{ color: colors.text }} className="font-bold text-base flex-1" numberOfLines={1}>{activeConvoTitle}</Text>
            </View>

            {/* Messages or Empty state */}
            {activeMessages.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe' }} className="w-16 h-16 rounded-full items-center justify-center mb-4">
                        <Bot size={32} color="#2563eb" />
                    </View>
                    <Text style={{ color: colors.text }} className="text-xl font-bold mb-2">What can I help with?</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-center text-sm mb-6">Ask about workouts, nutrition, or your progress</Text>
                    {['What should I train today?', 'How do I improve my bench press?', 'Give me a push/pull/legs split'].map((p, i) => (
                        <TouchableOpacity key={i} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full rounded-xl p-3.5 mb-2 border" onPress={() => setInput(p)} activeOpacity={0.7}>
                            <Text style={{ color: colors.textSecondary }} className="text-sm">{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <ScrollView className="flex-1 p-4" ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                    {activeMessages.map((msg) => (
                        <View key={msg.id} className={`flex-row mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe' }} className="w-8 h-8 rounded-full items-center justify-center mr-2">
                                    <Bot size={16} color="#2563eb" />
                                </View>
                            )}
                            <View style={msg.role === 'user' ? undefined : { backgroundColor: colors.card }} className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-none' : 'rounded-tl-none shadow-sm'}`}>
                                <Text style={{ color: msg.role === 'user' ? '#ffffff' : colors.text }}>{msg.content}</Text>
                                {msg.createdAt && msg.id !== 'welcome' && (
                                    <Text className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : ''}`} style={msg.role !== 'user' ? { color: colors.textTertiary } : undefined}>
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                )}
                            </View>
                            {msg.role === 'user' && (
                                <View style={{ backgroundColor: colors.cardAlt }} className="w-8 h-8 rounded-full items-center justify-center ml-2">
                                    <UserIcon size={16} color={colors.textSecondary} />
                                </View>
                            )}
                        </View>
                    ))}
                    {isLoading && (
                        <View className="flex-row mb-4 justify-start">
                            <View style={{ backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe' }} className="w-8 h-8 rounded-full items-center justify-center mr-2">
                                <Bot size={16} color="#2563eb" />
                            </View>
                            <View style={{ backgroundColor: colors.card }} className="rounded-2xl rounded-tl-none p-4 shadow-sm">
                                <ActivityIndicator size="small" color="#2563eb" />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
                <View style={{ backgroundColor: colors.card, borderTopColor: colors.border }} className="p-4 border-t flex-row items-center">
                    <TextInput
                        style={{ backgroundColor: colors.inputBg, color: colors.text }}
                        className="flex-1 rounded-full px-4 py-3 mr-3 max-h-24"
                        placeholder="Message AI Coach..."
                        placeholderTextColor="#9ca3af"
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity
                        style={{ backgroundColor: input.trim() ? '#2563eb' : (isDark ? '#374151' : '#d1d5db') }}
                        className="w-12 h-12 rounded-full items-center justify-center"
                        onPress={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {isWideScreen ? (
                <View className="flex-1 flex-row">
                    {renderSidebar()}
                    {renderChat()}
                </View>
            ) : (
                showSidebar ? renderSidebar() : renderChat()
            )}
        </SafeAreaView>
    );
}
