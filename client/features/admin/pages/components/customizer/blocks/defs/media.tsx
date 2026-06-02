"use client";

/**
 * Media blocks — banners, images, and videos.
 *
 * BannerSlider is dynamically imported because it bundles a sizable
 * carousel runtime that's not needed unless a banner is actually placed
 * on the page.
 */

import dynamic from 'next/dynamic';
import { ImageIcon, Layout, Video } from 'lucide-react';
import ImageBlock from '../../runtime/ImageBlock';
import VideoBlock from '../../runtime/VideoBlock';
import BannerEditor from '../../editors/BannerEditor';
import MediaEditor from '../../editors/MediaEditor';
import type { BlockDefinition } from '../types';

const BannerSlider = dynamic(() => import('../../runtime/BannerSlider'), { ssr: true });

const mediaBlocks: BlockDefinition[] = [
  {
    type: 'banner',
    label: 'Banner',
    category: 'Media',
    icon: Layout,
    defaultSettings: () => ({
      slides: [
        {
          id: `slide-${Date.now()}`,
          headline: 'Summer Collection 2026',
          subline: 'Discover the latest trends in luxury fashion and accessories.',
          backgroundImage:
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
          primaryButtonText: 'Shop Now',
          primaryButtonLink: '/products',
          secondaryButtonText: 'Learn More',
          secondaryButtonLink: '/about',
        },
      ],
    }),
    defaultStyles: () => ({
      paddingTop: 0,
      paddingBottom: 0,
      height: 600,
      textAlign: 'center',
      overlayOpacity: 40,
      headlineColor: '#ffffff',
      sublineColor: 'rgba(255, 255, 255, 0.9)',
      buttonColor: '#ffffff',
      buttonTextColor: '#2563eb',
    }),
    Runtime: ({ settings, styles }) => <BannerSlider settings={settings} styles={styles} />,
    ContentEditor: ({ settings, onUpdate, updateArrayItem, addArrayItem, removeArrayItem }) => (
      <BannerEditor
        settings={settings}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
  {
    type: 'image-block',
    label: 'Image Block',
    category: 'Media',
    icon: ImageIcon,
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings, styles }) => <ImageBlock settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate }) => <MediaEditor section={section} onUpdate={onUpdate} />,
  },
  {
    type: 'video-block',
    label: 'Video Block',
    category: 'Media',
    icon: Video,
    defaultStyles: () => ({ paddingTop: 0, paddingBottom: 0 }),
    Runtime: ({ settings, styles }) => <VideoBlock settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate }) => <MediaEditor section={section} onUpdate={onUpdate} />,
  },
];

export default mediaBlocks;
