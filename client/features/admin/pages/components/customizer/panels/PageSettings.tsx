import type { PageData } from '@/types/customizer';
import React, { useCallback } from 'react';
import A11yIssuesCard from './page-settings/A11yIssuesCard';
import PageInfoFields from './page-settings/PageInfoFields';
import ReusableBlockButton from './page-settings/ReusableBlockButton';
import RevisionsCard from './page-settings/RevisionsCard';
import SchedulePublishField from './page-settings/SchedulePublishField';
import SeoFieldsSection from './page-settings/SeoFieldsSection';
import SeoPreviewCard from './page-settings/SeoPreviewCard';
import SeoScoreCard from './page-settings/SeoScoreCard';
import TypographySection from './page-settings/TypographySection';

interface PageSettingsProps {
  data: PageData;
  onUpdate: (updater: PageData | ((prev: PageData) => PageData)) => void;
  pageId?: string;
  onSaveTemplate?: () => void;
}

/**
 * Right-rail page settings panel. This is a composition root only; every
 * meaningful UI block lives in `panels/page-settings/`. Keeping the parent
 * tiny makes it easy to reorder, conditionally render, or swap subpanels
 * without scrolling past 500 lines of unrelated JSX.
 */
const PageSettings = React.memo(({ data, onUpdate, pageId, onSaveTemplate }: PageSettingsProps) => {
  // Confirms the home-page swap before mutating state, since this unsets
  // whichever other page is currently flagged as home.
  const handleChange = useCallback(
    (key: keyof PageData, value: unknown) => {
      const updated = { ...data, [key]: value } as PageData;
      if (key === 'isHomePage' && value === true && !data.isHomePage) {
        const confirmed = window.confirm(
          'Set this page as the store home page? The current home page will be unset.',
        );
        if (!confirmed) return;
        updated.slug = '';
      }
      onUpdate(updated);
    },
    [data, onUpdate],
  );

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <PageInfoFields data={data} onChange={handleChange} />
      <SchedulePublishField
        publishAt={data.publishAt}
        onChange={(v) => handleChange('publishAt', v)}
      />
      <SeoScoreCard data={data} />
      <A11yIssuesCard data={data} />
      <ReusableBlockButton data={data} onSaveTemplate={onSaveTemplate} />
      {pageId && pageId !== 'new' && <RevisionsCard pageId={pageId} />}
      <SeoFieldsSection data={data} onChange={handleChange} />
      <TypographySection
        typography={data.typography}
        onChange={(next) => handleChange('typography', next)}
      />
      <SeoPreviewCard data={data} />
    </div>
  );
});

PageSettings.displayName = 'PageSettings';

export default PageSettings;
