'use client';

import React from 'react';
import { 
  Sparkles, Monitor, Tablet, Smartphone, Code, Eye, Columns, 
  Key, Download, Copy, Check, RotateCcw, LayoutTemplate, MoreHorizontal,
  PanelLeftClose, PanelLeftOpen, Play
} from 'lucide-react';
import { ViewportMode, ViewMode } from '@/lib/types';
import toast from 'react-hot-toast';

interface HeaderProps {
  viewport: ViewportMode;
  onViewportChange: (viewport: ViewportMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  onOpenApiKeyModal: () => void;
  onOpenTemplatesModal: () => void;
  onReset: () => void;
  currentCode: string;
  hasCustomKey: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onRunCode?: () => void;
  isRunning?: boolean;
  isRunDisabled?: boolean;
  runDisabledTooltip?: string;
}

export default function Header({
  viewport,
  onViewportChange,
  viewMode,
  onViewModeChange,
  onOpenApiKeyModal,
  onOpenTemplatesModal,
  onReset,
  currentCode,
  hasCustomKey,
  isSidebarCollapsed = false,
  onToggleSidebar,
  onRunCode,
  isRunning = false,
  isRunDisabled = false,
  runDisabledTooltip,
}: HeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      toast.success('Component code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'App.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded App.tsx');
  };

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between gap-4 z-40 select-none">
      {/* Brand & Templates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-sm">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">Forma AI</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v0-inspired
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden md:block" />

        {/* Sidebar Collapse/Expand Toggle (Desktop) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title={isSidebarCollapsed ? 'Expand sidebar (Cmd+B)' : 'Collapse sidebar (Cmd+B)'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Templates Gallery Button */}
        <button
          onClick={onOpenTemplatesModal}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
          <span>Templates</span>
          <span className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-center border border-zinc-700/60">
            6
          </span>
        </button>
      </div>

      {/* Center: Responsive Viewport Controls & View Mode */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Viewport switcher */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-0.5 text-xs text-zinc-400">
          <button
            onClick={() => onViewportChange('desktop')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${
              viewport === 'desktop' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-zinc-200'
            }`}
            title="Desktop (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => onViewportChange('tablet')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${
              viewport === 'tablet' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-zinc-200'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => onViewportChange('mobile')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${
              viewport === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-zinc-200'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-0.5 text-xs text-zinc-400">
          <button
            onClick={() => onViewModeChange('preview')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${
              viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${
              viewMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            onClick={() => onViewModeChange('code')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${
              viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Right: Actions, API Key, Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 relative">
        {/* Run Code Output Button */}
        {onRunCode && (
          <button
            onClick={isRunDisabled ? undefined : onRunCode}
            disabled={isRunDisabled || isRunning}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition select-none ${
              isRunDisabled
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                : isRunning
                ? 'bg-emerald-700 text-white cursor-wait opacity-90 shadow-md shadow-emerald-700/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white shadow-md shadow-emerald-600/25'
            }`}
            title={runDisabledTooltip || (isRunning ? 'Running...' : 'Run code output (Ctrl+Enter)')}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span className="font-semibold">{isRunning ? 'Running...' : 'Run'}</span>
          </button>
        )}

        {/* Templates on small screens */}
        <button
          onClick={onOpenTemplatesModal}
          className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition"
          title="Browse Templates"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden min-[420px]:inline text-[11px]">Templates</span>
        </button>

        {/* API Key Modal Trigger */}
        <button
          onClick={onOpenApiKeyModal}
          className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
            hasCustomKey
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-900 text-amber-400 border-amber-500/30 hover:bg-zinc-800'
          }`}
          title="Configure API Key"
        >
          <Key className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {hasCustomKey ? 'Key Connected' : 'Set API Key'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasCustomKey ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
        </button>

        {/* Copy Code (Always visible on all screens as top utility) */}
        <button
          onClick={handleCopy}
          className="p-1.5 sm:p-2 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
          title="Copy Code"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Desktop / Tablet Buttons (hidden on < sm) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition"
            title="Reset to Initial Screen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
            title="Download App.tsx"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Overflow Menu (< sm screens) */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {mobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 text-xs text-zinc-200">
                <button
                  onClick={() => {
                    handleDownload();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800 transition text-left"
                >
                  <Download className="w-4 h-4 text-zinc-400" />
                  <span>Download App.tsx</span>
                </button>
                <button
                  onClick={() => {
                    onReset();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-rose-400 transition text-left"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Sandbox</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
