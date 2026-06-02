import type { SectionType } from '@/types/customizer';
import { X } from 'lucide-react';
import BlockInserter from '../BlockInserter';

interface ComponentInsertModalProps {
  parentId: string;
  recent: SectionType[];
  onInsert: (parentId: string, type: SectionType) => void;
  onClose: () => void;
}

/**
 * Lightweight modal that opens when the user clicks "Add Component"
 * inside a structural block (most commonly inside a column). Reuses
 * BlockInserter so the picker UI is consistent with the bottom library
 * and the slash-command palette.
 */
export default function ComponentInsertModal({
  parentId,
  recent,
  onInsert,
  onClose,
}: ComponentInsertModalProps) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Component</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pick a block to insert inside the current block.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <BlockInserter
            recent={recent}
            onSelect={(type) => {
              onInsert(parentId, type);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
