'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  useErrorMessage,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { ViewportMode, ViewMode } from '@/lib/types';
import { Code, MessageSquare, GripVertical } from 'lucide-react';
import {
  SANDPACK_THEME,
  SANDPACK_CUSTOM_SETUP,
  SANDPACK_INDEX_HTML,
  SANDPACK_CSS,
} from '@/lib/sandpack-template';

interface PreviewPaneProps {
  code: string;
  onCodeChange: (code: string) => void;
  viewport: ViewportMode;
  viewMode: ViewMode;
  onErrorDetected: (error: string | null) => void;
  isMobile?: boolean;
  onSwitchToPrompt?: () => void;
  runTrigger?: number;
  onReadyChange?: (isReady: boolean) => void;
}

// Internal watcher inside SandpackProvider to monitor compilation errors and two-way code sync
function SandpackWatcher({
  code,
  onErrorDetected,
  onCodeChange,
  runTrigger,
  onReadyChange,
}: {
  code: string;
  onErrorDetected: (error: string | null) => void;
  onCodeChange: (code: string) => void;
  runTrigger?: number;
  onReadyChange?: (isReady: boolean) => void;
}) {
  const { sandpack } = useSandpack();
  const errorMessage = useErrorMessage();
  const isUpdatingFromProp = useRef(false);

  // Sync compilation/runtime error to parent
  useEffect(() => {
    onErrorDetected(errorMessage || null);
  }, [errorMessage, onErrorDetected]);

  // When external `code` prop changes (from streaming or template), update Sandpack internal file
  useEffect(() => {
    const currentSandpackCode = sandpack.files['/App.js']?.code;
    if (code && code !== currentSandpackCode) {
      isUpdatingFromProp.current = true;
      sandpack.updateFile('/App.js', code, true);
      const timer = setTimeout(() => {
        isUpdatingFromProp.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [code, sandpack]);

  // When user edits inside Sandpack code editor, sync back to parent
  const sandpackCode = sandpack.files['/App.js']?.code;
  useEffect(() => {
    if (!isUpdatingFromProp.current && sandpackCode && sandpackCode !== code) {
      onCodeChange(sandpackCode);
    }
  }, [sandpackCode, code, onCodeChange]);

  // Trigger manual code execution when Run button is pressed
  useEffect(() => {
    if (runTrigger && runTrigger > 0) {
      sandpack.runSandpack();
      const currentFileCode = sandpack.files['/App.js']?.code;
      if (currentFileCode) {
        sandpack.updateFile('/App.js', currentFileCode, true);
      }
    }
  }, [runTrigger, sandpack]);

  // Sync readiness state to parent
  useEffect(() => {
    const hasClient = Object.keys(sandpack.clients || {}).length > 0;
    const isReady = hasClient && (sandpack.status === 'running' || sandpack.status === 'idle');
    onReadyChange?.(isReady);
    return () => {
      onReadyChange?.(false);
    };
  }, [sandpack.status, sandpack.clients, onReadyChange]);

  return null;
}

export default function PreviewPane({
  code,
  onCodeChange,
  viewport,
  viewMode,
  onErrorDetected,
  isMobile = false,
  onSwitchToPrompt,
  runTrigger,
  onReadyChange,
}: PreviewPaneProps) {
  // Build Sandpack virtual file map
  const files = useMemo(
    () => ({
      '/App.js': code,
      '/styles.css': SANDPACK_CSS,
      '/public/index.html': SANDPACK_INDEX_HTML,
      '/index.html': SANDPACK_INDEX_HTML,
    }),
    [code]
  );

  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Restore saved split ratio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forma_split_ratio');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 15 && val <= 85) {
          setSplitRatio(val);
        }
      }
    }
  }, []);

  // Split resize handlers
  const handleSplitResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingSplit(true);
  };

  useEffect(() => {
    if (!isDraggingSplit) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(18, Math.min(82, raw));
      setSplitRatio(clamped);
    };

    const handlePointerUp = () => {
      setIsDraggingSplit(false);
      localStorage.setItem('forma_split_ratio', splitRatio.toString());
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSplit, splitRatio]);

  return (
    <div className="relative flex-1 min-h-0 h-full w-full bg-zinc-950 overflow-hidden flex flex-col">
      <SandpackProvider
        template="react"
        theme={SANDPACK_THEME}
        customSetup={SANDPACK_CUSTOM_SETUP}
        files={files}
        className="h-full w-full flex flex-col flex-1 min-h-0"
        style={{ height: '100%', width: '100%' }}
        options={{
          activeFile: '/App.js',
          visibleFiles: ['/App.js'],
          recompileMode: 'delayed',
          recompileDelay: 250,
          externalResources: ['https://cdn.tailwindcss.com'],
        }}
      >
        <SandpackWatcher
          code={code}
          onErrorDetected={onErrorDetected}
          onCodeChange={onCodeChange}
          runTrigger={runTrigger}
          onReadyChange={onReadyChange}
        />

        <div
          ref={splitContainerRef}
          className="flex-1 min-h-0 w-full h-full overflow-hidden flex relative"
        >
          {/* Transparent overlay while dragging to prevent iframe stealing pointer events */}
          {isDraggingSplit && (
            <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
          )}

          {/* Code Editor (Active in Split or Code View) */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div
              style={viewMode === 'split' ? { width: `${splitRatio}%` } : { width: '100%' }}
              className="min-h-0 h-full flex flex-col bg-zinc-950 shrink-0"
            >
              <div className="h-8 px-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>App.tsx (Source)</span>
                </div>
                <span className="text-[10px] text-zinc-500">Live Editable</span>
              </div>
              <div className="flex-1 min-h-0 h-full relative overflow-hidden flex flex-col">
                <SandpackCodeEditor
                  showLineNumbers
                  showInlineErrors
                  wrapContent={false}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Split Mode Resizer Divider */}
          {viewMode === 'split' && (
            <div
              onPointerDown={handleSplitResizeStart}
              onDoubleClick={() => {
                setSplitRatio(50);
                localStorage.setItem('forma_split_ratio', '50');
              }}
              className={`w-2.5 -mx-1 relative z-20 cursor-col-resize group flex items-center justify-center shrink-0 select-none transition-colors ${
                isDraggingSplit ? 'bg-indigo-600/30' : 'hover:bg-indigo-500/20'
              }`}
              title="Drag to resize Code vs Preview • Double-click to reset (50/50)"
            >
              {/* Divider visible line */}
              <div className="w-[1px] h-full bg-zinc-800 group-hover:bg-indigo-500/50 transition-colors" />

              {/* Drag Handle Grip Pill */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDraggingSplit ? 'bg-indigo-500 scale-125' : 'bg-zinc-700 group-hover:bg-indigo-400'
                }`}
              >
                <GripVertical className="w-3 h-3 text-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Floating ratio tooltip badge while dragging */}
              {isDraggingSplit && (
                <div className="absolute top-10 z-30 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-200 shadow-xl whitespace-nowrap pointer-events-none">
                  {Math.round(splitRatio)}% / {Math.round(100 - splitRatio)}%
                </div>
              )}
            </div>
          )}

          {/* Preview View (Active in Preview or Split View) */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              style={viewMode === 'split' ? { width: `${100 - splitRatio}%` } : { width: '100%' }}
              className="flex-1 min-h-0 h-full flex items-center justify-center p-0 sm:p-2 lg:p-4 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] overflow-auto relative shrink-0"
            >
              {/* Responsive Container Frame */}
              <div
                className={`flex flex-col transition-all duration-300 relative overflow-hidden bg-zinc-950 shadow-2xl ${
                  isMobile || viewport === 'desktop'
                    ? 'w-full h-full rounded-none sm:rounded-xl border-0 sm:border border-zinc-800'
                    : viewport === 'tablet'
                    ? 'w-[768px] max-w-full h-[95%] max-h-[1024px] rounded-2xl border-[10px] border-zinc-800 ring-1 ring-zinc-700'
                    : 'w-[390px] max-w-full h-[820px] max-h-[96%] rounded-[48px] border-[12px] border-zinc-800 ring-2 ring-zinc-700/60'
                }`}
              >
                {/* Simulated Tablet Top Bezel Camera */}
                {!isMobile && viewport === 'tablet' && (
                  <div className="h-4 bg-zinc-800 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-zinc-900 ring-1 ring-zinc-700" />
                  </div>
                )}

                {/* Simulated iPhone Dynamic Island Bezel */}
                {!isMobile && viewport === 'mobile' && (
                  <div className="h-7 bg-zinc-950 w-full flex items-center justify-center pt-1 z-20 shrink-0">
                    <div className="w-24 h-4 bg-zinc-900 rounded-full flex items-center justify-end pr-2 ring-1 ring-zinc-800">
                      <div className="w-2 h-2 rounded-full bg-zinc-950 ring-1 ring-zinc-800" />
                    </div>
                  </div>
                )}

                {/* Sandpack Preview Container */}
                <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col">
                  <SandpackPreview
                    showOpenInCodeSandbox={false}
                    showRefreshButton={true}
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>

                {/* Simulated iPhone Home Indicator Bar */}
                {!isMobile && viewport === 'mobile' && (
                  <div className="h-4 bg-zinc-950 w-full flex items-center justify-center shrink-0">
                    <div className="w-32 h-1 bg-zinc-700 rounded-full" />
                  </div>
                )}
              </div>

              {/* Mobile Floating Quick Action Button */}
              {isMobile && onSwitchToPrompt && (
                <button
                  onClick={onSwitchToPrompt}
                  className="absolute bottom-4 right-4 z-30 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-xl shadow-indigo-600/40 flex items-center gap-1.5 text-xs font-semibold border border-indigo-400/30 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Edit with AI</span>
                </button>
              )}
            </div>
          )}
        </div>
      </SandpackProvider>
    </div>
  );
}
