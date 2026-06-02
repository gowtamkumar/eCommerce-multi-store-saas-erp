"use client";

/**
 * Marketing blocks — promotional banners and newsletter capture.
 */

import { Mail, Tag } from 'lucide-react';
import Newsletter from '../../runtime/Newsletter';
import OfferBanner from '../../runtime/OfferBanner';
import InteractiveEditor from '../../editors/InteractiveEditor';
import type { BlockDefinition } from '../types';

const marketingBlocks: BlockDefinition[] = [
  {
    type: 'offer-banner',
    label: 'Offer Banner',
    category: 'Marketing',
    icon: Tag,
    defaultSettings: () => ({
      text: 'Limited time offer',
      buttonText: 'Shop now',
      link: '/products',
    }),
    defaultStyles: () => ({ paddingTop: 40, paddingBottom: 40 }),
    Runtime: ({ settings, styles }) => <OfferBanner settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate, updateArrayItem, addArrayItem, removeArrayItem }) => (
      <InteractiveEditor
        section={section}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    category: 'Marketing',
    icon: Mail,
    defaultSettings: () => ({
      headline: 'Stay in the loop',
      subline: 'Get the latest news in your inbox.',
      buttonText: 'Subscribe',
      placeholder: 'you@example.com',
    }),
    defaultStyles: () => ({ paddingTop: 80, paddingBottom: 80 }),
    Runtime: ({ settings, styles }) => (
      <Newsletter
        title={settings?.title || settings?.headline}
        description={settings?.description || settings?.subline}
        buttonText={settings?.buttonText}
        placeholder={settings?.placeholder}
        styles={styles}
      />
    ),
    ContentEditor: ({ section, onUpdate, updateArrayItem, addArrayItem, removeArrayItem }) => (
      <InteractiveEditor
        section={section}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
];

export default marketingBlocks;
