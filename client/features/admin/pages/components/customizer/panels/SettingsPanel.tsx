"use client";

import { CustomizerSection } from '@/types/customizer';
import { Eye, Monitor, Settings2, Smartphone, Tablet, Type, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StyleInspector from './StyleInspector';
import { findPathToBlock, getSectionLabel } from '@/features/admin/pages/lib/page-builder-tree';
import { useCustomizerData } from '../hooks/useCustomizerData';
import { getBlockDefinition, isStructuralType } from '../blocks';

interface SettingsPanelProps {
  section: CustomizerSection;
  allSections: CustomizerSection[];
  viewMode: 'desktop' | 'tablet' | 'mobile';
  pageTitle?: string;
  onUpdate: (section: CustomizerSection) => void;
  onClose: () => void;
}

const SettingsPanel = React.memo(({ section, allSections, viewMode, pageTitle, onUpdate, onClose }: SettingsPanelProps) => {
  const resources = useCustomizerData();
  const isStructural = useMemo(() => isStructuralType(section.type), [section.type]);
  const definition = useMemo(() => getBlockDefinition(section.type), [section.type]);
  const [activeTab, setActiveTab] = useState<'content' | 'styles' | 'visibility'>(
    isStructural ? 'styles' : 'content'
  );

  useEffect(() => {
    setActiveTab(isStructural ? 'styles' : 'content');
  }, [section.id, isStructural]);

  const updateSetting = useCallback((key: string, value: unknown) => {
    onUpdate({
      ...section,
      settings: { ...(section.settings as Record<string, unknown>), [key]: value },
    });
  }, [section, onUpdate]);

  const updateStyle = useCallback((key: string, value: unknown) => {
    onUpdate({
      ...section,
      styles: {
        ...(section.styles as Record<string, unknown> || { paddingTop: 40, paddingBottom: 40 }),
        [key]: value,
      },
    });
  }, [section, onUpdate]);

  const updateStyles = useCallback((updates: Record<string, unknown>) => {
    onUpdate({
      ...section,
      styles: {
        ...(section.styles as Record<string, unknown> || { paddingTop: 40, paddingBottom: 40 }),
        ...updates,
      },
    });
  }, [section, onUpdate]);

  const updateVisibility = useCallback(
    (key: 'desktop' | 'tablet' | 'mobile', value: boolean) => {
      onUpdate({
        ...section,
        visibility: {
          desktop: true,
          tablet: true,
          mobile: true,
          ...(section.visibility || {}),
          [key]: value,
        },
      });
    },
    [section, onUpdate],
  );

  const updateArrayItem = useCallback((key: string, itemId: string, itemData: Record<string, unknown>) => {
    const settings = (section.settings as Record<string, unknown>) || {};
    const list = (settings[key] as Array<Record<string, unknown>>) || [];
    const newList = list.map((item) => (item.id === itemId ? { ...item, ...itemData } : item));
    updateSetting(key, newList);
  }, [section.settings, updateSetting]);

  const addArrayItem = useCallback((key: string, defaultItem: Record<string, unknown>) => {
    const settings = (section.settings as Record<string, unknown>) || {};
    const list = (settings[key] as Array<Record<string, unknown>>) || [];
    const newItem = { ...defaultItem, id: `item-${Date.now()}` };
    updateSetting(key, [...list, newItem]);
  }, [section.settings, updateSetting]);

  const removeArrayItem = useCallback((key: string, itemId: string) => {
    const settings = (section.settings as Record<string, unknown>) || {};
    const list = (settings[key] as Array<Record<string, unknown>>) || [];
    updateSetting(key, list.filter((item) => item.id !== itemId));
  }, [section.settings, updateSetting]);

  const getSectionTitle = (type: string) => {
    return type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const settings = (section.settings as Record<string, unknown>) || {};
  const breadcrumb = useMemo(
    () => findPathToBlock(allSections, section.id) ?? [section],
    [allSections, section],
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col min-w-0 gap-0.5">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-brand-600 shrink-0" />
            <h2 className="text-sm font-bold truncate">{getSectionTitle(section.type)}</h2>
          </div>
          <p className="text-[9px] text-slate-400 truncate pl-6">
            {breadcrumb.map((b) => getSectionLabel(b.type)).join(' › ')}
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!isStructural && (
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'content' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Content
          </button>
        )}
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'styles' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Styles
        </button>
        <button
          onClick={() => setActiveTab('visibility')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'visibility' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Visibility
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'styles' && (
          <StyleInspector
            styles={(section.styles as Record<string, unknown>) || {}}
            onChange={updateStyle}
            onBatchChange={updateStyles}
            nodeType={section.type}
            viewMode={viewMode}
          />
        )}

        {activeTab === 'visibility' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Eye className="w-3.5 h-3.5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Show On
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Choose which screen sizes render this block. To soft-hide it on every
              breakpoint without deleting, use the eye toggle in the canvas toolbar.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'desktop', label: 'Desktop', icon: Monitor },
                  { key: 'tablet', label: 'Tablet', icon: Tablet },
                  { key: 'mobile', label: 'Mobile', icon: Smartphone },
                ] as const
              ).map(({ key, label, icon: Icon }) => {
                const enabled = section.visibility?.[key] !== false;
                return (
                  <button
                    key={key}
                    onClick={() => updateVisibility(key, !enabled)}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      enabled
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Type className="w-3.5 h-3.5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Content</h3>
            </div>

            {definition.ContentEditor ? (
              <definition.ContentEditor
                section={section}
                settings={settings}
                viewMode={viewMode}
                resources={resources}
                pageTitle={pageTitle}
                onUpdate={updateSetting}
                updateArrayItem={updateArrayItem}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
              />
            ) : (
              <p className="text-xs text-slate-400">This block has no content settings.</p>
            )}
          </section>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <button onClick={onClose} className="w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-600 transition-colors">
          Done Editing
        </button>
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;
