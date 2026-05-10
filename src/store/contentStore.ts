import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUOTES = [
    "The only bad workout is the one that didn't happen.",
    "Strength does not come from the body. It comes from the will.",
    "Push yourself, because no one else is going to do it for you.",
    "The body achieves what the mind believes.",
    "Sweat is just fat crying.",
    "Don't limit your challenges. Challenge your limits.",
    "You don't have to be great to start, but you have to start to be great.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Success starts with self-discipline.",
    "Energy and persistence conquer all things.",
    "Discipline is doing what you hate to do, but doing it like you love it.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Wake up with determination. Go to bed with satisfaction.",
    "If it doesn't challenge you, it doesn't change you.",
    "The hardest lift of all is lifting your butt off the couch.",
];

interface ContentState {
    dailyQuote: string;
    lastUpdated: number;
    refreshQuote: () => void;
    getQuote: () => string;
}

export const useContentStore = create<ContentState>()(
    persist(
        (set, get) => ({
            dailyQuote: QUOTES[0],
            lastUpdated: 0,

            refreshQuote: () => {
                const now = Date.now();
                const ONE_DAY = 24 * 60 * 60 * 1000;
                if (now - get().lastUpdated > ONE_DAY) {
                    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
                    set({ dailyQuote: random, lastUpdated: now });
                }
            },

            getQuote: () => {
                get().refreshQuote();
                return get().dailyQuote;
            },
        }),
        {
            name: 'content-storage-v6',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
