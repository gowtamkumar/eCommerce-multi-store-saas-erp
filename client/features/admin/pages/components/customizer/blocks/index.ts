export { BLOCK_DEFINITIONS, ALL_BLOCK_DEFINITIONS } from './definitions';
export { createBlock, createBlockId } from './create-block';
export type {
  BlockDefinition,
  ContentEditorProps,
  EditorResources,
  RuntimeProps,
  SectionCategory,
} from './types';

import type { SectionType } from '@/types/customizer';
import { BLOCK_DEFINITIONS } from './definitions';

export function getBlockDefinition(type: SectionType) {
  return BLOCK_DEFINITIONS[type] ?? BLOCK_DEFINITIONS['text-block'];
}

export const STRUCTURAL_TYPES: SectionType[] = Object.values(BLOCK_DEFINITIONS)
  .filter((d) => d.isStructural)
  .map((d) => d.type);

export const CONTENT_TYPES: SectionType[] = Object.values(BLOCK_DEFINITIONS)
  .filter((d) => !d.isStructural)
  .map((d) => d.type);

export function isStructuralType(type: SectionType): boolean {
  return BLOCK_DEFINITIONS[type]?.isStructural === true;
}
