import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { useAuthStore } from './authStore';
import { UserProgram, ProgramDayExercise } from '../constants/coachPrograms';
import { create as createDraft } from 'zustand';

interface DraftDay {
    id: string;
    name: string;
    exercises: ProgramDayExercise[];
}

interface ProgramDraftState {
    name: string;
    description: string;
    difficulty: string;
    durationWeeks: string;
    days: DraftDay[];
    editingId: string | null;
    setField: (field: 'name' | 'description' | 'difficulty' | 'durationWeeks', value: string) => void;
    setDays: (days: DraftDay[]) => void;
    addExerciseToDay: (dayId: string, exercise: ProgramDayExercise) => void;
    reset: () => void;
    loadFrom: (program: any) => void;
}

export const useProgramDraftStore = createDraft<ProgramDraftState>((set, get) => ({
    name: '',
    description: '',
    difficulty: 'Intermediate',
    durationWeeks: '',
    days: [],
    editingId: null,
    setField: (field, value) => set({ [field]: value } as any),
    setDays: (days) => set({ days }),
    addExerciseToDay: (dayId, exercise) => set((state) => ({
        days: state.days.map(d => {
            if (d.id !== dayId) return d;
            if (d.exercises.some(e => e.exerciseId === exercise.exerciseId)) return d;
            return { ...d, exercises: [...d.exercises, exercise] };
        })
    })),
    reset: () => set({
        name: '', description: '', difficulty: 'Intermediate', durationWeeks: '', days: [], editingId: null
    }),
    loadFrom: (program) => set({
        name: program?.name || '',
        description: program?.description || '',
        difficulty: program?.difficulty || 'Intermediate',
        durationWeeks: program?.durationWeeks?.toString() || '',
        days: (program?.days || []).map((d: any) => ({
            id: d.id || Math.random().toString(),
            name: d.name,
            exercises: d.exercises || [],
        })),
        editingId: program?.id || null,
    }),
}));

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
};

interface CreateProgramInput {
    name: string;
    description?: string;
    difficulty?: string;
    durationWeeks?: number;
    days: { name: string; order: number; exercises: ProgramDayExercise[] }[];
}

interface ProgramState {
    userPrograms: UserProgram[];
    isLoading: boolean;

    fetchUserPrograms: () => Promise<void>;
    createProgram: (data: CreateProgramInput) => Promise<void>;
    updateProgram: (id: string, data: CreateProgramInput) => Promise<void>;
    deleteProgram: (id: string) => Promise<void>;
}

export const useProgramStore = create<ProgramState>()(
    persist(
        (set, get) => ({
            userPrograms: [],
            isLoading: false,

            fetchUserPrograms: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                set({ isLoading: true });
                try {
                    const res = await fetchWithTimeout(`${API_URL}/programs`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        set({ userPrograms: data });
                    }
                } catch (error: any) {
                    const msg = error?.message || '';
                    if (!msg.includes('Aborted') && !msg.includes('Network request failed')) {
                        console.error('Failed to fetch programs:', error);
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            createProgram: async (data) => {
                const token = useAuthStore.getState().token;
                console.log('[createProgram] token exists:', !!token);
                console.log('[createProgram] API_URL:', API_URL);
                if (!token) {
                    throw new Error('Not logged in - please log in first');
                }

                try {
                    const res = await fetchWithTimeout(`${API_URL}/programs`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(data)
                    });
                    console.log('[createProgram] status:', res.status);
                    if (res.status === 401 || res.status === 403) {
                        // Token expired/invalid - force logout
                        useAuthStore.getState().logout();
                        throw new Error('Your session has expired. Please log in again.');
                    }
                    if (!res.ok) {
                        const errText = await res.text();
                        console.error('[createProgram] error body:', errText);
                        throw new Error(`HTTP ${res.status}: ${errText}`);
                    }
                    const program = await res.json();
                    console.log('[createProgram] saved with id:', program.id);
                    set((state) => ({ userPrograms: [program, ...state.userPrograms] }));
                } catch (e: any) {
                    console.error('[createProgram] exception:', e?.message || e);
                    throw new Error(e?.message || 'Network error - is backend running?');
                }
            },

            updateProgram: async (id, data) => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const res = await fetchWithTimeout(`${API_URL}/programs/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(data)
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        set((state) => ({
                            userPrograms: state.userPrograms.map(p => p.id === id ? updated : p)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to update program:', error);
                }
            },

            deleteProgram: async (id) => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                set((state) => ({
                    userPrograms: state.userPrograms.filter(p => p.id !== id)
                }));

                try {
                    await fetchWithTimeout(`${API_URL}/programs/${id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (error) {
                    console.error('Failed to delete program:', error);
                    get().fetchUserPrograms();
                }
            },
        }),
        {
            name: 'program-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
