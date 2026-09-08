'use client';

import React, { useEffect, useRef } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  useErrorMessage,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { ViewportMode, ViewMode } from '@/lib/types';
import {
  SANDPACK_THEME,
  SANDPACK_CUSTOM_SETUP,
  SANDPACK_INDEX_HTML,
} from '@/lib/sandpack-template';

interface PreviewPaneProps {
  code: string;
  onCodeChange: (code: string) => void;
  viewport: ViewportMode;
  viewMode: ViewMode;
  onErrorDetected: (error: string | null) => void;
}

// Internal watcher inside SandpackProvider to monitor compilation errors and two-way code sync
function SandpackWatcher({
  code,
  onErrorDetected,
  onCodeChange,
}: {
  code: string;
  onErrorDetected: (error: string | null) => void;
  onCodeChange: (code: string) => void;
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

  return null;
}

export default function PreviewPane({
  code,
  onCodeChange,
  viewport,
  viewMode,
  onErrorDetected,
}: PreviewPaneProps) {
  // Build Sandpack virtual file map
  const files = {
    '/App.js': code,
    '/public/index.html': SANDPACK_INDEX_HTML,
  };

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
        }}
      >
        <SandpackWatcher
          code={code}
          onErrorDetected={onErrorDetected}
          onCodeChange={onCodeChange}
        />

        <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex">
          {/* Split Mode: Code on Left */}
          {viewMode === 'split' && (
            <div className="w-1/2 min-h-0 h-full border-r border-zinc-800/80 flex flex-col bg-zinc-950">
              <div className="h-8 px-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
                <span>App.tsx (Source)</span>
                <span className="text-[10px] text-zinc-500">Live Editable & Scrollable</span>
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

          {/* Full Code Mode */}
          {viewMode === 'code' && (
            <div className="w-full min-h-0 h-full flex flex-col bg-zinc-950">
              <div className="h-8 px-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
                <span>App.tsx (Source)</span>
                <span className="text-[10px] text-zinc-500">Live Editable & Scrollable</span>
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

          {/* Preview View (Desktop, Tablet, or Mobile) */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`flex-1 min-h-0 h-full flex items-center justify-center p-2 sm:p-4 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] overflow-auto ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              {/* Desktop Viewport */}
              {viewport === 'desktop' && (
                <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col">
                  <SandpackPreview
                    showOpenInCodeSandbox={false}
                    showRefreshButton={true}
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
              )}

              {/* Tablet Viewport (768px frame) */}
              {viewport === 'tablet' && (
                <div className="w-[768px] max-w-full h-[95%] max-h-[1024px] rounded-2xl border-[10px] border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-zinc-700">
                  {/* Tablet Top Bezel Camera */}
                  <div className="h-4 bg-zinc-800 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-zinc-900 ring-1 ring-zinc-700" />
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton={true}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </div>
              )}

              {/* Mobile Viewport (390px iPhone-style frame) */}
              {viewport === 'mobile' && (
                <div className="w-[390px] max-w-full h-[820px] max-h-[96%] rounded-[48px] border-[12px] border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col relative overflow-hidden ring-2 ring-zinc-700/60">
                  {/* iPhone Dynamic Island Bezel */}
                  <div className="h-7 bg-zinc-950 w-full flex items-center justify-center pt-1 z-20 shrink-0">
                    <div className="w-24 h-4 bg-zinc-900 rounded-full flex items-center justify-end pr-2 ring-1 ring-zinc-800">
                      <div className="w-2 h-2 rounded-full bg-zinc-950 ring-1 ring-zinc-800" />
                    </div>
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton={true}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                  {/* Home indicator bar */}
                  <div className="h-4 bg-zinc-950 w-full flex items-center justify-center shrink-0">
                    <div className="w-32 h-1 bg-zinc-700 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SandpackProvider>
    </div>
  );
}
