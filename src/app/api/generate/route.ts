import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// Explicitly mark as edge or nodejs runtime (nodejs runtime is reliable for streaming)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are Forma AI, an expert Senior Principal Frontend & UI/UX Engineer specialized in building production-grade React components with Tailwind CSS.

YOUR GOAL:
Generate clean, modern, interactive, accessible, and responsive React components based on user prompts or refine existing code.

STRICT CODE GENERATION RULES:
1. Return a single, self-contained React component with "export default function App()".
2. Use modern React 18 with hooks (useState, useEffect, useMemo, useRef).
3. Style ONLY with standard Tailwind CSS classes. Use modern design patterns:
   - Dark aesthetic by default (zinc-950, zinc-900, zinc-800, zinc-100, indigo-500/600 accents).
   - Crisp borders (border-zinc-800 or border-white/10), subtle shadows, rounded-xl/2xl cards.
   - Responsive design (sm:, md:, lg: prefixes) so it works on mobile, tablet, and desktop.
4. Allowed third-party dependencies:
   - "lucide-react" (import icons like Sparkles, ArrowRight, Check, Trash2, Search, etc.)
   - "canvas-confetti" (import confetti from 'canvas-confetti')
   - Do NOT import any other external packages that are not part of React, lucide-react, or canvas-confetti.
5. Always provide rich, realistic mock data (names, dates, metrics, prices, avatars) so the component looks like a real, live SaaS application.
6. Make interactions actually work:
   - Tabs should switch active views.
   - Search inputs should filter lists.
   - Checkboxes/buttons should update state.
   - Modals should open and close.
7. Wrap your entire component code inside standard markdown code fences with tsx or jsx:
\`\`\`tsx
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  ...
}
\`\`\`
8. If modifying existing code:
   - Keep the existing functionality intact unless asked to remove or change it.
   - Apply the requested changes seamlessly.
   - ALWAYS output the full updated component code, never partial snippets or diffs.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, currentCode, model = 'gemini-1.5-flash', history = [] } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract API keys from custom client headers or server environment
    const customGeminiKey = req.headers.get('x-gemini-key')?.trim();
    const customOpenAiKey = req.headers.get('x-openai-key')?.trim();

    const geminiKey = customGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiKey = customOpenAiKey || process.env.OPENAI_API_KEY;

    let languageModel;

    if (model.startsWith('gemini')) {
      if (!geminiKey) {
        return new Response(
          JSON.stringify({
            error: 'MISSING_API_KEY',
            provider: 'Google Gemini',
            message: 'A Google Gemini API key is required. Click the "API Key" button at the top to add your free Gemini key.',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const google = createGoogleGenerativeAI({ apiKey: geminiKey });
      languageModel = google(model);
    } else if (model.startsWith('gpt')) {
      if (!openaiKey) {
        return new Response(
          JSON.stringify({
            error: 'MISSING_API_KEY',
            provider: 'OpenAI',
            message: 'An OpenAI API key is required. Click the "API Key" button at the top to add your OpenAI key.',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const openai = createOpenAI({ apiKey: openaiKey });
      languageModel = openai(model);
    } else {
      // Default to Gemini 1.5 Flash
      if (!geminiKey) {
        return new Response(
          JSON.stringify({
            error: 'MISSING_API_KEY',
            provider: 'Google Gemini',
            message: 'A Google Gemini API key is required. Click the "API Key" button at the top to add your free Gemini key.',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const google = createGoogleGenerativeAI({ apiKey: geminiKey });
      languageModel = google('gemini-1.5-flash');
    }

    // Build conversational context
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Include recent history if available (limit to last 4 exchanges to keep context focused)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Build the latest prompt including currentCode context if this is an iteration
    let fullUserPrompt = prompt;
    if (currentCode && currentCode.trim().length > 0) {
      fullUserPrompt = `Here is the current React component code:\n\n\`\`\`tsx\n${currentCode}\n\`\`\`\n\nUser request: ${prompt}\n\nPlease update the component accordingly while preserving all other functionality. Return the complete updated React component.`;
    }

    messages.push({
      role: 'user',
      content: fullUserPrompt,
    });

    const result = streamText({
      model: languageModel,
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.2, // low temperature for precise, deterministic code generation
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const err = error as Error;
    console.error('API /api/generate error:', error);
    return new Response(
      JSON.stringify({
        error: 'GENERATION_FAILED',
        message: err?.message || 'An unexpected error occurred during code generation.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
