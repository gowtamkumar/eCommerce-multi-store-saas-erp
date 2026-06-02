"use client";

/**
 * Unified style editor for every block type.
 *
 * This file used to be a 700-line component that conditionally rendered
 * 11 different `<Group>` blocks based on `caps.X` flags. It's now a thin
 * composer: each conceptual chunk lives in its own file under
 * `style-inspector/` and is conditionally rendered here based on the
 * block's capabilities.
 *
 * Adding a new style group:
 *   1. Drop a new component in `./style-inspector/`.
 *   2. Import it below and render it inside the matching capability check.
 */

import BackgroundGroup from './style-inspector/BackgroundGroup';
import BlockSpecificGroups from './style-inspector/BlockSpecificGroups';
import LayoutPresetPicker from './style-inspector/LayoutPresetPicker';
import SizingGroups from './style-inspector/SizingGroups';
import StructuralGroups, {
  AnimationGroup,
} from './style-inspector/StructuralGroups';
import TypographyGroup from './style-inspector/TypographyGroup';
import VisualEffectsGroups from './style-inspector/VisualEffectsGroups';
import { capabilitiesFor } from './style-inspector/capabilities';
import type { LooseRecord, StyleChange } from './style-inspector/types';
import { useResponsiveStyle, type ViewMode } from './style-controls';

interface StyleInspectorProps {
  styles: LooseRecord;
  onChange: StyleChange;
  onBatchChange?: (updates: LooseRecord) => void;
  viewMode: ViewMode;
  nodeType: string;
}

export default function StyleInspector({
  styles,
  onChange,
  onBatchChange,
  viewMode,
  nodeType,
}: StyleInspectorProps) {
  const s = styles || {};
  const caps = capabilitiesFor(nodeType);
  const { read, write } = useResponsiveStyle(s, viewMode, onChange);

  return (
    <div className="space-y-2 pb-8">
      {caps.isRow && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 mb-3">
          <LayoutPresetPicker
            styles={s}
            onChange={onChange}
            onBatchChange={onBatchChange}
            viewMode={viewMode}
          />
        </div>
      )}

      {caps.isStructural && (
        <StructuralGroups
          styles={s}
          onChange={onChange}
          read={read}
          write={write}
          viewMode={viewMode}
        />
      )}

      <SizingGroups
        styles={s}
        onChange={onChange}
        read={read}
        write={write}
        viewMode={viewMode}
        spacingDefaultOpen={!caps.isStructural}
      />

      <BlockSpecificGroups styles={s} onChange={onChange} caps={caps} />

      {!caps.omitTypography && (
        <TypographyGroup
          styles={s}
          onChange={onChange}
          read={read}
          write={write}
          viewMode={viewMode}
        />
      )}

      <BackgroundGroup styles={s} onChange={onChange} />

      <VisualEffectsGroups
        styles={s}
        onChange={onChange}
        showBorder={!caps.omitBorder}
        showEffects={!caps.omitEffects}
      />

      {caps.isStructural && <AnimationGroup styles={s} onChange={onChange} />}
    </div>
  );
}
