import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';
import { ColorInput, Group, InputRow, Select } from '../style-controls';
import type { GroupProps } from './types';

/**
 * Background color, image (uploaded or URL), and CSS positioning.
 *
 * The runtime stores the image as a CSS `url(...)` value but the input
 * needs just the bare URL — strip on read, wrap on write so the user
 * never sees `url(...)` in the field.
 */
export default function BackgroundGroup({
  styles: s,
  onChange,
}: Pick<GroupProps, 'styles' | 'onChange'>) {
  const rawImageUrl = s.backgroundImage
    ? String(s.backgroundImage)
        .replace(/^url\(["']?/, '')
        .replace(/["']?\)$/, '')
    : '';

  return (
    <Group title="Background" emoji="🎨">
      <InputRow label="Background Color">
        <ColorInput
          value={s.backgroundColor}
          onChange={(v) => onChange('backgroundColor', v)}
        />
      </InputRow>
      <ImageUploadField
        label="Background Image"
        value={rawImageUrl}
        onChange={(v) => onChange('backgroundImage', v ? `url(${v})` : '')}
        uploadApi={fetchAPI}
        aspectRatio="wide"
        showUrlInput={true}
        description="Upload background image or paste URL"
      />
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Size">
          <Select
            value={s.backgroundSize}
            onChange={(v) => onChange('backgroundSize', v)}
            options={[
              { value: 'cover', label: 'Cover' },
              { value: 'contain', label: 'Contain' },
              { value: 'auto', label: 'Auto' },
              { value: '100% 100%', label: 'Stretch' },
            ]}
          />
        </InputRow>
        <InputRow label="Position">
          <Select
            value={s.backgroundPosition}
            onChange={(v) => onChange('backgroundPosition', v)}
            options={[
              { value: 'center', label: 'Center' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </InputRow>
        <InputRow label="Repeat">
          <Select
            value={s.backgroundRepeat}
            onChange={(v) => onChange('backgroundRepeat', v)}
            options={[
              { value: 'no-repeat', label: 'No Repeat' },
              { value: 'repeat', label: 'Repeat' },
              { value: 'repeat-x', label: 'Repeat X' },
              { value: 'repeat-y', label: 'Repeat Y' },
            ]}
          />
        </InputRow>
      </div>
    </Group>
  );
}
