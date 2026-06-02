"use client";

import EditableSection from '@/features/admin/pages/components/customizer/EditableSection';
import RuntimeSectionContent from '@/features/admin/pages/components/customizer/RuntimeSectionContent';
import { CustomizerSection } from '@/types/customizer';
import React from 'react';

interface SectionRendererProps {
  section: CustomizerSection;
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
}

/** Storefront uses runtime-only rendering; editor preview passes onSelect for editable chrome. */
const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  if (props.onSelect) {
    return <EditableSection {...props} />;
  }
  return <RuntimeSectionContent {...props} />;
};

export default SectionRenderer;
