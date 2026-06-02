import type { PageData } from '@/types/customizer';
import { Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReusableBlockButtonProps {
  data: PageData;
  onSaveTemplate?: () => void;
}

/**
 * Renders the button to save the entire page layout as a reusable template.
 * Calls the delegated onSaveTemplate callback.
 */
export default function ReusableBlockButton({ data, onSaveTemplate }: ReusableBlockButtonProps) {
  const handleOpen = () => {
    if (!data.content.sections.length) {
      toast.error('Cannot save empty layout. Add some sections first.');
      return;
    }
    onSaveTemplate?.();
  };

  return (
    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Library Templates</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
          Save the current page sections so you can drop them into other pages.
        </p>
      </div>
      <button
        type="button"
        onClick={handleOpen}
        disabled={!data.content.sections.length}
        className="w-full py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer"
      >
        <Bookmark className="w-4 h-4" />
        Save Layout as Reusable Block
      </button>
    </div>
  );
}
