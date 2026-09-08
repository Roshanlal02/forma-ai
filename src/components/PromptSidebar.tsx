'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Loader2, Bot, User, Wrench, AlertTriangle, 
  Trash2, ChevronDown, Cpu, Eye, LayoutTemplate 
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
  onSwitchToPreview?: () => void;
  onOpenTemplatesModal?: () => void;
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
  onSwitchToPreview,
  onOpenTemplatesModal,
}: PromptSidebarProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState<number>(100);
  const [isDraggingInput, setIsDraggingInput] = useState<boolean>(false);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(100);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved input height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forma_input_height');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 70 && val <= 360) {
          setInputHeight(val);
        }
      }
    }
  }, []);

  // Vertical resize handlers for prompt input area
  const handleInputResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingInput(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = inputHeight;
  };

  useEffect(() => {
    if (!isDraggingInput) return;

    const handlePointerMove = (e: PointerEvent) => {
      const delta = dragStartY.current - e.clientY;
      const newHeight = Math.max(75, Math.min(360, dragStartHeight.current + delta));
      setInputHeight(newHeight);
    };

    const handlePointerUp = () => {
      setIsDraggingInput(false);
      localStorage.setItem('forma_input_height', inputHeight.toString());
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingInput, inputHeight]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Adjust textarea height automatically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
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
  };

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <aside className="w-full h-full flex flex-col bg-zinc-950 border-r border-zinc-800/80 text-zinc-100 select-none relative">
      {/* Overlay to prevent iframe/pointer capture while resizing input */}
      {isDraggingInput && (
        <div className="fixed inset-0 z-50 cursor-row-resize select-none" />
      )}

      {/* Top Bar: Model Selector & Clear */}
      <div className="p-3 sm:p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/40 shrink-0">
        {/* Model dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[140px] sm:max-w-none">{currentModel.name}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
          </button>

          {isModelDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsModelDropdownOpen(false)} 
              />
              <div className="absolute top-full left-0 mt-1.5 w-64 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
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
            </>
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
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4 text-zinc-500">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Forma AI Studio</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                Describe a UI you want to build, or request changes to the component loaded in the preview sandbox.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onOpenTemplatesModal && (
                <button
                  onClick={onOpenTemplatesModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition"
                >
                  <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Browse Templates (6)</span>
                </button>
              )}
              {onSwitchToPreview && (
                <button
                  onClick={onSwitchToPreview}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>View Sandbox Preview</span>
                </button>
              )}
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
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Writing component code...</span>
                    </div>
                    {onSwitchToPreview && (
                      <button
                        onClick={onSwitchToPreview}
                        className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium hover:bg-indigo-500/30 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Watch Live in Preview →</span>
                      </button>
                    )}
                  </div>
                )}

                {msg.code && !msg.isStreaming && onSwitchToPreview && (
                  <div className="pt-1.5">
                    <button
                      onClick={onSwitchToPreview}
                      className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[11px] font-medium hover:text-white transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View in Preview →</span>
                    </button>
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
      <div className="px-3 sm:px-3.5 py-2 border-t border-zinc-900 overflow-x-auto no-scrollbar flex items-center gap-1.5 bg-zinc-950/80 shrink-0">
        {PROMPT_SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSubmit(sug)}
            disabled={isGenerating}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 text-zinc-400 hover:text-white transition disabled:opacity-40"
          >
            + {sug}
          </button>
        ))}
      </div>

      {/* Resizable Drag Handle for Prompt Input Box */}
      <div
        onPointerDown={handleInputResizeStart}
        onDoubleClick={() => {
          setInputHeight(100);
          localStorage.setItem('forma_input_height', '100');
        }}
        className={`h-2.5 -my-1 w-full flex items-center justify-center cursor-row-resize select-none relative z-20 transition-colors group ${
          isDraggingInput ? 'bg-indigo-600/30' : 'hover:bg-indigo-500/20'
        }`}
        title="Drag up/down to resize prompt box • Double-click to reset (100px)"
      >
        <div className="w-10 h-1 rounded-full bg-zinc-700 group-hover:bg-indigo-400 group-active:bg-indigo-300 transition-colors" />
      </div>

      {/* Input Prompt Box */}
      <div
        style={{ height: `${inputHeight}px` }}
        className="p-3 sm:p-3.5 border-t border-zinc-800 bg-zinc-900/50 shrink-0 flex flex-col"
      >
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-indigo-500/80 transition-all shadow-inner flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Forma to create or modify UI..."
            disabled={isGenerating}
            className="w-full flex-1 bg-transparent text-sm sm:text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none pr-10"
          />

          <button
            onClick={() => handleSubmit()}
            disabled={isGenerating || !inputPrompt.trim()}
            className="absolute bottom-2 right-2 p-2 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30"
            title="Generate (Cmd+Enter or tap)"
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
