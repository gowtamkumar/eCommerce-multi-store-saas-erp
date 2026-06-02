import type { CustomizerSection, SectionType } from '@/types/customizer';
import { BLOCK_DEFINITIONS } from './definitions';

let counter = 0;
function nextId(type: string): string {
  counter += 1;
  return `${type}-${Date.now().toString(36)}-${counter}`;
}

/**
 * Single entry point for creating a new section.
 *
 * - Pulls defaults from the block definition registry.
 * - For structural types, seeds reasonable children where it makes sense
 *   (a fresh row gets one column, a fresh section gets one row + column).
 */
export function createBlock(
  type: SectionType,
  options: { seedChildren?: boolean } = {},
): CustomizerSection {
  const def = BLOCK_DEFINITIONS[type];
  const settings = def?.defaultSettings ? def.defaultSettings() : {};
  const styles = def?.defaultStyles ? def.defaultStyles() : { paddingTop: 0, paddingBottom: 0 };

  const block: CustomizerSection = {
    id: nextId(type),
    type,
    settings,
    styles,
    visibility: { desktop: true, tablet: true, mobile: true },
  };

  if (options.seedChildren) {
    if (type === 'section') {
      block.children = [createBlock('row', { seedChildren: true })];
    } else if (type === 'row') {
      block.children = [createBlock('column')];
    }
  }

  return block;
}

export function createBlockId(prefix = 'block'): string {
  return nextId(prefix);
}
