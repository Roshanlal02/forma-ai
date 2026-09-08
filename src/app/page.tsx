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
      const g = localStorage.getItem('forma_gemini_key')?.trim();
      const o = localStorage.getItem('forma_openai_key')?.trim();
      setHasCustomKey(Boolean(g || o));
    }
  }, []);

  useEffect(() => {
    checkKeys();
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

  // Load a starter template
  const handleSelectTemplate = (template: ComponentTemplate) => {
    setCurrentCode(template.code);
    setCurrentTemplateId(template.id);
    setSandpackError(null);

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
      <main className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden">
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
