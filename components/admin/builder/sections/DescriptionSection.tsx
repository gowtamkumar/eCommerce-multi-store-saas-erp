
'use client';

import { Bold, Code, Italic, Link as LinkIcon, List, ListOrdered, Type, Underline } from 'lucide-react';
import { useRef } from 'react';

interface DescriptionSectionProps {
    content: any;
    onChange: (content: any) => void;
}

export default function DescriptionSection({ content, onChange }: DescriptionSectionProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange({ ...content, html: editorRef.current.innerHTML });
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange({ ...content, html: editorRef.current.innerHTML });
        }
    };

    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description Content</label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Bold"><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Italic"><Italic className="w-4 h-4" /></button>
                    <button type="button" onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Underline"><Underline className="w-4 h-4" /></button>
                    <div className="w-px bg-slate-300 dark:bg-slate-500 mx-1"></div>
                    <button type="button" onClick={() => applyFormat('formatBlock', '<h2>')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Heading"><Type className="w-4 h-4" /></button>
                    <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Bullet List"><List className="w-4 h-4" /></button>
                    <button type="button" onClick={() => applyFormat('insertOrderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                    <div className="w-px bg-slate-300 dark:bg-slate-500 mx-1"></div>
                    <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) applyFormat('createLink', url); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Link"><LinkIcon className="w-4 h-4" /></button>
                    <button type="button" onClick={() => applyFormat('formatBlock', '<pre>')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Code"><Code className="w-4 h-4" /></button>
                </div>

                {/* Editor Area */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    dangerouslySetInnerHTML={{ __html: content.html || '' }}
                    className="w-full min-h-[150px] p-4 outline-none prose prose-sm dark:prose-invert max-w-none"
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
        </div>
    );
}
