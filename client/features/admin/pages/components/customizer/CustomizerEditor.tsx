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
import { Layout, Settings } from 'lucide-react';
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
                <PageSettings data={data} onUpdate={setData} pageId={pageId} />
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
        />
      )}
    </EditorActionsContext.Provider>
  );
}
