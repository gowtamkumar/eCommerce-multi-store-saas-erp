"use client";

import type { PageBlockContentResult, PageBlockType } from "@/features/admin/ai/types/ai-studio";
import React from "react";
import DebouncedInput from "../panels/DebouncedInput";
import { PageBlockAiAssist } from "../panels/page-settings/PageBlockAiAssist";

const AI_BLOCK_TYPES = new Set<PageBlockType>(["heading", "paragraph", "button", "text-block"]);

interface SimpleContentEditorProps {
  section: any;
  pageTitle?: string;
  onUpdate: (key: string, value: any) => void;
}

function getExistingText(type: string, settings: Record<string, any>): string | undefined {
  if (type === "text-block") {
    return (
      (settings.headline as string) ||
      (settings.html as string) ||
      (settings.content as string) ||
      undefined
    );
  }
  return (settings.text as string) || undefined;
}

function applyBlockContent(
  type: string,
  result: PageBlockContentResult,
  onUpdate: (key: string, value: any) => void,
  settings: Record<string, any>,
) {
  if (type === "heading" || type === "paragraph") {
    if (result.text) onUpdate("text", result.text);
    return;
  }
  if (type === "button") {
    if (result.text) onUpdate("text", result.text);
    if (result.link) onUpdate("link", result.link);
    return;
  }
  if (type === "text-block") {
    if (result.headline) onUpdate("headline", result.headline);
    if (result.subline) onUpdate("subline", result.subline);
    if (result.html) {
      onUpdate(settings.html !== undefined ? "html" : "content", result.html);
    }
  }
}

const SimpleContentEditor = React.memo(({ section, pageTitle, onUpdate }: SimpleContentEditorProps) => {
  const settings = section.settings || {};
  const showAi = AI_BLOCK_TYPES.has(section.type as PageBlockType);

  const aiBar = showAi ? (
    <PageBlockAiAssist
      blockType={section.type as PageBlockType}
      pageTitle={pageTitle}
      existingText={getExistingText(section.type, settings)}
      onApply={(result) => applyBlockContent(section.type, result, onUpdate, settings)}
    />
  ) : null;

  switch (section.type) {
    case "heading":
      return (
        <div className="space-y-4">
          {aiBar}
          <label className="text-[10px] font-bold text-slate-500 uppercase">Text</label>
          <DebouncedInput
            type="text"
            value={(settings.text as string) || ""}
            onChange={(val) => onUpdate("text", val)}
            className="w-full px-3 py-2 text-sm rounded-lg border"
          />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Level</label>
          <select
            value={(settings.level as string) || "h2"}
            onChange={(e) => onUpdate("level", e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border"
          >
            {["h1", "h2", "h3", "h4", "h5", "h6"].map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      );

    case "paragraph":
      return (
        <div className="space-y-4">
          {aiBar}
          <label className="text-[10px] font-bold text-slate-500 uppercase">Text Content</label>
          <DebouncedInput
            as="textarea"
            value={(settings.text as string) || ""}
            onChange={(val) => onUpdate("text", val)}
            className="w-full px-3 py-2 text-sm rounded-lg border min-h-[100px]"
          />
        </div>
      );

    case "button":
      return (
        <div className="space-y-4">
          {aiBar}
          <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
          <DebouncedInput
            type="text"
            value={(settings.text as string) || ""}
            onChange={(val) => onUpdate("text", val)}
            className="w-full px-3 py-2 text-sm rounded-lg border"
          />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Link</label>
          <DebouncedInput
            type="text"
            value={(settings.link as string) || ""}
            onChange={(val) => onUpdate("link", val)}
            className="w-full px-3 py-2 text-sm rounded-lg border"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Variant</label>
              <select
                value={(settings.variant as string) || "solid"}
                onChange={(e) => onUpdate("variant", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
              <select
                value={(settings.size as string) || "md"}
                onChange={(e) => onUpdate("size", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Thickness (px)</label>
          <DebouncedInput
            type="number"
            value={String(settings?.height ?? 1)}
            onChange={(val) => onUpdate("height", parseInt(val, 10))}
            className="w-full px-3 py-2 text-sm rounded-lg border"
          />
        </div>
      );

    case "spacer":
      return (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Height (px)</label>
          <DebouncedInput
            type="number"
            value={String(settings?.height ?? 40)}
            onChange={(val) => onUpdate("height", parseInt(val, 10))}
            className="w-full px-3 py-2 text-sm rounded-lg border"
            min="0"
            max="200"
          />
        </div>
      );

    case "text-block":
      return (
        <div className="space-y-4">
          {aiBar}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
            <DebouncedInput
              type="text"
              value={(settings.headline as string) || ""}
              onChange={(val) => onUpdate("headline", val)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
            <DebouncedInput
              type="text"
              value={(settings.subline as string) || ""}
              onChange={(val) => onUpdate("subline", val)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Full HTML/Markdown Content</label>
            <DebouncedInput
              as="textarea"
              value={(settings.content as string) || (settings.html as string) || ""}
              onChange={(val) => onUpdate(settings.html !== undefined ? "html" : "content", val)}
              className="w-full px-3 py-2 text-sm rounded-lg border min-h-[200px]"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
});

SimpleContentEditor.displayName = "SimpleContentEditor";

export default SimpleContentEditor;
