import {
  STRUCTURAL_TYPES,
} from '@/features/admin/pages/components/customizer/blocks';
import {
  findBlockInTree,
  isDescendantOf,
  removeBlockFromTree,
  updateBlockInTree,
} from '@/features/admin/pages/lib/page-builder-tree';
import type { CustomizerSection } from '@/types/customizer';
import type {
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { useCallback, useState } from 'react';

interface UseTreeDndArgs {
  sections: CustomizerSection[];
  onUpdate: (next: CustomizerSection[]) => void;
}

interface UseTreeDndReturn {
  activeDragId: string | null;
  overId: string | null;
  onDragStart: (e: DragStartEvent) => void;
  onDragOver: (e: DragOverEvent) => void;
  onDragCancel: (e: DragCancelEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
}

/**
 * Wires up dnd-kit lifecycle handlers for the layers tree.
 *
 * The drop rule is intentionally simple:
 *  - dropping onto a structural block (section / row / column) appends to
 *    its children;
 *  - dropping onto a leaf block inserts before that block in its parent;
 *  - dropping onto a descendant of yourself is a no-op (would create a cycle).
 *
 * Internal handlers also reset their own active/over state on cancel and
 * after a successful drop so the visual indicator never sticks.
 */
export function useTreeDnd({ sections, onUpdate }: UseTreeDndArgs): UseTreeDndReturn {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const onDragStart = useCallback((e: DragStartEvent) => {
    setActiveDragId(String(e.active.id));
  }, []);

  const onDragOver = useCallback((e: DragOverEvent) => {
    setOverId(e.over?.id != null ? String(e.over.id) : null);
  }, []);

  const onDragCancel = useCallback((_e: DragCancelEvent) => {
    setActiveDragId(null);
    setOverId(null);
  }, []);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      setActiveDragId(null);
      setOverId(null);
      if (!over) return;
      if (active.id === over.id) return;

      const activeId = String(active.id);
      const targetId = String(over.id);
      const sourceNode = findBlockInTree(sections, activeId);
      const targetNode = findBlockInTree(sections, targetId);
      if (!sourceNode || !targetNode) return;
      // Prevent dragging a parent into itself.
      if (isDescendantOf(sections, activeId, targetNode.id)) return;

      let next = removeBlockFromTree(sections, activeId);

      if (STRUCTURAL_TYPES.includes(targetNode.type)) {
        next = updateBlockInTree(next, targetNode.id, (block) => ({
          ...block,
          children: [...(block.children || []), sourceNode],
        }));
        onUpdate(next);
        return;
      }

      // For non-structural targets, insert immediately BEFORE the target
      // wherever it lives in the tree. We have to recurse because the
      // target might be nested inside a section/row/column.
      const insertBefore = (blocks: CustomizerSection[]): CustomizerSection[] => {
        const idx = blocks.findIndex((b) => b.id === targetNode.id);
        if (idx !== -1) {
          const out = [...blocks];
          out.splice(idx, 0, sourceNode);
          return out;
        }
        return blocks.map((b) =>
          b.children ? { ...b, children: insertBefore(b.children) } : b,
        );
      };

      onUpdate(insertBefore(next));
    },
    [sections, onUpdate],
  );

  return {
    activeDragId,
    overId,
    onDragStart,
    onDragOver,
    onDragCancel,
    onDragEnd,
  };
}
