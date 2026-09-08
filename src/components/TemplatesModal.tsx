'use client';

import React, { useState } from 'react';
import { X, Search, ArrowRight, LayoutTemplate, Check } from 'lucide-react';
import { TEMPLATES } from '@/data/templates';
import { ComponentTemplate } from '@/lib/types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ComponentTemplate) => void;
  currentTemplateId?: string;
}

export default function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Dashboard', 'Landing', 'Productivity', 'E-Commerce', 'Media'];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90dvh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header (Pinned) */}
        <div className="p-4 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">Starter Templates Gallery</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">Pick any interactive component to test or customize</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar (Pinned) */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-zinc-950/60 border-b border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 touch-pan-x">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap active:scale-95 transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-sm sm:text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Templates Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTemplates.map((template) => {
            const isSelected = currentTemplateId === template.id;
            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className={`group cursor-pointer rounded-xl p-4 sm:p-5 border text-left flex flex-col justify-between active:scale-[0.99] transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      {template.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                    {template.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 sm:mt-2 line-clamp-3 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 sm:mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-500">
                    {isSelected ? 'Currently Loaded' : 'Load in Sandbox'}
                  </span>
                  <div className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <>
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
