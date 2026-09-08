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

export default function StudioPage() {
  const [currentCode, setCurrentCode] = useState<string>(DEFAULT_INITIAL_CODE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [sandpackError, setSandpackError] = useState<string | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>();

  // Check if API keys exist in localStorage
  const checkKeys = useCallback(() => {
    if (typeof window !== 'undefined') {
      const g = localStorage.getItem('forma_gemini_key');
      const o = localStorage.getItem('forma_openai_key');
      setHasCustomKey(Boolean(g || o));
    }
  }, []);

  useEffect(() => {
    checkKeys();
  }, [checkKeys]);

  // Handle generation via streaming API
  const handleSendMessage = async (prompt: string, model: string) => {
    if (isGenerating) return;

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
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('forma_gemini_key') || '' : '';
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('forma_openai_key') || '' : '';

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
          toast.error(errorData.message || 'API Key required to generate UI', { duration: 5000 });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    content: 'Please configure your Gemini API Key (free from Google AI Studio) to generate components.',
                    error: 'Missing API Key',
                  }
                : m
            )
          );
          setIsGenerating(false);
          return;
        }
        throw new Error(errorData.message || `Generation failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body stream missing');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
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
                  content: extractCommentaryFromResponse(accumulatedText),
                }
              : m
          )
        );
      }

      // Final pass on stream completion
      const { code: finalCode } = extractCodeFromStream(accumulatedText);
      if (finalCode && finalCode.length > 30) {
        setCurrentCode(finalCode);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isStreaming: false,
                content: extractCommentaryFromResponse(accumulatedText),
                code: finalCode || undefined,
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
      console.error('Generation stream error:', err);
      toast.error(error?.message || 'Error streaming component');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isStreaming: false,
                content: 'Failed to generate component. Please verify your prompt or API key.',
                error: error?.message,
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Load a starter template
  const handleSelectTemplate = (template: ComponentTemplate) => {
    setCurrentCode(template.code);
    setCurrentTemplateId(template.id);
    setSandpackError(null);

    const templateNotice: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Loaded starter template: **${template.title}** (${template.category}). You can now preview it, edit the code, or ask me to modify it!`,
      timestamp: Date.now(),
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
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
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
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Chat & Prompt Engineering Sidebar */}
        <PromptSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onClearHistory={() => setMessages([])}
          sandpackError={sandpackError}
          onAutoFixError={handleAutoFixError}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />

        {/* Right: In-Browser CodeSandbox Sandpack & Code Editor */}
        <PreviewPane
          code={currentCode}
          onCodeChange={setCurrentCode}
          viewport={viewport}
          viewMode={viewMode}
          onErrorDetected={setSandpackError}
        />
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
