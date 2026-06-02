"use client";

/**
 * Block registry — single source of truth for every page-builder block.
 *
 * Definitions are split by category into `./defs/<category>.tsx` so each
 * category can be scanned, edited, or extended without scrolling past
 * unrelated blocks. This file just stitches them together and builds an
 * indexed map for O(1) lookup by type.
 *
 * To add a new block:
 *   1. Add its type literal to `SectionType` in `client/types/customizer.ts`.
 *   2. Append an entry to the appropriate `defs/<category>.tsx` file
 *      (or create a new category file and import it below).
 *   3. (Optional) point Runtime at a component and ContentEditor at an editor.
 *
 * Nothing else in the codebase needs to change — the inserter, sidebar,
 * RuntimeSectionContent, and create-block helper all read from here.
 */

import type { SectionType } from '@/types/customizer';
import commerceBlocks from './defs/commerce';
import contentBlocks from './defs/content';
import layoutBlocks from './defs/layout';
import marketingBlocks from './defs/marketing';
import mediaBlocks from './defs/media';
import type { BlockDefinition } from './types';

const Definitions: BlockDefinition[] = [
  ...layoutBlocks,
  ...mediaBlocks,
  ...commerceBlocks,
  ...contentBlocks,
  ...marketingBlocks,
];

/** Indexed by type for O(1) lookup. */
export const BLOCK_DEFINITIONS: Record<SectionType, BlockDefinition> = Definitions.reduce(
  (acc, def) => {
    acc[def.type] = def;
    return acc;
  },
  {} as Record<SectionType, BlockDefinition>,
);

export const ALL_BLOCK_DEFINITIONS = Definitions;
