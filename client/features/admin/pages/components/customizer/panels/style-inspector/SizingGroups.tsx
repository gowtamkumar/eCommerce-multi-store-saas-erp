import { FourSideInput, Group, InputRow, NumberInput } from '../style-controls';
import type { GroupProps } from './types';

interface SizingGroupsProps extends GroupProps {
  /** Whether the spacing group should default-open. We open it on content
   *  blocks (where structural layout sections aren't competing for space)
   *  and keep it closed on structural blocks. */
  spacingDefaultOpen: boolean;
}

/**
 * Spacing (padding + margin) and Size (width / height / min/max) controls.
 * These are always shown for every block since every block has a box.
 */
export default function SizingGroups({
  styles: s,
  onChange,
  read,
  write,
  viewMode,
  spacingDefaultOpen,
}: SizingGroupsProps) {
  return (
    <>
      <Group title="Spacing" emoji="📏" defaultOpen={spacingDefaultOpen}>
        <FourSideInput
          label="Padding"
          prop="padding"
          read={read}
          write={write}
          isResponsive
          viewMode={viewMode}
        />
        <FourSideInput
          label="Margin"
          prop="margin"
          read={read}
          write={write}
          isResponsive
          viewMode={viewMode}
        />
      </Group>

      <Group title="Size" emoji="📦">
        <div className="grid grid-cols-2 gap-2">
          <InputRow label="Width" isResponsive viewMode={viewMode}>
            <NumberInput value={read('width')} onChange={(v) => write('width', v)} unit="%" />
          </InputRow>
          <InputRow label="Height" isResponsive viewMode={viewMode}>
            <NumberInput value={read('height')} onChange={(v) => write('height', v)} />
          </InputRow>
          <InputRow label="Min Width">
            <NumberInput value={s.minWidth} onChange={(v) => onChange('minWidth', v)} />
          </InputRow>
          <InputRow label="Max Width">
            <NumberInput value={s.maxWidth} onChange={(v) => onChange('maxWidth', v)} />
          </InputRow>
          <InputRow label="Min Height" isResponsive viewMode={viewMode}>
            <NumberInput
              value={read('minHeight')}
              onChange={(v) => write('minHeight', v)}
            />
          </InputRow>
          <InputRow label="Max Height">
            <NumberInput value={s.maxHeight} onChange={(v) => onChange('maxHeight', v)} />
          </InputRow>
        </div>
      </Group>
    </>
  );
}
