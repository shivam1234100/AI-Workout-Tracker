import OpenAI from 'openai';
import { MOCK_QUOTES, MOCK_ARTICLES } from '../constants/mockData';

// Initialize OpenAI safely
export const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'mock_key',
    dangerouslyAllowBrowser: true
});

export interface Quote {
    text: string;
}

export interface Article {
    id: string;
    title: string;
    category: string;
    readTime: string;
    image: string;
    url: string;
}

export const fetchQuote = async (): Promise<Quote> => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a fitness motivator. Generate a JSON response with a single field 'text' containing a short, powerful motivational quote about working out. Do NOT include the author name. The quote should be anonymous.`
                },
                {
                    role: 'user',
                    content: 'Generate a motivational quote.'
                }
            ],
            model: 'gpt-3.5-turbo',
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content || '{}');
        return content as Quote;
    } catch (error) {
        console.log("Error fetching quote:", error);
        return { text: MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)].text };
    }
};

export const fetchArticles = async (): Promise<Article[]> => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Curate 5 trending fitness articles. Generate a JSON response with a field 'articles' which is an array of objects (id, title, category, readTime, image_url, url).
                    For images, use high-quality Unsplash URLs.
                    For URLs, point to reputable sites like Healthline.`
                },
                {
                    role: 'user',
                    content: 'Get 5 fitness articles.'
                }
            ],
            model: 'gpt-3.5-turbo',
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content || '{}');
        return content.articles || [];
    } catch (error) {
        console.log("Error fetching articles:", error);
        return MOCK_ARTICLES.slice(0, 5) as any; // Fallback
    }
};
