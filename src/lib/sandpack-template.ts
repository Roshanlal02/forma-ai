import type { SandpackTheme } from '@codesandbox/sandpack-react';

export const SANDPACK_THEME: SandpackTheme = {
  colors: {
    surface1: '#09090b',
    surface2: '#18181b',
    surface3: '#27272a',
    clickable: '#a1a1aa',
    base: '#f4f4f5',
    disabled: '#52525b',
    hover: '#ffffff',
    accent: '#6366f1',
    error: '#ef4444',
    errorSurface: '#450a0a',
  },
  syntax: {
    plain: '#f4f4f5',
    comment: { color: '#71717a', fontStyle: 'italic' },
    keyword: '#c084fc',
    tag: '#38bdf8',
    punctuation: '#a1a1aa',
    definition: '#fb7185',
    property: '#67e8f9',
    static: '#f472b6',
    string: '#a3e635',
  },
  font: {
    body: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    size: '13px',
    lineHeight: '20px',
  },
};

export const SANDPACK_CUSTOM_SETUP = {
  dependencies: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'lucide-react': '^0.460.0',
    'canvas-confetti': '^1.9.3',
    'clsx': '^2.1.1',
    'tailwind-merge': '^2.5.2',
  },
};

export const SANDPACK_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brand: {
                50: '#eef2ff',
                100: '#e0e7ff',
                500: '#6366f1',
                600: '#4f46e5',
                700: '#4338ca',
              }
            }
          }
        }
      }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #09090b;
        color: #f4f4f5;
        margin: 0;
        padding: 0;
        min-height: 100vh;
      }
      /* Custom modern scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: #27272a;
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #3f3f46;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

export const DEFAULT_INITIAL_CODE = `import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers, Zap, Code, ShieldCheck, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [count, setCount] = useState(0);

  const handleCelebrate = () => {
    setCount(prev => prev + 1);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Forma AI Studio Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Craft UI at the Speed of Thought
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed">
          Type any interface request in the prompt bar to your left, or pick a starter template above to jump right into a living, responsive prototype.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 flex flex-col items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-300">Live Streaming</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 flex flex-col items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300">Sandpack Sandbox</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 flex flex-col items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-300">BYOK Security</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleCelebrate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Interactive Test ({count})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
`;
