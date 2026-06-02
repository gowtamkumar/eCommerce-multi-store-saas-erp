import {
  STRUCTURAL_TYPES,
  createBlock,
} from '@/features/admin/pages/components/customizer/blocks';
import {
  cloneBlockWithNewIds,
  findBlockInTree,
  findParentAndIndex,
  insertRelativeTo,
  moveSibling,
  removeBlockFromTree,
  updateBlockInTree,
} from '@/features/admin/pages/lib/page-builder-tree';
import type { CustomizerSection, SectionType } from '@/types/customizer';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Centralizes every mutation the editor performs on the section tree.
 *
 * Why this hook exists:
 *  - The CustomizerEditor used to inline ~120 lines of useCallback bodies that
 *    all shared the same shape (mutate `sections`, push through `updateSections`,
 *    optionally update selection). Reading the editor meant re-reading the same
 *    pattern eight times.
 *  - All these operations need to feed history (via `updateSections`), respect
 *    structural-vs-content target rules, and keep selection coherent. Bundling
 *    them lets us guarantee that consistency in one place.
 *
 * The hook intentionally does NOT own selection state; it accepts the current
 * selected id and a setter so the parent stays the source of truth for what
 * the user is editing.
 */
interface UseEditorTreeActionsArgs {
  sections: CustomizerSection[];
  selectedId: string | null;
  setSelected: (id: string | null) => void;
  updateSections: (next: CustomizerSection[]) => void;
}

export interface EditorTreeActions {
  insertNewBlock: (type: SectionType, parentId?: string | null) => void;
  insertSavedBlock: (
    block: CustomizerSection | CustomizerSection[],
    parentId?: string | null,
  ) => void;
  duplicateById: (id: string) => void;
  removeById: (id: string) => void;
  moveByDelta: (id: string, delta: number) => void;
  toggleFlag: (id: string, flag: 'hidden' | 'locked') => void;
  copyById: (id: string) => void;
  pasteAfter: (afterId: string) => void;
  canMoveUp: (id: string) => boolean;
  canMoveDown: (id: string) => boolean;
  hasClipboard: boolean;
}

export function useEditorTreeActions({
  sections,
  selectedId,
  setSelected,
  updateSections,
}: UseEditorTreeActionsArgs): EditorTreeActions {
  const clipboardRef = useRef<CustomizerSection | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  // Shared placement rule: if a structural block (section/row/column) is
  // selected, the new block becomes its child; otherwise it sits after.
  const placeBlock = useCallback(
    (newNode: CustomizerSection, parentId?: string | null) => {
      let next: CustomizerSection[];
      if (parentId) {
        next = updateBlockInTree(sections, parentId, (b) => ({
          ...b,
          children: [...(b.children || []), newNode],
        }));
      } else if (selectedId) {
        const target = findBlockInTree(sections, selectedId);
        if (target && STRUCTURAL_TYPES.includes(target.type)) {
          next = updateBlockInTree(sections, selectedId, (b) => ({
            ...b,
            children: [...(b.children || []), newNode],
          }));
        } else if (target) {
          next = insertRelativeTo(sections, selectedId, newNode, 'after');
        } else {
          next = [...sections, newNode];
        }
      } else {
        next = [...sections, newNode];
      }
      updateSections(next);
      setSelected(newNode.id);
    },
    [sections, selectedId, setSelected, updateSections],
  );

  const insertNewBlock = useCallback(
    (type: SectionType, parentId?: string | null) => {
      const newNode = createBlock(type);
      // Structural blocks must always have a children array, even if empty,
      // so the dropzone has somewhere to land.
      if (STRUCTURAL_TYPES.includes(type) && !newNode.children) newNode.children = [];
      placeBlock(newNode, parentId);
    },
    [placeBlock],
  );

  const insertSavedBlock = useCallback(
    (block: CustomizerSection | CustomizerSection[], parentId?: string | null) => {
      const nodes = Array.isArray(block) ? block : [block];
      let inserted: string | null = null;
      let next = sections;
      for (const node of nodes) {
        const clone = cloneBlockWithNewIds(node);
        inserted = clone.id;
        if (parentId) {
          next = updateBlockInTree(next, parentId, (b) => ({
            ...b,
            children: [...(b.children || []), clone],
          }));
        } else if (selectedId) {
          const target = findBlockInTree(next, selectedId);
          if (target && STRUCTURAL_TYPES.includes(target.type)) {
            next = updateBlockInTree(next, selectedId, (b) => ({
              ...b,
              children: [...(b.children || []), clone],
            }));
          } else {
            next = insertRelativeTo(next, selectedId, clone, 'after');
          }
        } else {
          next = [...next, clone];
        }
      }
      updateSections(next);
      if (inserted) setSelected(inserted);
    },
    [sections, selectedId, setSelected, updateSections],
  );

  const duplicateById = useCallback(
    (id: string) => {
      const source = findBlockInTree(sections, id);
      if (!source) return;
      const clone = cloneBlockWithNewIds(source);
      updateSections(insertRelativeTo(sections, id, clone, 'after'));
      setSelected(clone.id);
    },
    [sections, setSelected, updateSections],
  );

  const removeById = useCallback(
    (id: string) => {
      updateSections(removeBlockFromTree(sections, id));
      if (selectedId === id) setSelected(null);
    },
    [sections, selectedId, setSelected, updateSections],
  );

  const moveByDelta = useCallback(
    (id: string, delta: number) => {
      updateSections(moveSibling(sections, id, delta));
    },
    [sections, updateSections],
  );

  const toggleFlag = useCallback(
    (id: string, flag: 'hidden' | 'locked') => {
      updateSections(updateBlockInTree(sections, id, (b) => ({ ...b, [flag]: !b[flag] })));
    },
    [sections, updateSections],
  );

  const copyById = useCallback(
    (id: string) => {
      const source = findBlockInTree(sections, id);
      if (!source) return;
      // Snapshot, not reference — paste must keep working after the source
      // block is deleted or mutated.
      clipboardRef.current = source;
      setHasClipboard(true);
      toast.success('Copied');
    },
    [sections],
  );

  const pasteAfter = useCallback(
    (afterId: string) => {
      if (!clipboardRef.current) return;
      const clone = cloneBlockWithNewIds(clipboardRef.current);
      updateSections(insertRelativeTo(sections, afterId, clone, 'after'));
      setSelected(clone.id);
    },
    [sections, setSelected, updateSections],
  );

  const canMoveUp = useCallback(
    (id: string) => {
      const loc = findParentAndIndex(sections, id);
      return !!loc && loc.index > 0;
    },
    [sections],
  );

  const canMoveDown = useCallback(
    (id: string) => {
      const loc = findParentAndIndex(sections, id);
      return !!loc && loc.index < loc.siblings.length - 1;
    },
    [sections],
  );

  return {
    insertNewBlock,
    insertSavedBlock,
    duplicateById,
    removeById,
    moveByDelta,
    toggleFlag,
    copyById,
    pasteAfter,
    canMoveUp,
    canMoveDown,
    hasClipboard,
  };
}
