import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MedicalCondition {
    id: string;
    text: string;
    type: 'injury' | 'condition' | 'allergy' | 'other';
    createdAt: string;
}

interface MedicalState {
    conditions: MedicalCondition[];
    additionalNotes: string;

    addCondition: (text: string, type: MedicalCondition['type']) => void;
    removeCondition: (id: string) => void;
    setAdditionalNotes: (notes: string) => void;
    clearAll: () => void;
}

export const useMedicalStore = create<MedicalState>()(
    persist(
        (set) => ({
            conditions: [],
            additionalNotes: '',

            addCondition: (text, type) => set((state) => ({
                conditions: [
                    ...state.conditions,
                    {
                        id: Date.now().toString(),
                        text: text.trim(),
                        type,
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            removeCondition: (id) => set((state) => ({
                conditions: state.conditions.filter((c) => c.id !== id),
            })),

            setAdditionalNotes: (notes) => set({ additionalNotes: notes }),

            clearAll: () => set({ conditions: [], additionalNotes: '' }),
        }),
        {
            name: 'medical-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
