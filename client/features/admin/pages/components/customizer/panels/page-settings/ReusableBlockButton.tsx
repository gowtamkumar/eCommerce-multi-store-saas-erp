import { fetchAPI } from '@/services/api';
import type { PageData } from '@/types/customizer';

interface ReusableBlockButtonProps {
  data: PageData;
}

/**
 * Saves the entire page's section tree into the reusable-blocks library
 * so the user can drop it onto other pages. Disabled when the page has
 * no content yet — there's nothing meaningful to save.
 */
export default function ReusableBlockButton({ data }: ReusableBlockButtonProps) {
  const handleSave = async () => {
    if (!data.content.sections.length) return;
    const name = window.prompt('Name this saved block:', data.title || 'My block');
    if (!name) return;
    const res = await fetchAPI('/pages/reusable-blocks', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: `Saved from ${data.title || 'page'}`,
        category: 'block',
        payload: data.content.sections,
      }),
    });
    if (res?.success) alert('Block saved to your library.');
  };

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={!data.content.sections.length}
        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-40"
      >
        Save current page as a reusable block
      </button>
    </section>
  );
}
