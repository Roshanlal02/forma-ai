'use client';

import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ExternalLink, X, Check, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onKeyUpdated }: ApiKeyModalProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('forma_gemini_key') || '');
      setOpenaiKey(localStorage.getItem('forma_openai_key') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (geminiKey.trim()) {
        localStorage.setItem('forma_gemini_key', geminiKey.trim());
      } else {
        localStorage.removeItem('forma_gemini_key');
      }

      if (openaiKey.trim()) {
        localStorage.setItem('forma_openai_key', openaiKey.trim());
      } else {
        localStorage.removeItem('forma_openai_key');
      }

      toast.success('API keys saved locally in your browser!');
      onKeyUpdated();
      onClose();
    }
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('forma_gemini_key');
      localStorage.removeItem('forma_openai_key');
      setGeminiKey('');
      setOpenaiKey('');
      toast('API keys cleared from browser', { icon: '🧹' });
      onKeyUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90dvh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header (Pinned) */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">API Key Settings (BYOK)</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">Bring Your Own Key for custom AI generations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Security Notice */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="leading-relaxed text-[11px] sm:text-xs">
              <span className="font-semibold text-emerald-200">100% Client-Side Privacy:</span> Your keys are stored solely in your browser&apos;s <code className="bg-emerald-950/60 px-1 py-0.5 rounded font-mono text-[10px]">localStorage</code>. They are sent directly in request headers to Google/OpenAI and never logged or saved to any database.
            </div>
          </div>

          {/* Key Inputs */}
          <div className="space-y-4">
            {/* Google Gemini Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-zinc-200 flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Gemini API Key</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Free Tier
                  </span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Get free key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono transition"
              />
              <p className="text-[11px] text-zinc-500">
                Gemini 1.5 Flash provides ultra-fast streaming responses with free tier access at Google AI Studio.
              </p>
            </div>

            {/* OpenAI Key */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-zinc-200 flex items-center gap-1.5">
                  <span>OpenAI API Key (Optional)</span>
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-200 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Get key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono transition"
              />
              <p className="text-[11px] text-zinc-500">
                Supports GPT-4o and GPT-4o-mini models.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions (Pinned) */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/95">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Clear Keys</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
