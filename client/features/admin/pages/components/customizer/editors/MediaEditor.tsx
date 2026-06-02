"use client";

import React from 'react';
import DebouncedInput from '../panels/DebouncedInput';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';

interface MediaEditorProps {
  section: any;
  onUpdate: (key: string, value: any) => void;
}

const MediaEditor = React.memo(({ section, onUpdate }: MediaEditorProps) => {
  const settings = section.settings || {};
  const isVideo = section.type === 'video-block';

  return (
    <div className="space-y-4">
      {isVideo ? (
        <>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
            <DebouncedInput
              type="text"
              value={settings?.headline || ''}
              onChange={(val) => onUpdate('headline', val)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="Video Title"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Video URL</label>
            <DebouncedInput
              type="text"
              value={settings?.videoUrl || ''}
              onChange={(val) => onUpdate('videoUrl', val)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="YouTube, Vimeo or MP4 URL"
            />
            <p className="text-[10px] text-slate-400 mt-1">Supports YouTube, Vimeo, and direct links.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Aspect Ratio</label>
            <select
              value={settings?.aspectRatio || '16 / 9'}
              onChange={(e) => onUpdate('aspectRatio', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
            >
              <option value="16 / 9">16:9 (Standard)</option>
              <option value="4 / 3">4:3 (Classic)</option>
              <option value="1 / 1">1:1 (Square)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['autoplay', 'loop', 'muted', 'controls'].map(opt => (
              <div key={opt} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                <input
                  type="checkbox"
                  id={opt}
                  checked={settings[opt] || false}
                  onChange={(e) => onUpdate(opt, e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor={opt} className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer capitalize">{opt}</label>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div>
            <ImageUploadField
              label="Image"
              value={settings?.imageUrl || ''}
              onChange={(val) => onUpdate('imageUrl', val)}
              uploadApi={fetchAPI}
              aspectRatio="square"
              showUrlInput={true}
              description="Upload block image or paste URL"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Alt Text</label>
            <DebouncedInput
              type="text"
              value={settings?.alt || ''}
              onChange={(val) => onUpdate('alt', val)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
              placeholder="Describe image"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Link (Optional)</label>
            <DebouncedInput
              type="text"
              value={settings?.link || ''}
              onChange={(val) => onUpdate('link', val)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
              placeholder="/shop"
            />
          </div>
        </>
      )}
    </div>
  );
});

export default MediaEditor;
