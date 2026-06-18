"use client";

/**
 * Content blocks — text, headings, paragraphs, buttons, FAQs, contact,
 * reviews, and stat counters.
 *
 * Most content blocks have lightweight runtime components but the FAQ and
 * review sliders are dynamically imported (their runtimes pull markdown
 * rendering / carousel libraries).
 */

import dynamic from 'next/dynamic';
import {
  BarChart2,
  HelpCircle,
  Mail,
  MessageSquare,
  MousePointer2,
  Type,
} from 'lucide-react';
import BuilderButton from '../../runtime/BuilderButton';
import ContactSection from '../../runtime/ContactSection';
import Heading from '../../runtime/Heading';
import Paragraph from '../../runtime/Paragraph';
import StatsCounter from '../../runtime/StatsCounter';
import TextBlock from '../../runtime/TextBlock';
import FaqEditor from '../../editors/FaqEditor';
import InteractiveEditor from '../../editors/InteractiveEditor';
import SimpleContentEditor from '../../editors/SimpleContentEditor';
import type { BlockDefinition } from '../types';

const FAQSection = dynamic(() => import('@/features/admin/faq/components/FAQSection'), {
  ssr: true,
});
const ReviewSection = dynamic(() => import('../../runtime/ReviewSection'), { ssr: true });

const contentBlocks: BlockDefinition[] = [
  {
    type: 'heading',
    label: 'Heading',
    category: 'Content',
    icon: Type,
    defaultSettings: () => ({ text: 'Heading', level: 'h2' }),
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings, styles }) => <Heading settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate, pageTitle }) => (
      <SimpleContentEditor section={section} onUpdate={onUpdate} pageTitle={pageTitle} />
    ),
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'Content',
    icon: MessageSquare,
    defaultSettings: () => ({ text: 'Lorem ipsum dolor sit amet.' }),
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings, styles }) => <Paragraph settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate, pageTitle }) => (
      <SimpleContentEditor section={section} onUpdate={onUpdate} pageTitle={pageTitle} />
    ),
  },
  {
    type: 'text-block',
    label: 'Text Block',
    category: 'Content',
    icon: Type,
    defaultSettings: () => ({ headline: '', html: '' }),
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings, styles }) => (
      <TextBlock html={settings?.html} headline={settings?.headline} styles={styles} />
    ),
    ContentEditor: ({ section, onUpdate, pageTitle }) => (
      <SimpleContentEditor section={section} onUpdate={onUpdate} pageTitle={pageTitle} />
    ),
  },
  {
    type: 'button',
    label: 'Button',
    category: 'Content',
    icon: MousePointer2,
    defaultSettings: () => ({ text: 'Click me', variant: 'solid', size: 'md', link: '#' }),
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings, styles }) => (
      <BuilderButton
        variant={settings?.variant}
        size={settings?.size}
        text={settings?.text}
        styles={styles}
        link={settings?.link}
      />
    ),
    ContentEditor: ({ section, onUpdate, pageTitle }) => (
      <SimpleContentEditor section={section} onUpdate={onUpdate} pageTitle={pageTitle} />
    ),
  },
  {
    type: 'faq-section',
    label: 'FAQ Section',
    category: 'Content',
    icon: HelpCircle,
    defaultSettings: () => ({ title: 'Frequently Asked Questions', source: 'page' }),
    defaultStyles: () => ({ paddingTop: 60, paddingBottom: 80 }),
    Runtime: ({ settings, styles }) => (
      <FAQSection
        items={settings?.items}
        headline={settings?.title}
        subline={settings?.subline}
        styles={styles}
        buttonText={settings?.buttonText}
        faqIds={settings?.faqIds}
        source={settings?.source}
        gridColumns={settings?.gridColumns}
        mobileColumns={settings?.mobileColumns}
        layout={settings?.layout}
      />
    ),
    ContentEditor: ({
      settings,
      resources,
      onUpdate,
      updateArrayItem,
      addArrayItem,
      removeArrayItem,
    }) => (
      <FaqEditor
        settings={settings}
        dbFaqs={resources.dbFaqs}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
  {
    type: 'contact',
    label: 'Contact',
    category: 'Content',
    icon: Mail,
    defaultStyles: () => ({ paddingTop: 60, paddingBottom: 60 }),
    Runtime: ({ settings, styles }) => <ContactSection settings={settings} styles={styles} />,
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
    type: 'review-slider',
    label: 'Review Slider',
    category: 'Content',
    icon: MessageSquare,
    defaultSettings: () => ({ source: 'db', layout: 'slider' }),
    defaultStyles: () => ({ paddingTop: 60, paddingBottom: 80 }),
    Runtime: ({ settings, styles }) => <ReviewSection settings={settings} styles={styles} />,
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
    type: 'stats-counter',
    label: 'Stats Counter',
    category: 'Content',
    icon: BarChart2,
    defaultSettings: () => ({
      items: [
        { id: `c-${Date.now()}-1`, label: 'Customers', value: '12k' },
        { id: `c-${Date.now()}-2`, label: 'Orders', value: '48k' },
        { id: `c-${Date.now()}-3`, label: 'Countries', value: '32' },
      ],
    }),
    defaultStyles: () => ({ paddingTop: 60, paddingBottom: 60 }),
    Runtime: ({ settings, styles }) => (
      <StatsCounter stats={settings?.items} settings={settings} styles={styles} />
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

export default contentBlocks;
