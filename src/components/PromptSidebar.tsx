'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Loader2, Bot, User, Wrench, AlertTriangle, 
  Trash2, ChevronDown, Cpu 
} from 'lucide-react';
import { ChatMessage, ModelOption } from '@/lib/types';

interface PromptSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string, model: string) => void;
  isGenerating: boolean;
  onClearHistory: () => void;
  sandpackError?: string | null;
  onAutoFixError?: (error: string) => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    badge: 'Recommended • Fast',
    description: 'Ultra-fast streaming & free tier friendly',
    isDefault: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    badge: 'Deep Reasoning',
    description: 'Ideal for complex logic and large layouts',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    badge: 'OpenAI',
    description: 'Fast, lightweight OpenAI model',
  },
];

const PROMPT_SUGGESTIONS = [
  'Add dark/light theme switch',
  'Add search & tag filters',
  'Add export to CSV button',
  'Add celebratory confetti on click',
  'Make it high contrast & vibrant',
];

export default function PromptSidebar({
  messages,
  onSendMessage,
  isGenerating,
  onClearHistory,
  sandpackError,
  onAutoFixError,
  selectedModel,
  onSelectModel,
}: PromptSidebarProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Adjust textarea height automatically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (overridePrompt?: string) => {
    const text = (overridePrompt || inputPrompt).trim();
    if (!text || isGenerating) return;

    onSendMessage(text, selectedModel);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <aside className="w-full lg:w-[420px] h-full flex flex-col bg-zinc-950 border-r border-zinc-800/80 text-zinc-100 select-none">
      {/* Top Bar: Model Selector & Clear */}
      <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/40">
        {/* Model dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentModel.name}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
              {AVAILABLE_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition ${
                    selectedModel === m.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{m.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      selectedModel === m.id ? 'bg-indigo-700 text-indigo-100' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{m.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear conversation */}
        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-zinc-500">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-300">Forma AI Studio</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Describe a UI you want to build, or request changes to the component loaded in the preview sandbox.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-bl-sm shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] opacity-70">
                  <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Forma AI'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {msg.isStreaming && (
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 pt-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Writing component code...</span>
                  </div>
                )}

                {msg.error && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] mt-2">
                    {msg.error}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Sandpack error banner with 1-click Auto-Fix */}
        {sandpackError && onAutoFixError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Sandbox Error Detected</span>
            </div>
            <p className="text-[11px] text-rose-400 font-mono line-clamp-2 bg-rose-950/80 p-1.5 rounded border border-rose-900/60">
              {sandpackError}
            </p>
            <button
              onClick={() => onAutoFixError(sandpackError)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow transition disabled:opacity-50"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Auto-Fix with AI</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions Chips */}
      <div className="px-3.5 py-2 border-t border-zinc-900 overflow-x-auto flex items-center gap-1.5 bg-zinc-950/80">
        {PROMPT_SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSubmit(sug)}
            disabled={isGenerating}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition disabled:opacity-40"
          >
            + {sug}
          </button>
        ))}
      </div>

      {/* Input Prompt Box */}
      <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/50">
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-indigo-500/80 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Forma to create or modify UI... (Cmd+Enter)"
            disabled={isGenerating}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none pr-10"
          />

          <button
            onClick={() => handleSubmit()}
            disabled={isGenerating || !inputPrompt.trim()}
            className="absolute bottom-2 right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30"
            title="Generate (Cmd+Enter)"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
