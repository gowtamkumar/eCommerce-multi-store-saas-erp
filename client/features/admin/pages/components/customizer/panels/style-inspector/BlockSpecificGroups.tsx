import {
  ColorInput,
  Group,
  InputRow,
  NumberInput,
  Select,
  SliderInput,
} from '../style-controls';
import { ALIGN_OPTIONS, TRANSFORM_OPTIONS, WEIGHT_OPTIONS } from './shared-options';
import type { StyleCapabilities } from './capabilities';
import type { GroupProps } from './types';

interface BlockSpecificGroupsProps extends Pick<GroupProps, 'styles' | 'onChange'> {
  caps: StyleCapabilities;
}

/**
 * Per-block-type style groups: SectionTitle, Hero, Button, Card, FAQ,
 * Contact. Each is shown only when its capability is true on the
 * selected block. Grouped into one file because they all share the
 * exact same props shape and only differ in which control set they render.
 */
export default function BlockSpecificGroups({
  styles: s,
  onChange,
  caps,
}: BlockSpecificGroupsProps) {
  return (
    <>
      {caps.hasSectionTitle && (
        <Group title="Section Title" emoji="📝">
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Title Color">
              <ColorInput
                value={s.headlineColor || s.color}
                onChange={(v) => onChange('headlineColor', v)}
              />
            </InputRow>
            <InputRow label="Underline Color">
              <ColorInput value={s.sublineColor} onChange={(v) => onChange('sublineColor', v)} />
            </InputRow>
            <InputRow label="Font Size">
              <NumberInput
                value={s.headingFontSize}
                onChange={(v) => onChange('headingFontSize', v)}
              />
            </InputRow>
            <InputRow label="Font Weight">
              <Select
                value={s.headingFontWeight}
                onChange={(v) => onChange('headingFontWeight', v)}
                options={WEIGHT_OPTIONS}
              />
            </InputRow>
            <InputRow label="Line Height">
              <NumberInput
                value={s.headingLineHeight}
                onChange={(v) => onChange('headingLineHeight', v)}
                unit=""
              />
            </InputRow>
            <InputRow label="Transform">
              <Select
                value={s.textTransform}
                onChange={(v) => onChange('textTransform', v)}
                options={TRANSFORM_OPTIONS}
              />
            </InputRow>
          </div>
        </Group>
      )}

      {caps.isHero && (
        <Group title="Hero / Banner" emoji="💎" defaultOpen>
          <InputRow label="Overlay Opacity">
            <SliderInput
              value={s.overlayOpacity ?? 70}
              onChange={(v) => onChange('overlayOpacity', v)}
              min={0}
              max={100}
              format={(v) => `${v}%`}
            />
          </InputRow>
          <InputRow label="Content Alignment">
            <Select
              value={s.textAlign}
              onChange={(v) => onChange('textAlign', v)}
              options={ALIGN_OPTIONS}
            />
          </InputRow>
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Headline Color">
              <ColorInput
                value={s.headlineColor}
                onChange={(v) => onChange('headlineColor', v)}
              />
            </InputRow>
            <InputRow label="Subline Color">
              <ColorInput value={s.sublineColor} onChange={(v) => onChange('sublineColor', v)} />
            </InputRow>
            <InputRow label="Button Color">
              <ColorInput value={s.buttonColor} onChange={(v) => onChange('buttonColor', v)} />
            </InputRow>
            <InputRow label="Button Text Color">
              <ColorInput
                value={s.buttonTextColor}
                onChange={(v) => onChange('buttonTextColor', v)}
              />
            </InputRow>
          </div>
        </Group>
      )}

      {caps.hasButton && (
        <Group title="Button" emoji="🎯">
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Background Color">
              <ColorInput value={s.buttonColor} onChange={(v) => onChange('buttonColor', v)} />
            </InputRow>
            <InputRow label="Text Color">
              <ColorInput
                value={s.buttonTextColor}
                onChange={(v) => onChange('buttonTextColor', v)}
              />
            </InputRow>
            <InputRow label="Border Radius">
              <NumberInput value={s.borderRadius} onChange={(v) => onChange('borderRadius', v)} />
            </InputRow>
            <InputRow label="Border Color">
              <ColorInput value={s.borderColor} onChange={(v) => onChange('borderColor', v)} />
            </InputRow>
          </div>
        </Group>
      )}

      {caps.hasCards && (
        <Group title="Card & Item" emoji="🎴">
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Card Background">
              <ColorInput
                value={s.cardBackgroundColor}
                onChange={(v) => onChange('cardBackgroundColor', v)}
              />
            </InputRow>
            <InputRow label="Card Radius">
              <NumberInput value={s.cardRadius} onChange={(v) => onChange('cardRadius', v)} />
            </InputRow>
            <InputRow label="Card Border">
              <Select
                value={s.cardBorder}
                onChange={(v) => onChange('cardBorder', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'thin', label: 'Thin (1px)' },
                  { value: 'medium', label: 'Medium (2px)' },
                  { value: 'thick', label: 'Thick (4px)' },
                ]}
              />
            </InputRow>
            <InputRow label="Card Shadow">
              <Select
                value={s.cardShadow}
                onChange={(v) => onChange('cardShadow', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ]}
              />
            </InputRow>
          </div>
        </Group>
      )}

      {caps.isFaq && (
        <Group title="FAQ Item" emoji="❓">
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Question Color">
              <ColorInput
                value={s.questionColor}
                onChange={(v) => onChange('questionColor', v)}
              />
            </InputRow>
            <InputRow label="Answer Color">
              <ColorInput value={s.answerColor} onChange={(v) => onChange('answerColor', v)} />
            </InputRow>
            <InputRow label="Icon Color">
              <ColorInput value={s.iconColor} onChange={(v) => onChange('iconColor', v)} />
            </InputRow>
            <InputRow label="Icon Background">
              <ColorInput value={s.iconBgColor} onChange={(v) => onChange('iconBgColor', v)} />
            </InputRow>
            <InputRow label="Item Background">
              <ColorInput
                value={s.cardBackgroundColor}
                onChange={(v) => onChange('cardBackgroundColor', v)}
              />
            </InputRow>
            <InputRow label="Item Radius">
              <NumberInput value={s.cardRadius} onChange={(v) => onChange('cardRadius', v)} />
            </InputRow>
          </div>
        </Group>
      )}

      {caps.isContact && (
        <Group title="Contact Page" emoji="📞">
          <div className="grid grid-cols-2 gap-2">
            <InputRow label="Heading Color">
              <ColorInput
                value={s.cardHeadingColor}
                onChange={(v) => onChange('cardHeadingColor', v)}
              />
            </InputRow>
            <InputRow label="Heading Size">
              <NumberInput
                value={s.cardHeadingSize}
                onChange={(v) => onChange('cardHeadingSize', v)}
              />
            </InputRow>
            <InputRow label="Info Card Bg">
              <ColorInput
                value={s.cardBackgroundColor}
                onChange={(v) => onChange('cardBackgroundColor', v)}
              />
            </InputRow>
            <InputRow label="Form Card Bg">
              <ColorInput value={s.formBgColor} onChange={(v) => onChange('formBgColor', v)} />
            </InputRow>
            <InputRow label="Icon Color">
              <ColorInput value={s.iconColor} onChange={(v) => onChange('iconColor', v)} />
            </InputRow>
            <InputRow label="Icon Background">
              <ColorInput value={s.iconBgColor} onChange={(v) => onChange('iconBgColor', v)} />
            </InputRow>
            <InputRow label="Input Background">
              <ColorInput value={s.inputBgColor} onChange={(v) => onChange('inputBgColor', v)} />
            </InputRow>
            <InputRow label="Input Border">
              <ColorInput
                value={s.inputBorderColor}
                onChange={(v) => onChange('inputBorderColor', v)}
              />
            </InputRow>
          </div>
        </Group>
      )}
    </>
  );
}
