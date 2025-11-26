import { create } from 'zustand';
import { ModelKey } from '@/lib/models';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  modelKey: ModelKey;
  timestamp: number;
  predictionId?: string;
  revisedPrompt?: string;
}

export type AspectRatio = 'square' | 'landscape' | 'portrait';

export interface SessionStore {
  // Image Gen Screen State
  selectedModel: ModelKey;
  currentPrompt: string;
  aspectRatio: AspectRatio;
  referenceImages: string[];
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  imagesToGenerate: number;
  activeGenerations: number;

  // Prompt Upgrade State  
  isUpgradeOpen: boolean;
  upgradePrompt: string;
  upgradedPrompt: string;
  isUpgrading: boolean;
  
  // Actions
  setSelectedModel: (model: ModelKey) => void;
  setCurrentPrompt: (prompt: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setReferenceImages: (images: string[]) => void;
  addReferenceImage: (imageUrl: string) => void;
  removeReferenceImage: (index: number) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  setImagesToGenerate: (count: number) => void;
  startGeneration: () => void;
  finishGeneration: () => void;

  // Prompt Upgrade Actions
  setIsUpgradeOpen: (open: boolean) => void;
  setUpgradePrompt: (prompt: string) => void;
  setUpgradedPrompt: (prompt: string) => void;
  setIsUpgrading: (upgrading: boolean) => void;
  
  // Utility Actions
  reset: () => void;
}

const initialState = {
  selectedModel: 'imagen4_fast' as ModelKey,
  currentPrompt: '',
  aspectRatio: 'square' as AspectRatio,
  referenceImages: [],
  isGenerating: false,
  generatedImages: [],
  imagesToGenerate: 1,
  activeGenerations: 0,
  
  isUpgradeOpen: false,
  upgradePrompt: '',
  upgradedPrompt: '',
  isUpgrading: false,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  setSelectedModel: (model) => set({ selectedModel: model }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setReferenceImages: (images) => set({ referenceImages: images }),
  addReferenceImage: (imageUrl) => 
    set((state) => ({ 
      referenceImages: [...state.referenceImages, imageUrl] 
    })),
  removeReferenceImage: (index) =>
    set((state) => ({ 
      referenceImages: state.referenceImages.filter((_, i) => i !== index) 
    })),
  addGeneratedImage: (image) =>
    set((state) => ({ 
      generatedImages: [...state.generatedImages, image] 
    })),
  setImagesToGenerate: (count) =>
    set({
      imagesToGenerate: Math.max(1, Math.min(5, Math.floor(count))),
    }),
  startGeneration: () =>
    set((state) => {
      const nextCount = state.activeGenerations + 1;
      return {
        activeGenerations: nextCount,
        isGenerating: true,
      };
    }),
  finishGeneration: () =>
    set((state) => {
      const nextCount = Math.max(0, state.activeGenerations - 1);
      return {
        activeGenerations: nextCount,
        isGenerating: nextCount > 0,
      };
    }),
  
  setIsUpgradeOpen: (open) => set({ isUpgradeOpen: open }),
  setUpgradePrompt: (prompt) => set({ upgradePrompt: prompt }),
  setUpgradedPrompt: (prompt) => set({ upgradedPrompt: prompt }),
  setIsUpgrading: (upgrading) => set({ isUpgrading: upgrading }),
  
  reset: () => set(initialState),
}));
