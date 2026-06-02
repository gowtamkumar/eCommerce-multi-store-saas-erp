"use client";

import React from 'react';
import DebouncedInput from '../panels/DebouncedInput';

interface SimpleContentEditorProps {
  section: any;
  onUpdate: (key: string, value: any) => void;
}

const SimpleContentEditor = React.memo(({ section, onUpdate }: SimpleContentEditorProps) => {
  const settings = section.settings || {};

  switch (section.type) {
    case 'heading':
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Text</label>
          <DebouncedInput type="text" value={settings?.text || ''} onChange={(val) => onUpdate('text', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Level</label>
          <select value={settings?.level || 'h2'} onChange={(e) => onUpdate('level', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border">
            {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
      );

    case 'paragraph':
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Text Content</label>
          <DebouncedInput as="textarea" value={settings?.text || ''} onChange={(val) => onUpdate('text', val)} className="w-full px-3 py-2 text-sm rounded-lg border min-h-[100px]" />
        </div>
      );

    case 'button':
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
          <DebouncedInput type="text" value={settings?.text || ''} onChange={(val) => onUpdate('text', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Link</label>
          <DebouncedInput type="text" value={settings?.link || ''} onChange={(val) => onUpdate('link', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Variant</label>
              <select value={settings?.variant || 'solid'} onChange={(e) => onUpdate('variant', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border">
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
              <select value={settings?.size || 'md'} onChange={(e) => onUpdate('size', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border">
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 'divider':
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Thickness (px)</label>
          <DebouncedInput type="number" value={settings?.height || 1} onChange={(val) => onUpdate('height', parseInt(val))} className="w-full px-3 py-2 text-sm rounded-lg border" />
        </div>
      );

    case 'spacer':
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Height (px)</label>
          <DebouncedInput type="number" value={settings?.height || 40} onChange={(val) => onUpdate('height', parseInt(val))} className="w-full px-3 py-2 text-sm rounded-lg border" min="0" max="200" />
        </div>
      );

    case 'text-block':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
            <DebouncedInput type="text" value={settings?.headline || ''} onChange={(val) => onUpdate('headline', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
            <DebouncedInput type="text" value={settings?.subline || ''} onChange={(val) => onUpdate('subline', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Full HTML/Markdown Content</label>
            <DebouncedInput as="textarea" value={settings?.content || settings?.html || ''} onChange={(val) => onUpdate(settings?.html !== undefined ? 'html' : 'content', val)} className="w-full px-3 py-2 text-sm rounded-lg border min-h-[200px]" />
          </div>
        </div>
      );

    default:
      return null;
  }
});

export default SimpleContentEditor;
