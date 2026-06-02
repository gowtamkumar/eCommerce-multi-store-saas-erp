"use client";

import { useEditorShortcuts } from '@/features/admin/pages/components/customizer/hooks/useEditorShortcuts';
import { useEditorTreeActions } from '@/features/admin/pages/components/customizer/hooks/useEditorTreeActions';
import { usePageEditorState } from '@/features/admin/pages/components/customizer/hooks/usePageEditorState';
import { useRecentBlocks } from '@/features/admin/pages/components/customizer/hooks/useRecentBlocks';
import {
  findBlockInTree,
  updateBlockInTree,
} from '@/features/admin/pages/lib/page-builder-tree';
import { getPagePublicPath, normalizePageSlugForSave } from '@/lib/page-url';
import { themeTokensToCss } from '@/features/admin/pages/lib/theme-tokens-css';
import { fetchAPI } from '@/services/api';
import { CustomizerSection, PageData, ThemeTokens } from '@/types/customizer';
import { Layout, Settings, Bookmark, Layers, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { EditorActions, EditorActionsContext } from './EditorActionsContext';
import BlockInserter from './panels/BlockInserter';
import CanvasContextMenu, { ContextMenuPosition } from './panels/CanvasContextMenu';
import EditorHeader, { ViewMode } from './panels/EditorHeader';
import PagePreviewFrame from './panels/PagePreviewFrame';
import PageSettings from './panels/PageSettings';
import SettingsPanel from './panels/SettingsPanel';
import Sidebar from './panels/Sidebar';

interface CustomizerEditorProps {
  pageId: string;
  initialData: PageData;
  themeTokens?: ThemeTokens | null;
}

export default function CustomizerEditor({ pageId, initialData, themeTokens }: CustomizerEditorProps) {
  const router = useRouter();
  const {
    data,
    setData,
    saveStatus,
    isDirty,
    undo,
    redo,
    canUndo,
    canRedo,
    markSaving,
    markSaved,
    markSaveFailed,
  } = usePageEditorState(initialData);

  const [activeTab, setActiveTab] = useState<'sections' | 'settings'>('sections');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [showInserter, setShowInserter] = useState(false);
  const [inserterQuery, setInserterQuery] = useState('');
  const { recent, push: pushRecent } = useRecentBlocks();
  const [saveTemplateModal, setSaveTemplateModal] = useState<{
    isOpen: boolean;
    sections: CustomizerSection[];
    defaultName: string;
  }>({
    isOpen: false,
    sections: [],
    defaultName: '',
  });

  const sections = data.content.sections;

  const updateSections = useCallback(
    (next: CustomizerSection[]) => {
      setData((prev) => ({ ...prev, content: { ...prev.content, sections: next } }), {
        commit: true,
      });
    },
    [setData],
  );

  const tree = useEditorTreeActions({
    sections,
    selectedId: selectedSectionId,
    setSelected: setSelectedSectionId,
    updateSections,
  });

  // Wrap insertNewBlock so the recent-blocks history captures every insert,
  // including those from the slash command palette and the layers sidebar.
  const insertNewBlockWithRecent = useCallback<typeof tree.insertNewBlock>(
    (type, parentId) => {
      tree.insertNewBlock(type, parentId);
      pushRecent(type);
    },
    [tree, pushRecent],
  );

  const editorActions: EditorActions = useMemo(
    () => ({
      duplicate: tree.duplicateById,
      remove: tree.removeById,
      moveUp: (id) => tree.moveByDelta(id, -1),
      moveDown: (id) => tree.moveByDelta(id, 1),
      toggleHidden: (id) => tree.toggleFlag(id, 'hidden'),
      toggleLocked: (id) => tree.toggleFlag(id, 'locked'),
      copy: tree.copyById,
      paste: tree.pasteAfter,
      canPaste: tree.hasClipboard,
      canMoveUp: tree.canMoveUp,
      canMoveDown: tree.canMoveDown,
      openContextMenu: (id, e) => setContextMenu({ x: e.clientX, y: e.clientY, sectionId: id }),
    }),
    [tree],
  );

  // Warn on tab close when there are unsaved edits.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const handleSave = useCallback(async () => {
    markSaving();
    try {
      const isNewPage = pageId === 'new';
      const slug = normalizePageSlugForSave(data.slug, data.isHomePage);
      const payload = {
        title: data.title,
        slug,
        isHomePage: data.isHomePage,
        sections: data.content.sections,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImage: data.ogImage,
        publishAt: data.publishAt ?? null,
        status: data.status,
        typography: data.typography,
      };

      if (isNewPage) {
        const response = await fetchAPI('/pages', { method: 'POST', body: JSON.stringify(payload) });
        if (!response?.success) throw new Error(response?.message || 'Failed to create page');
        toast.success('Page created');
        markSaved({ ...data, id: response.data?.id, slug });
        if (response?.data?.id) router.replace(`/admin/pages/${response.data.id}`);
      } else {
        const response = await fetchAPI(`/pages/${pageId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (!response?.success) throw new Error(response?.message || 'Failed to save page');
        toast.success('Saved');
        markSaved({ ...data, slug });
      }
    } catch (error: unknown) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save page';
      toast.error(message);
      markSaveFailed();
    }
  }, [data, markSaveFailed, markSaved, markSaving, pageId, router]);

  const openInserter = useCallback(() => {
    setInserterQuery('');
    setShowInserter(true);
  }, []);
  const closeInserter = useCallback(() => setShowInserter(false), []);
  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  const clearSelection = useCallback(() => setSelectedSectionId(null), []);

  useEditorShortcuts({
    selectedId: selectedSectionId,
    showInserter,
    hasContextMenu: !!contextMenu,
    onSave: handleSave,
    onUndo: undo,
    onRedo: redo,
    onOpenInserter: openInserter,
    onCloseInserter: closeInserter,
    onCloseContextMenu: closeContextMenu,
    onClearSelection: clearSelection,
    onRemove: tree.removeById,
    onDuplicate: tree.duplicateById,
    onCopy: tree.copyById,
    onPaste: tree.pasteAfter,
    onMove: tree.moveByDelta,
  });

  const selectedSection = selectedSectionId
    ? findBlockInTree(data.content.sections, selectedSectionId) ?? undefined
    : undefined;

  const handleClosePanel = useCallback(() => setSelectedSectionId(null), []);
  const handleUpdateSection = useCallback(
    (updated: CustomizerSection) => {
      setData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          sections: updateBlockInTree(prev.content.sections, updated.id, () => updated),
        },
      }));
    },
    [setData],
  );

  const previewPath = getPagePublicPath(data);
  const themeCss = useMemo(() => themeTokensToCss(themeTokens), [themeTokens]);
  const contextMenuSection = contextMenu ? findBlockInTree(sections, contextMenu.sectionId) : null;

  return (
    <EditorActionsContext.Provider value={editorActions}>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
        <EditorHeader
          title={data.title}
          isDirty={isDirty}
          saveStatus={saveStatus}
          hasSchedule={!!data.publishAt}
          canUndo={canUndo}
          canRedo={canRedo}
          viewMode={viewMode}
          previewPath={previewPath}
          onUndo={undo}
          onRedo={redo}
          onViewModeChange={setViewMode}
          onSave={handleSave}
        />

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'sections'
                    ? 'text-brand-600 border-b-2 border-brand-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Layout className="w-4 h-4" />
                Layers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'text-brand-600 border-b-2 border-brand-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Page Settings
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'sections' ? (
                <Sidebar
                  sections={data.content.sections}
                  selectedId={selectedSectionId}
                  onSelect={setSelectedSectionId}
                  onUpdate={updateSections}
                  pushRecent={pushRecent}
                  recentTypes={recent}
                />
              ) : (
                <PageSettings
                  data={data}
                  onUpdate={setData}
                  pageId={pageId}
                  onSaveTemplate={useCallback(() => {
                    setSaveTemplateModal({
                      isOpen: true,
                      sections: data.content.sections,
                      defaultName: data.title || 'My Template',
                    });
                  }, [data.content.sections, data.title])}
                />
              )}
            </div>
          </aside>

          <main className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center overflow-hidden">
            <PagePreviewFrame
              sections={data.content.sections}
              viewMode={viewMode}
              selectedId={selectedSectionId}
              onSelect={setSelectedSectionId}
              typography={data.typography}
            />
          </main>

          <aside
            className={`w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto transition-transform ${
              selectedSectionId ? 'translate-x-0' : 'translate-x-full absolute right-0'
            }`}
          >
            {selectedSection && (
              <SettingsPanel
                section={selectedSection}
                allSections={data.content.sections}
                viewMode={viewMode}
                onClose={handleClosePanel}
                onUpdate={handleUpdateSection}
              />
            )}
          </aside>
        </div>
      </div>

      {/* Slash command palette */}
      {showInserter && (
        <div
          className="fixed inset-0 z-200 flex items-start justify-center pt-32 bg-slate-900/40"
          onClick={() => setShowInserter(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <BlockInserter
              query={inserterQuery}
              recent={recent}
              onSelect={(type) => {
                insertNewBlockWithRecent(type);
                setShowInserter(false);
              }}
              onSelectSaved={(block) => {
                tree.insertSavedBlock(block);
                setShowInserter(false);
              }}
              onClose={() => setShowInserter(false)}
              layout="menu"
            />
          </div>
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && contextMenuSection && (
        <CanvasContextMenu
          position={contextMenu}
          section={contextMenuSection}
          canPaste={tree.hasClipboard}
          onClose={() => setContextMenu(null)}
          onDuplicate={() => {
            tree.duplicateById(contextMenu.sectionId);
            setContextMenu(null);
          }}
          onCopy={() => {
            tree.copyById(contextMenu.sectionId);
            setContextMenu(null);
          }}
          onPaste={() => {
            tree.pasteAfter(contextMenu.sectionId);
            setContextMenu(null);
          }}
          onDelete={() => {
            tree.removeById(contextMenu.sectionId);
            setContextMenu(null);
          }}
          onMoveUp={() => {
            tree.moveByDelta(contextMenu.sectionId, -1);
            setContextMenu(null);
          }}
          onMoveDown={() => {
            tree.moveByDelta(contextMenu.sectionId, 1);
            setContextMenu(null);
          }}
          onToggleHidden={() => {
            tree.toggleFlag(contextMenu.sectionId, 'hidden');
            setContextMenu(null);
          }}
          onToggleLocked={() => {
            tree.toggleFlag(contextMenu.sectionId, 'locked');
            setContextMenu(null);
          }}
          onInsertChild={() => {
            setSelectedSectionId(contextMenu.sectionId);
            setContextMenu(null);
            setInserterQuery('');
            setShowInserter(true);
          }}
          onSaveReusable={() => {
            if (contextMenuSection) {
              setSaveTemplateModal({
                isOpen: true,
                sections: [contextMenuSection],
                defaultName: contextMenuSection.name || contextMenuSection.type,
              });
            }
            setContextMenu(null);
          }}
        />
      )}

      {/* Save Template Modal */}
      {saveTemplateModal.isOpen && (
        <TemplateSaveModal
          sections={saveTemplateModal.sections}
          defaultName={saveTemplateModal.defaultName}
          onClose={() => setSaveTemplateModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </EditorActionsContext.Provider>
  );
}

interface TemplateSaveModalProps {
  sections: CustomizerSection[];
  defaultName: string;
  onClose: () => void;
}

function TemplateSaveModal({ sections, defaultName, onClose }: TemplateSaveModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(`Saved template block`);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetchAPI('/pages/reusable-blocks', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category: 'block',
          payload: sections,
        }),
      });

      if (res?.success) {
        toast.success('Template saved to library successfully!');
        onClose();
      } else {
        toast.error(res?.message || 'Failed to save template');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 transform transition-all scale-100 opacity-100 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-brand-500">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Save Section Template</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Reusable Library</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label htmlFor="modal-template-name" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Template Name
              </label>
              <input
                id="modal-template-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hero Banner with Features"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="modal-template-desc" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Description
              </label>
              <textarea
                id="modal-template-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this template layout is used for..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
              />
            </div>

            <div className="flex gap-2.5 p-3.5 bg-brand-50/50 dark:bg-brand-950/10 rounded-xl border border-brand-100/30">
              <AlertCircle className="w-4.5 h-4.5 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                This saves the selected layout sections as a reusable template. You can drag and drop it into other pages from the <strong>Saved</strong> tab in the Block Library.
              </p>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 flex justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-95 rounded-xl shadow-lg shadow-brand-500/10 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isSaving ? 'Saving Template...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
