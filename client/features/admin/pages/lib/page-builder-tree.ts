import { CustomizerSection, SectionType } from '@/types/customizer';

export function generateBlockId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `block-${crypto.randomUUID()}`;
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function findBlockInTree(blocks: CustomizerSection[], id: string): CustomizerSection | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockInTree(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function isDescendantOf(blocks: CustomizerSection[], ancestorId: string, nodeId: string): boolean {
  const ancestor = findBlockInTree(blocks, ancestorId);
  if (!ancestor?.children?.length) return false;
  return Boolean(findBlockInTree(ancestor.children, nodeId));
}

export function updateBlockInTree(
  blocks: CustomizerSection[],
  targetId: string,
  updateFn: (block: CustomizerSection) => CustomizerSection | null,
): CustomizerSection[] {
  return blocks
    .map((block) => {
      if (block.id === targetId) {
        const updated = updateFn(block);
        return updated === null ? null : updated;
      }
      if (block.children) {
        const newChildren = updateBlockInTree(block.children, targetId, updateFn).filter(
          Boolean,
        ) as CustomizerSection[];
        return { ...block, children: newChildren };
      }
      return block;
    })
    .filter(Boolean) as CustomizerSection[];
}

export function removeBlockFromTree(blocks: CustomizerSection[], idToRemove: string): CustomizerSection[] {
  return blocks
    .filter((block) => block.id !== idToRemove)
    .map((block) => {
      if (!block.children?.length) return block;
      return { ...block, children: removeBlockFromTree(block.children, idToRemove) };
    });
}

export function cloneBlockWithNewIds(block: CustomizerSection): CustomizerSection {
  return {
    ...block,
    id: generateBlockId(),
    settings: block.settings ? JSON.parse(JSON.stringify(block.settings)) : {},
    styles: block.styles ? { ...block.styles } : block.styles,
    children: block.children?.map((child) => cloneBlockWithNewIds(child)),
  };
}

export function flattenTree(blocks: CustomizerSection[]): CustomizerSection[] {
  let flat: CustomizerSection[] = [];
  blocks.forEach((block) => {
    flat.push(block);
    if (block.children) flat = [...flat, ...flattenTree(block.children)];
  });
  return flat;
}

export function getSectionLabel(type: SectionType): string {
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function findPathToBlock(
  blocks: CustomizerSection[],
  targetId: string,
  path: CustomizerSection[] = [],
): CustomizerSection[] | null {
  for (const block of blocks) {
    const nextPath = [...path, block];
    if (block.id === targetId) return nextPath;
    if (block.children?.length) {
      const found = findPathToBlock(block.children, targetId, nextPath);
      if (found) return found;
    }
  }
  return null;
}

/** Find parent + index of a node id within the tree, or null if root-level. */
export function findParentAndIndex(
  blocks: CustomizerSection[],
  targetId: string,
  parent: CustomizerSection | null = null,
): { parent: CustomizerSection | null; siblings: CustomizerSection[]; index: number } | null {
  const idx = blocks.findIndex((b) => b.id === targetId);
  if (idx !== -1) return { parent, siblings: blocks, index: idx };
  for (const block of blocks) {
    if (block.children?.length) {
      const found = findParentAndIndex(block.children, targetId, block);
      if (found) return found;
    }
  }
  return null;
}

/** Move a node within its sibling list by delta (+1 / -1). */
export function moveSibling(
  blocks: CustomizerSection[],
  targetId: string,
  delta: number,
): CustomizerSection[] {
  const location = findParentAndIndex(blocks, targetId);
  if (!location) return blocks;
  const { parent, siblings, index } = location;
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex >= siblings.length) return blocks;
  const reordered = [...siblings];
  const [item] = reordered.splice(index, 1);
  reordered.splice(newIndex, 0, item);
  if (!parent) return reordered;
  return updateBlockInTree(blocks, parent.id, (b) => ({ ...b, children: reordered }));
}

/** Insert a node at root-end (or inside a parent). */
export function appendBlock(
  blocks: CustomizerSection[],
  node: CustomizerSection,
  parentId?: string | null,
): CustomizerSection[] {
  if (!parentId) return [...blocks, node];
  return updateBlockInTree(blocks, parentId, (b) => ({
    ...b,
    children: [...(b.children || []), node],
  }));
}

/** Insert a node before/after a sibling id. */
export function insertRelativeTo(
  blocks: CustomizerSection[],
  siblingId: string,
  node: CustomizerSection,
  position: 'before' | 'after',
): CustomizerSection[] {
  const location = findParentAndIndex(blocks, siblingId);
  if (!location) return [...blocks, node];
  const { parent, siblings, index } = location;
  const insertAt = position === 'after' ? index + 1 : index;
  const reordered = [...siblings];
  reordered.splice(insertAt, 0, node);
  if (!parent) return reordered;
  return updateBlockInTree(blocks, parent.id, (b) => ({ ...b, children: reordered }));
}
