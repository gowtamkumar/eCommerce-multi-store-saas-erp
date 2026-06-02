import {
  Group,
  InputRow,
  NumberInput,
  Select,
  TextInput,
} from '../style-controls';
import type { GroupProps } from './types';

/**
 * Layout primitives that only make sense on structural blocks
 * (section / row / column): box positioning, flexbox, grid, and the
 * transition/transform pair.
 *
 * Combined into one file because every consumer either shows ALL of these
 * (structural blocks) or NONE of them (content blocks); splitting them
 * further wouldn't reduce code that lives in any one render path.
 */
export default function StructuralGroups({ styles: s, onChange, read, write, viewMode }: GroupProps) {
  return (
    <>
      <Group title="Layout" emoji="📐" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <InputRow label="Display" isResponsive viewMode={viewMode}>
            <Select
              value={read('display')}
              onChange={(v) => write('display', v)}
              options={[
                { value: 'block', label: 'Block' },
                { value: 'flex', label: 'Flex' },
                { value: 'grid', label: 'Grid' },
                { value: 'inline-block', label: 'Inline Block' },
                { value: 'inline-flex', label: 'Inline Flex' },
                { value: 'none', label: 'None' },
              ]}
            />
          </InputRow>
          <InputRow label="Position">
            <Select
              value={s.position}
              onChange={(v) => onChange('position', v)}
              options={[
                { value: 'static', label: 'Static' },
                { value: 'relative', label: 'Relative' },
                { value: 'absolute', label: 'Absolute' },
                { value: 'fixed', label: 'Fixed' },
                { value: 'sticky', label: 'Sticky' },
              ]}
            />
          </InputRow>
          <InputRow label="Overflow">
            <Select
              value={s.overflow}
              onChange={(v) => onChange('overflow', v)}
              options={[
                { value: 'visible', label: 'Visible' },
                { value: 'hidden', label: 'Hidden' },
                { value: 'scroll', label: 'Scroll' },
                { value: 'auto', label: 'Auto' },
              ]}
            />
          </InputRow>
          <InputRow label="Z-Index">
            <TextInput
              value={s.zIndex}
              onChange={(v) => onChange('zIndex', v)}
              placeholder="0"
            />
          </InputRow>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <InputRow key={side} label={side[0].toUpperCase() + side.slice(1)}>
              <NumberInput value={s[side]} onChange={(v) => onChange(side, v)} />
            </InputRow>
          ))}
        </div>
      </Group>

      <Group title="Flexbox" emoji="🔀">
        <div className="grid grid-cols-2 gap-2">
          <InputRow label="Direction" isResponsive viewMode={viewMode}>
            <Select
              value={read('flexDirection')}
              onChange={(v) => write('flexDirection', v)}
              options={[
                { value: 'row', label: 'Row →' },
                { value: 'row-reverse', label: 'Row ←' },
                { value: 'column', label: 'Column ↓' },
                { value: 'column-reverse', label: 'Column ↑' },
              ]}
            />
          </InputRow>
          <InputRow label="Wrap">
            <Select
              value={s.flexWrap}
              onChange={(v) => onChange('flexWrap', v)}
              options={[
                { value: 'nowrap', label: 'No Wrap' },
                { value: 'wrap', label: 'Wrap' },
                { value: 'wrap-reverse', label: 'Wrap Reverse' },
              ]}
            />
          </InputRow>
          <InputRow label="Justify Content" isResponsive viewMode={viewMode}>
            <Select
              value={read('justifyContent')}
              onChange={(v) => write('justifyContent', v)}
              options={[
                { value: 'flex-start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'End' },
                { value: 'space-between', label: 'Space Between' },
                { value: 'space-around', label: 'Space Around' },
                { value: 'space-evenly', label: 'Space Evenly' },
              ]}
            />
          </InputRow>
          <InputRow label="Align Items" isResponsive viewMode={viewMode}>
            <Select
              value={read('alignItems')}
              onChange={(v) => write('alignItems', v)}
              options={[
                { value: 'stretch', label: 'Stretch' },
                { value: 'flex-start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'End' },
                { value: 'baseline', label: 'Baseline' },
              ]}
            />
          </InputRow>
          <InputRow label="Gap" isResponsive viewMode={viewMode}>
            <NumberInput value={read('gap')} onChange={(v) => write('gap', v)} />
          </InputRow>
          <InputRow label="Flex Grow">
            <TextInput
              value={s.flexGrow}
              onChange={(v) => onChange('flexGrow', v)}
              placeholder="0"
            />
          </InputRow>
          <InputRow label="Flex Shrink">
            <TextInput
              value={s.flexShrink}
              onChange={(v) => onChange('flexShrink', v)}
              placeholder="1"
            />
          </InputRow>
          <InputRow label="Flex Basis">
            <NumberInput
              value={s.flexBasis}
              onChange={(v) => onChange('flexBasis', v)}
              unit="%"
            />
          </InputRow>
        </div>
      </Group>

      <Group title="Grid" emoji="⬛">
        <InputRow label="Template Columns" isResponsive viewMode={viewMode}>
          <TextInput
            value={read('gridTemplateColumns')}
            onChange={(v) => write('gridTemplateColumns', v)}
            placeholder="repeat(3, 1fr)"
          />
        </InputRow>
        <InputRow label="Template Rows">
          <TextInput
            value={s.gridTemplateRows}
            onChange={(v) => onChange('gridTemplateRows', v)}
            placeholder="auto"
          />
        </InputRow>
        <div className="grid grid-cols-2 gap-2">
          <InputRow label="Gap" isResponsive viewMode={viewMode}>
            <NumberInput value={read('gridGap')} onChange={(v) => write('gridGap', v)} />
          </InputRow>
          <InputRow label="Column Gap">
            <NumberInput value={s.columnGap} onChange={(v) => onChange('columnGap', v)} />
          </InputRow>
          <InputRow label="Grid Column">
            <TextInput
              value={s.gridColumn}
              onChange={(v) => onChange('gridColumn', v)}
              placeholder="span 2"
            />
          </InputRow>
          <InputRow label="Grid Row">
            <TextInput
              value={s.gridRow}
              onChange={(v) => onChange('gridRow', v)}
              placeholder="span 1"
            />
          </InputRow>
        </div>
      </Group>
    </>
  );
}

/** Animation/transition pair — also structural only. Kept as a separate
 *  export so the parent can place it at the end of the panel where it
 *  matches the visual order users expect. */
export function AnimationGroup({ styles: s, onChange }: Pick<GroupProps, 'styles' | 'onChange'>) {
  return (
    <Group title="Animation & Transition" emoji="🎬">
      <InputRow label="Transition">
        <TextInput
          value={s.transition}
          onChange={(v) => onChange('transition', v)}
          placeholder="all 0.3s ease"
        />
      </InputRow>
      <InputRow label="Transform">
        <TextInput
          value={s.transform}
          onChange={(v) => onChange('transform', v)}
          placeholder="rotate(0deg) scale(1)"
        />
      </InputRow>
    </Group>
  );
}
