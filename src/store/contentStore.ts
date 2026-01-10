import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchQuote, fetchArticles, Quote, Article } from '../lib/openai';

interface ContentState {
    dailyQuote: Quote | null;
    articles: Article[];
    lastQuoteFetched: number | null;
    lastArticlesFetched: number | null;
    isLoading: boolean;

    fetchContent: (isPullToRefresh?: boolean) => Promise<void>;
}

export const useContentStore = create<ContentState>()(
    persist(
        (set, get) => ({
            dailyQuote: null,
            articles: [],
            lastQuoteFetched: null,
            lastArticlesFetched: null,
            isLoading: false,

            fetchContent: async (isPullToRefresh = false) => {
                const { lastArticlesFetched, isLoading } = get();
                const now = Date.now();
                const ONE_DAY = 24 * 60 * 60 * 1000;

                if (isLoading) return;
                set({ isLoading: true });

                try {
                    // Logic:
                    // Quote: Always refresh on pull-to-refresh, or if empty.
                    // Articles: Only refresh if > 24h passed, or if empty.

                    // 1. Fetch Quote
                    const newQuote = await fetchQuote();

                    // 2. Check Article Expiry
                    let newArticles = get().articles;
                    let newLastArticlesFetched = lastArticlesFetched;

                    const shouldFetchArticles = !lastArticlesFetched || (now - lastArticlesFetched) > ONE_DAY;

                    if (shouldFetchArticles) {
                        newArticles = await fetchArticles();
                        newLastArticlesFetched = now;
                    }

                    set({
                        dailyQuote: newQuote,
                        lastQuoteFetched: now,
                        articles: newArticles,
                        lastArticlesFetched: newLastArticlesFetched,
                        isLoading: false
                    });

                } catch (error) {
                    set({ isLoading: false });
                    console.error("Failed to update content store:", error);
                }
            }
        }),
        {
            name: 'content-storage-v3',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
