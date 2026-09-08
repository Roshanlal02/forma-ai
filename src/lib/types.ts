export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export type ViewMode = 'preview' | 'code' | 'split';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  code?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'google' | 'openai';
  badge: string;
  description: string;
  isDefault?: boolean;
}

export interface ComponentTemplate {
  id: string;
  title: string;
  category: 'Dashboard' | 'E-Commerce' | 'Productivity' | 'Landing' | 'Media';
  description: string;
  badge: string;
  prompt: string;
  code: string;
}

export interface GenerationRequestPayload {
  prompt: string;
  currentCode?: string;
  model?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ApiKeys {
  geminiKey?: string;
  openaiKey?: string;
}
