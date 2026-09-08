'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import PromptSidebar from '@/components/PromptSidebar';
import PreviewPane from '@/components/PreviewPane';
import ApiKeyModal from '@/components/ApiKeyModal';
import TemplatesModal from '@/components/TemplatesModal';
import { ChatMessage, ViewportMode, ViewMode, ComponentTemplate } from '@/lib/types';
import { DEFAULT_INITIAL_CODE } from '@/lib/sandpack-template';
import { extractCodeFromStream, extractCommentaryFromResponse } from '@/lib/code-extractor';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MessageSquare, Eye, Code, 
  PanelLeftOpen, GripVertical, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function StudioPage() {
  const [currentCode, setCurrentCode] = useState<string>(DEFAULT_INITIAL_CODE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [mobileTab, setMobileTab] = useState<'prompt' | 'preview' | 'code'>('prompt');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [sandpackError, setSandpackError] = useState<string | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(400);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);
  const [runTrigger, setRunTrigger] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSandboxReady, setIsSandboxReady] = useState<boolean>(false);

  // Check if API keys exist in localStorage
  const checkKeys = useCallback(() => {
    if (typeof window !== 'undefined') {
      const g = localStorage.getItem('forma_gemini_key')?.trim();
      const o = localStorage.getItem('forma_openai_key')?.trim();
      setHasCustomKey(Boolean(g || o));
    }
  }, []);

  // Restore saved sidebar settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('forma_sidebar_width');
      if (savedWidth) {
        const val = parseInt(savedWidth, 10);
        if (!isNaN(val) && val >= 260 && val <= 850) {
          setSidebarWidth(val);
        }
      }
      const savedCollapsed = localStorage.getItem('forma_sidebar_collapsed');
      if (savedCollapsed === 'true') {
        setIsSidebarCollapsed(true);
      }
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('forma_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Sidebar drag resize handlers
  const handleSidebarResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
  };

  useEffect(() => {
    if (!isDraggingSidebar) return;

    const handlePointerMove = (e: PointerEvent) => {
      const minW = 280;
      const maxW = Math.min(window.innerWidth * 0.65, 800);
      const clamped = Math.max(minW, Math.min(maxW, e.clientX));
      setSidebarWidth(clamped);
      if (isSidebarCollapsed) setIsSidebarCollapsed(false);
    };

    const handlePointerUp = () => {
      setIsDraggingSidebar(false);
      localStorage.setItem('forma_sidebar_width', sidebarWidth.toString());
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSidebar, sidebarWidth, isSidebarCollapsed]);

  // Determine if the Run button should be disabled and the explanation tooltip
  const getRunDisabledReason = (): string | null => {
    if (!isMounted) return 'Initializing workspace...';
    if (isGenerating) return 'Cannot run while AI is generating component...';
    if (isRunning) return 'Code output is currently running...';
    if (isMobile && mobileTab === 'prompt') return 'Switch to Preview or Code tab to run';
    if (!currentCode || currentCode.trim().length < 20) return 'No component code to run';
    if (!isSandboxReady) return 'Sandbox is preparing environment...';
    return null;
  };

  const runDisabledReason = getRunDisabledReason();
  const isRunDisabled = Boolean(runDisabledReason);

  // Handle manual code run execution
  const handleRunCode = useCallback(() => {
    if (isRunDisabled) {
      if (runDisabledReason) {
        toast(runDisabledReason, { icon: '⏳' });
      }
      return;
    }

    setIsRunning(true);
    setRunTrigger((prev) => prev + 1);
    toast.success('Running code output...', { icon: '⚡' });

    // On mobile, automatically show the preview tab
    if (isMobile && mobileTab !== 'preview') {
      setMobileTab('preview');
      setViewMode('preview');
    }
    // If on desktop in code-only mode, switch to split mode to reveal live output
    if (!isMobile && viewMode === 'code') {
      setViewMode('split');
    }

    setTimeout(() => {
      setIsRunning(false);
    }, 600);
  }, [isRunDisabled, runDisabledReason, isMobile, mobileTab, viewMode]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Shift+Enter to run code output
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === 'Enter') ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Enter')
      ) {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode]);

  useEffect(() => {
    checkKeys();
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkKeys]);

  // Handle generation via streaming API
  const handleSendMessage = async (prompt: string, model: string) => {
    if (isGenerating) return;

    // Check if user has an API key configured before starting
    const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('forma_gemini_key')?.trim() || '' : '';
    const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('forma_openai_key')?.trim() || '' : '';

    if (model.startsWith('gemini') && !geminiKey) {
      setIsApiKeyModalOpen(true);
      toast.error('Please configure your free Gemini API key first', { duration: 4000 });
      return;
    }
    if (model.startsWith('gpt') && !openaiKey) {
      setIsApiKeyModalOpen(true);
      toast.error('Please configure your OpenAI API key first', { duration: 4000 });
      return;
    }

    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsGenerating(true);
    setSandpackError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
        },
        body: JSON.stringify({
          prompt,
          currentCode,
          model,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 && errorData.error === 'MISSING_API_KEY') {
          setIsApiKeyModalOpen(true);
          throw new Error(errorData.message || 'API Key required to generate custom components.');
        }
        throw new Error(errorData.message || `Generation failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body stream missing');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Check if stream returned an error tag
        if (chunk.includes('__STREAM_ERROR__:')) {
          const parts = chunk.split('__STREAM_ERROR__:');
          accumulatedText += parts[0];
          try {
            const errObj = JSON.parse(parts[1]);
            streamError = errObj.message || 'AI provider returned an error.';
          } catch {
            streamError = parts[1] || 'AI provider returned an error.';
          }
          break;
        }

        accumulatedText += chunk;

        // Parse code from streaming buffer
        const { code } = extractCodeFromStream(accumulatedText);
        if (code && code.length > 50) {
          setCurrentCode(code);
        }

        // Update assistant message with streaming content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: extractCommentaryFromResponse(accumulatedText, Boolean(code)),
                }
              : m
          )
        );
      }

      if (streamError) {
        throw new Error(streamError);
      }

      // Final pass on stream completion
      const { code: finalCode } = extractCodeFromStream(accumulatedText);
      if (!finalCode || finalCode.length < 30) {
        throw new Error(
          accumulatedText.trim() ||
            'AI response completed, but no valid executable React component was produced. Please retry with more specific instructions.'
        );
      }

      setCurrentCode(finalCode);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isStreaming: false,
                content: extractCommentaryFromResponse(accumulatedText, true),
                code: finalCode,
              }
            : m
        )
      );

      // Celebrate successful generation
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
      });
      toast.success('Component generated successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Generation stream error:', error);
      toast.error(error?.message || 'Error generating component', { duration: 5000 });

      // If key error, suggest checking API key
      if (
        error.message?.toLowerCase().includes('api key') ||
        error.message?.toLowerCase().includes('apikey')
      ) {
        setIsApiKeyModalOpen(true);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isStreaming: false,
                content: `Generation failed: ${error?.message || 'Please check your API key or prompt.'}`,
                error: error?.message,
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Mobile tab change handler
  const handleMobileTabChange = (tab: 'prompt' | 'preview' | 'code') => {
    setMobileTab(tab);
    if (tab === 'code') {
      setViewMode('code');
    } else if (tab === 'preview') {
      setViewMode('preview');
    }
  };

  // Load a starter template
  const handleSelectTemplate = (template: ComponentTemplate) => {
    setCurrentCode(template.code);
    setCurrentTemplateId(template.id);
    setSandpackError(null);
    handleMobileTabChange('preview'); // Automatically switch to preview on mobile

    const templateNotice: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Loaded starter template: **${template.title}** (${template.category}). You can now preview it, scroll & edit the code, or ask me to modify it!`,
      timestamp: Date.now(),
      code: template.code,
    };

    setMessages((prev) => [...prev, templateNotice]);
    toast.success(`Loaded "${template.title}" template`);
  };

  // Auto fix runtime or syntax error
  const handleAutoFixError = (error: string) => {
    const fixPrompt = `The component failed with the following sandbox error:\n"${error}"\n\nPlease fix this error and make sure all imports and JSX are fully valid.`;
    handleSendMessage(fixPrompt, selectedModel);
  };

  // Reset to default blank canvas
  const handleReset = () => {
    setCurrentCode(DEFAULT_INITIAL_CODE);
    setCurrentTemplateId(undefined);
    setSandpackError(null);
    toast('Sandbox reset to default state', { icon: '🔄' });
  };

  return (
    <div className="h-screen h-[100dvh] w-full min-w-0 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            fontSize: '12px',
          },
        }}
      />

      {/* Top Navigation Bar */}
      <Header
        viewport={viewport}
        onViewportChange={setViewport}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        onReset={handleReset}
        currentCode={currentCode}
        hasCustomKey={hasCustomKey}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        isRunDisabled={isRunDisabled}
        runDisabledTooltip={runDisabledReason || undefined}
      />

      {/* Mobile Navigation Sub-Header (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-zinc-800/80 z-30 shrink-0">
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-1 gap-1 w-full max-w-sm mx-auto shadow-inner">
          <button
            onClick={() => handleMobileTabChange('prompt')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'prompt'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Prompt</span>
            {isGenerating && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-ping" />
            )}
          </button>
          <button
            onClick={() => handleMobileTabChange('preview')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
            {sandpackError && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            )}
          </button>
          <button
            onClick={() => handleMobileTabChange('code')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'code'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden relative">
        {!isMounted ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-950">
            <div className="flex items-center gap-2.5 text-zinc-500 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Initializing workspace...</span>
            </div>
          </div>
        ) : !isMobile ? (
          <>
            {/* Transparent overlay while dragging to prevent iframe capturing pointer events */}
            {isDraggingSidebar && (
              <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
            )}

            {/* Desktop Left: Chat & Prompt Engineering Sidebar */}
            <div
              style={{
                width: isSidebarCollapsed ? 0 : `${sidebarWidth}px`,
                transition: isDraggingSidebar ? 'none' : 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className={`h-full flex flex-col shrink-0 overflow-hidden relative ${
                isSidebarCollapsed ? 'invisible pointer-events-none' : ''
              }`}
            >
              <PromptSidebar
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                onClearHistory={() => setMessages([])}
                sandpackError={sandpackError}
                onAutoFixError={handleAutoFixError}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
              />
            </div>

            {/* Sidebar Divider & Resize Handle */}
            <div
              onPointerDown={handleSidebarResizeStart}
              onDoubleClick={() => {
                setSidebarWidth(400);
                setIsSidebarCollapsed(false);
                localStorage.setItem('forma_sidebar_width', '400');
                localStorage.setItem('forma_sidebar_collapsed', 'false');
              }}
              className={`w-2.5 -mx-1 relative z-20 cursor-col-resize group flex items-center justify-center shrink-0 select-none transition-colors ${
                isDraggingSidebar ? 'bg-indigo-600/30' : 'hover:bg-indigo-500/20'
              }`}
              title="Drag to resize sidebar • Double-click to reset (400px)"
            >
              {/* Divider visible line */}
              <div className="w-[1px] h-full bg-zinc-800 group-hover:bg-indigo-500/50 transition-colors" />

              {/* Drag Handle Grip Pill */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-full flex items-center justify-center transition-all ${
                  isDraggingSidebar ? 'bg-indigo-500 scale-125' : 'bg-zinc-700 group-hover:bg-indigo-400'
                }`}
              >
                <GripVertical className="w-3 h-3 text-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Collapse/Expand mini toggle button on the handle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
                className="absolute top-14 z-30 w-5 h-5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={isSidebarCollapsed ? 'Expand sidebar (Cmd+B)' : 'Collapse sidebar (Cmd+B)'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronLeft className="w-3 h-3" />
                )}
              </button>

              {/* Floating width tooltip badge while dragging */}
              {isDraggingSidebar && (
                <div className="absolute top-8 z-30 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-200 shadow-xl whitespace-nowrap pointer-events-none">
                  {Math.round(sidebarWidth)}px
                </div>
              )}
            </div>

            {/* Desktop Right: Live Sandpack Preview & Code Editor */}
            <div className="flex-1 min-h-0 h-full w-full flex flex-col relative">
              {/* Floating Expand Button when sidebar is collapsed */}
              {isSidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-3 left-3 z-30 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white shadow-xl flex items-center gap-1.5 text-xs font-medium backdrop-blur transition active:scale-95"
                  title="Expand prompt sidebar (Cmd+B)"
                >
                  <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
                  <span>Prompt</span>
                </button>
              )}

              <PreviewPane
                code={currentCode}
                onCodeChange={setCurrentCode}
                viewport={viewport}
                viewMode={viewMode}
                onErrorDetected={setSandpackError}
                isMobile={false}
                runTrigger={runTrigger}
                onReadyChange={setIsSandboxReady}
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile View: Dynamic Single-Screen Views */}
            {mobileTab === 'prompt' ? (
              <div className="w-full h-full flex flex-col min-h-0">
                <PromptSidebar
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  onClearHistory={() => setMessages([])}
                  sandpackError={sandpackError}
                  onAutoFixError={handleAutoFixError}
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  onSwitchToPreview={() => handleMobileTabChange('preview')}
                  onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col min-h-0">
                <PreviewPane
                  code={currentCode}
                  onCodeChange={setCurrentCode}
                  viewport="desktop"
                  viewMode={mobileTab === 'code' ? 'code' : 'preview'}
                  onErrorDetected={setSandpackError}
                  isMobile={true}
                  onSwitchToPrompt={() => handleMobileTabChange('prompt')}
                  runTrigger={runTrigger}
                  onReadyChange={setIsSandboxReady}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={checkKeys}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={currentTemplateId}
      />
    </div>
  );
}
