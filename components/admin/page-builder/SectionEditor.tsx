"use client";

import { PageBuilderSection } from '@/types/page-builder';
import { ChevronDown, ChevronUp, Copy, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import RichEditor from '../RichEditor';
import ProductGridEditor from './ProductGridEditor';
import StylePanel from './StylePanel';

interface SectionEditorProps {
  section: PageBuilderSection;
  onUpdate: (section: PageBuilderSection) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleProps?: any;
}

export default function SectionEditor({ section, onUpdate, onDelete, onDuplicate, dragHandleProps }: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(section.isExpanded);

  const updateContent = (key: string, value: any) => {
    onUpdate({
      ...section,
      content: { ...section.content, [key]: value },
    });
  };

  const updateStyles = (styles: any) => {
    onUpdate({ ...section, styles });
  };

  const getSectionIcon = () => {
    switch (section.type) {
      case 'hero': return '🎯';
      case 'rich-text': return '📝';
      case 'product-grid': return '🛍️';
      case 'faq': return '❓';
      case 'cta': return '📢';
      case 'features': return '✨';
      default: return '📄';
    }
  };

  const getSectionTitle = () => {
    return section.type.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4">
      {/* Section Header - Always Visible */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
        <button
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);
            onUpdate({ ...section, isExpanded: newExpanded });
          }}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-brand-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
          <span className="text-2xl">{getSectionIcon()}</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {getSectionTitle()}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onDuplicate}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Duplicate Section"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content - Collapsible */}
      {isExpanded && (
        <div className="grid grid-cols-2">
          {/* Left: Content Fields */}
          <div className="p-6 space-y-4 border-r border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
              Content
            </h4>

            {/* Hero Section */}
            {section.type === 'hero' && (
              <>
                <input
                  type="text"
                  placeholder="Headline"
                  value={section.content.headline || ''}
                  onChange={(e) => updateContent('headline', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <textarea
                  placeholder="Description"
                  value={section.content.subline || ''}
                  onChange={(e) => updateContent('subline', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </>
            )}

            {/* Rich Text Section */}
            {section.type === 'rich-text' && (
              <RichEditor
                content={section.content.html || ''}
                onChange={(html) => updateContent('html', html)}
              />
            )}

            {/* Product Grid */}
            {section.type === 'product-grid' && (
              <ProductGridEditor
                content={section.content}
                onUpdate={updateContent}
              />
            )}

            {/* FAQ Section */}
            {section.type === 'faq' && (
              <>
                <input
                  type="text"
                  placeholder="Section Title (Optional)"
                  value={section?.content?.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <textarea
                  placeholder="Description (Optional)"
                  value={section.content?.description || ''}
                  onChange={(e) => updateContent('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </>
            )}

            {/* CTA Section */}
            {section.type === 'cta' && (
              <>
                <input
                  type="text"
                  placeholder="Headline"
                  value={section.content.headline || ''}
                  onChange={(e) => updateContent('headline', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <textarea
                  placeholder="Description"
                  value={section.content.subline || ''}
                  onChange={(e) => updateContent('subline', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Button Text"
                    value={section.content.buttonLabel || ''}
                    onChange={(e) => updateContent('buttonLabel', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Button Link"
                    value={section.content.buttonLink || ''}
                    onChange={(e) => updateContent('buttonLink', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </>
            )}

            {/* Features Section */}
            {section.type === 'features' && (
              <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                This will display your product features automatically
              </div>
            )}
          </div>

          {/* Right: Style Panel */}
          <div className="bg-slate-50 dark:bg-slate-900/30">
            <div className="p-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Styling
              </h4>
            </div>
            <StylePanel
              styles={section.styles}
              onChange={updateStyles}
            />
          </div>
        </div>
      )}
    </div>
  );
}
