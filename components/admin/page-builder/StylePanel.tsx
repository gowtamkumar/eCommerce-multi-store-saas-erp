"use client";

import { SectionStyles } from '@/types/page-builder';
import { Box, Layout, Palette, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface StylePanelProps {
  styles: SectionStyles;
  onChange: (styles: SectionStyles) => void;
}

type TabType = 'layout' | 'colors' | 'spacing' | 'effects';

export default function StylePanel({ styles, onChange }: StylePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  const updateStyle = <K extends keyof SectionStyles>(key: K, value: SectionStyles[K]) => {
    onChange({ ...styles, [key]: value });
  };

  const tabs = [
    { id: 'layout' as TabType, label: 'Layout', icon: Layout },
    { id: 'colors' as TabType, label: 'Colors', icon: Palette },
    { id: 'spacing' as TabType, label: 'Spacing', icon: Box },
    { id: 'effects' as TabType, label: 'Effects', icon: Sparkles },
  ];

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Width
              </label>
              <select
                value={styles.width}
                onChange={(e) => updateStyle('width', e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="full">Full Width</option>
                <option value="container">Container (1200px)</option>
                <option value="narrow">Narrow (896px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Text Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle('alignment', align)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${styles.alignment === align
                        ? 'bg-brand-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
                      }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || ''}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.textColor || '#1e293b'}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={styles.textColor || ''}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  placeholder="#1e293b"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Border Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.borderColor || '#e2e8f0'}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={styles.borderColor || ''}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  placeholder="#e2e8f0"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Padding (px)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Top</label>
                  <input
                    type="number"
                    value={styles.paddingTop}
                    onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Bottom</label>
                  <input
                    type="number"
                    value={styles.paddingBottom}
                    onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Left</label>
                  <input
                    type="number"
                    value={styles.paddingLeft}
                    onChange={(e) => updateStyle('paddingLeft', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Right</label>
                  <input
                    type="number"
                    value={styles.paddingRight}
                    onChange={(e) => updateStyle('paddingRight', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Margin (px)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Top</label>
                  <input
                    type="number"
                    value={styles.marginTop}
                    onChange={(e) => updateStyle('marginTop', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Bottom</label>
                  <input
                    type="number"
                    value={styles.marginBottom}
                    onChange={(e) => updateStyle('marginBottom', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Border Width (px)
              </label>
              <input
                type="number"
                value={styles.borderWidth}
                onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Border Radius (px)
              </label>
              <input
                type="number"
                value={styles.borderRadius}
                onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Box Shadow
              </label>
              <select
                value={styles.boxShadow}
                onChange={(e) => updateStyle('boxShadow', e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="2xl">2X Large</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Opacity ({styles.opacity}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={styles.opacity}
                onChange={(e) => updateStyle('opacity', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
