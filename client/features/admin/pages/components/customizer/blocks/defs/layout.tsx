"use client";

/**
 * Layout & structural blocks — sections, rows, columns, dividers, spacers.
 *
 * Structural entries (section/row/column) intentionally omit Runtime and
 * ContentEditor; RuntimeSectionContent special-cases them to render their
 * children only. Spacer and divider are leaf layout helpers with normal
 * runtime/editor wiring.
 */

import Divider from '../../runtime/Divider';
import Spacer from '../../runtime/Spacer';
import SimpleContentEditor from '../../editors/SimpleContentEditor';
import type { BlockDefinition } from '../types';
import { Columns, LayoutTemplate, Minus, MoveVertical, Rows } from 'lucide-react';

const layoutBlocks: BlockDefinition[] = [
  {
    type: 'section',
    label: 'Section',
    category: 'Layout',
    icon: LayoutTemplate,
    isStructural: true,
    defaultStyles: () => ({ paddingTop: 40, paddingBottom: 40 }),
  },
  {
    type: 'row',
    label: 'Row',
    category: 'Layout',
    icon: Rows,
    isStructural: true,
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
  },
  {
    type: 'column',
    label: 'Column',
    category: 'Layout',
    icon: Columns,
    isStructural: true,
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'Layout',
    icon: Minus,
    defaultSettings: () => ({ height: 1 }),
    defaultStyles: () => ({ paddingTop: 12, paddingBottom: 12 }),
    Runtime: ({ settings, styles }) => <Divider settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate }) => (
      <SimpleContentEditor section={section} onUpdate={onUpdate} />
    ),
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'Layout',
    icon: MoveVertical,
    defaultSettings: () => ({ height: 40 }),
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings }) => <Spacer settings={settings} />,
    ContentEditor: ({ section, onUpdate }) => (
      <SimpleContentEditor section={section} onUpdate={onUpdate} />
    ),
  },
];

export default layoutBlocks;
