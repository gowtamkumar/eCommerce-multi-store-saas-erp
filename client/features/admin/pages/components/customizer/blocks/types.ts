import type { LucideIcon } from 'lucide-react';
import type { CustomizerSection, SectionType } from '@/types/customizer';

export type SectionCategory = 'Layout' | 'Commerce' | 'Content' | 'Media' | 'Marketing';

/** Read-only data fetched once and shared by all content editors. */
export interface EditorResources {
  products: any[];
  categories: any[];
  brands: any[];
  dbFaqs: any[];
  dbReviews: any[];
}

/** Props every runtime component receives. Already merged with defaults. */
export interface RuntimeProps {
  section: CustomizerSection;
  settings: Record<string, any>;
  styles: Record<string, any>;
}

/** Props every content editor receives. Mutation helpers are stable refs. */
export interface ContentEditorProps {
  section: CustomizerSection;
  settings: Record<string, any>;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  resources: EditorResources;
  pageTitle?: string;
  onUpdate: (key: string, value: unknown) => void;
  updateArrayItem: (key: string, itemId: string, value: any) => void;
  addArrayItem: (key: string, defaultItem: any) => void;
  removeArrayItem: (key: string, itemId: string) => void;
}

/**
 * Single source of truth for a block type. Adding a new block = adding one
 * entry to BLOCK_DEFINITIONS.
 */
export interface BlockDefinition {
  type: SectionType;
  label: string;
  category: SectionCategory;
  icon: LucideIcon;
  /** Structural blocks render children only (section / row / column). */
  isStructural?: boolean;
  defaultSettings?: () => Record<string, any>;
  defaultStyles?: () => Record<string, any>;
  Runtime?: React.ComponentType<RuntimeProps>;
  ContentEditor?: React.ComponentType<ContentEditorProps>;
}
