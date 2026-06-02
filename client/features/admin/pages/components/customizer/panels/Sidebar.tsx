import {
  STRUCTURAL_TYPES,
  createBlock,
  getBlockDefinition,
  isStructuralType,
} from '@/features/admin/pages/components/customizer/blocks';
import { useTreeDnd } from '@/features/admin/pages/components/customizer/hooks/useTreeDnd';
import {
  cloneBlockWithNewIds,
  findBlockInTree,
  flattenTree,
  getSectionLabel,
  removeBlockFromTree,
  updateBlockInTree,
} from '@/features/admin/pages/lib/page-builder-tree';
import type { CustomizerSection, SectionType } from '@/types/customizer';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useRecentBlocks } from '../hooks/useRecentBlocks';
import ComponentInsertModal from './sidebar/ComponentInsertModal';
import LibraryPanel from './sidebar/LibraryPanel';
import SortableSectionItem from './sidebar/SortableSectionItem';

interface SidebarProps {
  sections: CustomizerSection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (sections: CustomizerSection[]) => void;
  /** Tracks recently inserted block types for the inserter panel. */
  pushRecent?: (type: SectionType) => void;
  recentTypes?: SectionType[];
}

/**
 * Left-rail layers panel. Owns the tree node interactions (add / duplicate /
 * toggle / delete) and the library panel, but delegates rendering of each
 * node to SortableSectionItem and drag wiring to useTreeDnd.
 *
 * NOTE: We re-implement insert / toggle / delete here rather than reusing
 * useEditorTreeActions because the Sidebar is given a generic `onUpdate`
 * callback. Pulling the actions through `onUpdate` keeps Sidebar usable
 * outside the editor context (preview, future templating UI).
 */
const Sidebar = React.memo(function Sidebar({
  sections,
  selectedId,
  onSelect,
  onUpdate,
  pushRecent,
  recentTypes,
}: SidebarProps) {
  const [modalTargetId, setModalTargetId] = useState<string | null>(null);
  const fallbackRecent = useRecentBlocks();
  const recent = recentTypes ?? fallbackRecent.recent;
  const recordRecent = (type: SectionType) => {
    if (pushRecent) pushRecent(type);
    else fallbackRecent.push(type);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { activeDragId, overId, onDragStart, onDragOver, onDragCancel, onDragEnd } = useTreeDnd({
    sections,
    onUpdate,
  });

  const addNode = (type: SectionType, parentId: string | null = null) => {
    const newNode = createBlock(type);
    if (isStructuralType(type) && !newNode.children) newNode.children = [];

    if (parentId) {
      onUpdate(
        updateBlockInTree(sections, parentId, (block) => ({
          ...block,
          children: [...(block.children || []), newNode],
        })),
      );
    } else {
      onUpdate([...sections, newNode]);
    }

    recordRecent(type);
    onSelect(newNode.id);
  };

  const toggleHidden = (id: string) =>
    onUpdate(updateBlockInTree(sections, id, (b) => ({ ...b, hidden: !b.hidden })));

  const toggleLocked = (id: string) =>
    onUpdate(updateBlockInTree(sections, id, (b) => ({ ...b, locked: !b.locked })));

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(removeBlockFromTree(sections, id));
    if (selectedId === id) onSelect(null);
  };

  const duplicateNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = findBlockInTree(sections, id);
    if (!source) return;
    const clone = cloneBlockWithNewIds(source);

    // Insert the clone immediately after its source wherever it sits.
    const insertAfter = (blocks: CustomizerSection[]): CustomizerSection[] => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx !== -1) {
        const next = [...blocks];
        next.splice(idx + 1, 0, clone);
        return next;
      }
      return blocks.map((b) =>
        b.children?.length ? { ...b, children: insertAfter(b.children) } : b,
      );
    };

    onUpdate(insertAfter(sections));
    onSelect(clone.id);
  };

  const flatBlocks = useMemo(() => flattenTree(sections), [sections]);
  const activeDragNode = activeDragId ? flatBlocks.find((b) => b.id === activeDragId) : null;

  // Determine where a library/saved-block click should land: into the
  // selected structural block when applicable, otherwise at the root.
  const insertSavedBlocks = (block: CustomizerSection | CustomizerSection[]) => {
    const nodes = Array.isArray(block) ? block : [block];
    const clones = nodes.map((n) => cloneBlockWithNewIds(n));
    const selectedBlock = selectedId ? flatBlocks.find((b) => b.id === selectedId) : null;
    if (selectedBlock && STRUCTURAL_TYPES.includes(selectedBlock.type) && selectedId) {
      onUpdate(
        updateBlockInTree(sections, selectedId, (b) => ({
          ...b,
          children: [...(b.children || []), ...clones],
        })),
      );
    } else {
      onUpdate([...sections, ...clones]);
    }
    if (clones[0]) onSelect(clones[0].id);
  };

  const handleLibrarySelect = (type: SectionType) => {
    const selectedBlock = selectedId ? flatBlocks.find((b) => b.id === selectedId) : null;
    if (selectedBlock && STRUCTURAL_TYPES.includes(selectedBlock.type)) {
      addNode(type, selectedId);
    } else {
      addNode(type);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1 mb-4 select-none">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragCancel={onDragCancel}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={flatBlocks.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={deleteNode}
                onDuplicate={duplicateNode}
                onToggleHidden={toggleHidden}
                onToggleLocked={toggleLocked}
                onAddChild={(parentId, type) => addNode(type, parentId)}
                onOpenComponentModal={setModalTargetId}
                overId={overId}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeDragNode ? (
              <div className="bg-white border-2 border-brand-500 shadow-xl p-2 rounded-lg opacity-80 flex items-center gap-2">
                {(() => {
                  const Icon = getBlockDefinition(activeDragNode.type).icon;
                  return <Icon className="w-4 h-4 text-brand-500" />;
                })()}
                <span className="text-xs font-bold text-brand-700">
                  {getSectionLabel(activeDragNode.type)}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {sections.length === 0 && (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              No nodes added
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Start by adding a layout section</p>
          </div>
        )}
      </div>

      <LibraryPanel
        recent={recent}
        onSelect={handleLibrarySelect}
        onSelectSaved={insertSavedBlocks}
      />

      {modalTargetId && (
        <ComponentInsertModal
          parentId={modalTargetId}
          recent={recent}
          onInsert={(parent, type) => addNode(type, parent)}
          onClose={() => setModalTargetId(null)}
        />
      )}
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
