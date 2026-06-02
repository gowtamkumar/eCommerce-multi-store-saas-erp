"use client";

import { CustomizerSection } from '@/types/customizer';
import React from 'react';
import Preview from './Preview';

interface PagePreviewFrameProps {
  sections: CustomizerSection[];
  viewMode: 'desktop' | 'tablet' | 'mobile';
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  typography?: React.ComponentProps<typeof Preview>['typography'];
}

/**
 * Isolated preview shell — uses a dedicated stacking context and `isolation`
 * so admin chrome styles bleed less into the canvas. Full iframe postMessage
 * preview can replace this wrapper when needed.
 */
export default function PagePreviewFrame(props: PagePreviewFrameProps) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ isolation: 'isolate' }}>
      <div className="w-full h-full max-w-full overflow-hidden rounded-xl bg-white shadow-2xl">
        <Preview {...props} />
      </div>
    </div>
  );
}
