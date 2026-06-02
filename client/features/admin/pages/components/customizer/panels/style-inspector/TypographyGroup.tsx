import {
  ColorInput,
  Group,
  InputRow,
  NumberInput,
  Select,
} from '../style-controls';
import { ALIGN_OPTIONS, FONT_OPTIONS, TRANSFORM_OPTIONS, WEIGHT_OPTIONS } from './shared-options';
import type { GroupProps } from './types';

/**
 * Shared typography controls for blocks that render text directly.
 * Hidden via the `omitTypography` capability for blocks like Brand Grid
 * that have their own internal text styling.
 *
 * `color` and `textColor` are kept in sync because runtime components
 * read different keys depending on which generation of the block they
 * came from — writing both makes the inspector forward-compatible.
 */
export default function TypographyGroup({ styles: s, onChange, read, write, viewMode }: GroupProps) {
  return (
    <Group title="Typography" emoji="✍️">
      <InputRow label="Font Family">
        <Select
          value={s.fontFamily}
          onChange={(v) => onChange('fontFamily', v)}
          options={FONT_OPTIONS}
        />
      </InputRow>
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Font Size" isResponsive viewMode={viewMode}>
          <NumberInput value={read('fontSize')} onChange={(v) => write('fontSize', v)} />
        </InputRow>
        <InputRow label="Font Weight">
          <Select
            value={s.fontWeight}
            onChange={(v) => onChange('fontWeight', v)}
            options={WEIGHT_OPTIONS}
          />
        </InputRow>
        <InputRow label="Line Height">
          <NumberInput
            value={s.lineHeight}
            onChange={(v) => onChange('lineHeight', v)}
            unit=""
          />
        </InputRow>
        <InputRow label="Letter Spacing">
          <NumberInput
            value={s.letterSpacing}
            onChange={(v) => onChange('letterSpacing', v)}
            unit="em"
          />
        </InputRow>
        <InputRow label="Text Align" isResponsive viewMode={viewMode}>
          <Select
            value={read('textAlign')}
            onChange={(v) => write('textAlign', v)}
            options={ALIGN_OPTIONS}
          />
        </InputRow>
        <InputRow label="Text Transform">
          <Select
            value={s.textTransform}
            onChange={(v) => onChange('textTransform', v)}
            options={TRANSFORM_OPTIONS}
          />
        </InputRow>
      </div>
      <InputRow label="Color">
        <ColorInput
          value={s.color}
          onChange={(v) => {
            onChange('color', v);
            onChange('textColor', v);
          }}
        />
      </InputRow>
    </Group>
  );
}
