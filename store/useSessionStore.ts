import { create } from 'zustand';
import { ModelKey } from '@/lib/models';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  modelKey: ModelKey;
  timestamp: number;
  predictionId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  prompt: string;
  images: GeneratedImage[];
  referenceImages?: string[];
  timestamp: number;
  modelKey: ModelKey;
  status: 'generating' | 'completed' | 'failed';
}

export interface SessionStore {
  // Image Gen Screen State
  selectedModel: ModelKey;
  currentPrompt: string;
  referenceImages: string[];
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  
  // Edit Screen State (ephemeral chat history)
  editMessages: ChatMessage[];
  editPrompt: string;
  editReferenceImages: string[];
  isEditGenerating: boolean;
  
  // Prompt Upgrade State  
  isUpgradeOpen: boolean;
  upgradePrompt: string;
  upgradedPrompt: string;
  isUpgrading: boolean;
  
  // Actions
  setSelectedModel: (model: ModelKey) => void;
  setCurrentPrompt: (prompt: string) => void;
  setReferenceImages: (images: string[]) => void;
  addReferenceImage: (imageUrl: string) => void;
  removeReferenceImage: (index: number) => void;
  setIsGenerating: (generating: boolean) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  
  // Edit Actions
  addEditMessage: (message: ChatMessage) => void;
  setEditPrompt: (prompt: string) => void;
  setEditReferenceImages: (images: string[]) => void;
  addEditReferenceImage: (imageUrl: string) => void;
  setIsEditGenerating: (generating: boolean) => void;
  clearEditHistory: () => void;
  
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
  referenceImages: [],
  isGenerating: false,
  generatedImages: [],
  
  editMessages: [],
  editPrompt: '',
  editReferenceImages: [],
  isEditGenerating: false,
  
  isUpgradeOpen: false,
  upgradePrompt: '',
  upgradedPrompt: '',
  isUpgrading: false,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,
  
  setSelectedModel: (model) => set({ selectedModel: model }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setReferenceImages: (images) => set({ referenceImages: images }),
  addReferenceImage: (imageUrl) => 
    set((state) => ({ 
      referenceImages: [...state.referenceImages, imageUrl] 
    })),
  removeReferenceImage: (index) =>
    set((state) => ({ 
      referenceImages: state.referenceImages.filter((_, i) => i !== index) 
    })),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  addGeneratedImage: (image) =>
    set((state) => ({ 
      generatedImages: [...state.generatedImages, image] 
    })),
    
  addEditMessage: (message) =>
    set((state) => ({ 
      editMessages: [...state.editMessages, message] 
    })),
  setEditPrompt: (prompt) => set({ editPrompt: prompt }),
  setEditReferenceImages: (images) => set({ editReferenceImages: images }),
  addEditReferenceImage: (imageUrl) =>
    set((state) => ({ 
      editReferenceImages: [...state.editReferenceImages, imageUrl] 
    })),
  setIsEditGenerating: (generating) => set({ isEditGenerating: generating }),
  clearEditHistory: () => set({ editMessages: [] }),
  
  setIsUpgradeOpen: (open) => set({ isUpgradeOpen: open }),
  setUpgradePrompt: (prompt) => set({ upgradePrompt: prompt }),
  setUpgradedPrompt: (prompt) => set({ upgradedPrompt: prompt }),
  setIsUpgrading: (upgrading) => set({ isUpgrading: upgrading }),
  
  reset: () => set(initialState),
}));