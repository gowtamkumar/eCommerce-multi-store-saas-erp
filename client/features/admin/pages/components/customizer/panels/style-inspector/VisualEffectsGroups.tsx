import {
  ColorInput,
  Group,
  InputRow,
  NumberInput,
  Select,
  SliderInput,
  TextInput,
} from '../style-controls';
import type { GroupProps } from './types';

/**
 * Border, shadow, opacity, and blur filter — purely decorative groups.
 * Hidden on blocks that ship their own decoration (omitBorder/omitEffects).
 *
 * The blur filter input writes a `blur(X)` string to the `filter` CSS
 * property so the user just types a number and we wrap it for them.
 */
export default function VisualEffectsGroups({
  styles: s,
  onChange,
  showBorder,
  showEffects,
}: Pick<GroupProps, 'styles' | 'onChange'> & {
  showBorder: boolean;
  showEffects: boolean;
}) {
  const blurValue =
    typeof s.filter === 'string' ? s.filter.replace('blur(', '').replace(')', '') : '';

  return (
    <>
      {showBorder && (
        <Group title="Border" emoji="🔲">
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Border Width">
              <NumberInput value={s.borderWidth} onChange={(v) => onChange('borderWidth', v)} />
            </InputRow>
            <InputRow label="Border Style">
              <Select
                value={s.borderStyle}
                onChange={(v) => onChange('borderStyle', v)}
                options={[
                  { value: 'solid', label: 'Solid' },
                  { value: 'dashed', label: 'Dashed' },
                  { value: 'dotted', label: 'Dotted' },
                  { value: 'double', label: 'Double' },
                  { value: 'none', label: 'None' },
                ]}
              />
            </InputRow>
            <InputRow label="Border Radius">
              <NumberInput
                value={s.borderRadius}
                onChange={(v) => onChange('borderRadius', v)}
              />
            </InputRow>
            <InputRow label="Border Color">
              <ColorInput value={s.borderColor} onChange={(v) => onChange('borderColor', v)} />
            </InputRow>
          </div>
        </Group>
      )}

      {showEffects && (
        <Group title="Shadow & Effects" emoji="✨">
          <InputRow label="Box Shadow">
            <TextInput
              value={s.boxShadow}
              onChange={(v) => onChange('boxShadow', v)}
              placeholder="0 4px 24px rgba(0,0,0,0.1)"
            />
          </InputRow>
          <InputRow label="Opacity">
            <SliderInput
              value={s.opacity ?? 1}
              onChange={(v) => onChange('opacity', v)}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </InputRow>
          <InputRow label="Blur Filter">
            <NumberInput
              value={blurValue}
              onChange={(v) => onChange('filter', v ? `blur(${v})` : '')}
            />
          </InputRow>
        </Group>
      )}
    </>
  );
}
