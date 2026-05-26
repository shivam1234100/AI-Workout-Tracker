import { create } from 'zustand';

const QUOTES = [
    "The only bad workout is the one that didn't happen.",
    "Push yourself, because no one else is going to do it for you.",
    "Success starts with self-discipline.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Don't limit your challenges. Challenge your limits.",
    "Strive for progress, not perfection.",
    "What seems impossible today will one day become your warm-up.",
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    "Wake up with determination. Go to bed with satisfaction.",
    "The secret of getting ahead is getting started.",
    "Sweat is just fat crying.",
    "No pain, no gain.",
    "Train insane or remain the same.",
    "The harder you work, the luckier you get.",
];

interface ContentState {
    getQuote: () => string;
}

export const useContentStore = create<ContentState>()(() => ({
    getQuote: () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
}));
