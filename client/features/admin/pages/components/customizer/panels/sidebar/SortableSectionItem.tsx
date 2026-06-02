import {
  getBlockDefinition,
  isStructuralType,
} from '@/features/admin/pages/components/customizer/blocks';
import { getSectionLabel } from '@/features/admin/pages/lib/page-builder-tree';
import type { CustomizerSection, SectionType } from '@/types/customizer';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react';
import React, { useState } from 'react';

export interface SortableSectionItemProps {
  section: CustomizerSection;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onAddChild: (parentId: string, type: SectionType) => void;
  onOpenComponentModal: (id: string) => void;
  overId?: string | null;
  depth?: number;
}

/**
 * A single node in the layers tree. Renders its own drag handle, hover
 * actions, and (when structural) recursively renders children plus a
 * scoped "Add Row/Column/Component" button.
 *
 * Memoized because the parent re-renders on every section-tree mutation;
 * without React.memo every node would re-render even when its props are
 * referentially stable.
 */
const SortableSectionItem = React.memo(function SortableSectionItem({
  section,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleHidden,
  onToggleLocked,
  onAddChild,
  onOpenComponentModal,
  overId,
  depth = 0,
}: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { ...section },
  });

  const [expanded, setExpanded] = useState(true);

  const isOver = overId === section.id && !isDragging;
  const isActive = selectedId === section.id;
  const Icon = getBlockDefinition(section.type).icon;
  const structural = isStructuralType(section.type);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginLeft: `${depth * 12}px`,
  };

  // When the user clicks the inline "Add" button inside a structural block:
  // a section opens with a Row, a row opens with a Column, anything else
  // opens the component-picker modal.
  const handleAddInside = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (section.type === 'section') onAddChild(section.id, 'row');
    else if (section.type === 'row') onAddChild(section.id, 'column');
    else onOpenComponentModal(section.id);
  };

  const addLabel =
    section.type === 'section' ? 'Row' : section.type === 'row' ? 'Column' : 'Component';

  return (
    <div ref={setNodeRef} style={style} className="mb-2 relative">
      {isOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-brand-500 rounded-full pointer-events-none z-10" />
      )}
      <div
        onClick={() => onSelect(section.id)}
        className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
          isActive
            ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-slate-600"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>

        {structural && section.children && section.children.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : structural ? (
          // Reserve the gap so labels of empty structural nodes align with
          // the labels of their populated siblings.
          <div className="w-4" />
        ) : null}

        <div
          className={`p-1.5 rounded-md ${
            isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[11px] font-bold truncate ${
              isActive
                ? 'text-brand-900 dark:text-brand-100'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {getSectionLabel(section.type)}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleHidden(section.id);
          }}
          className={`p-1 rounded transition-all ${
            section.hidden
              ? 'text-amber-500 opacity-100'
              : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-500'
          }`}
          title={section.hidden ? 'Show' : 'Hide'}
        >
          {section.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLocked(section.id);
          }}
          className={`p-1 rounded transition-all ${
            section.locked
              ? 'text-slate-700 opacity-100'
              : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700'
          }`}
          title={section.locked ? 'Unlock' : 'Lock'}
        >
          {section.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => onDuplicate(section.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-all"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => onDelete(section.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {structural && expanded && (
        <div className="mt-2 pl-2 border-l-2 border-slate-100 dark:border-slate-800 border-dashed">
          {section.children?.map((child) => (
            <SortableSectionItem
              key={child.id}
              section={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onToggleHidden={onToggleHidden}
              onToggleLocked={onToggleLocked}
              onAddChild={onAddChild}
              onOpenComponentModal={onOpenComponentModal}
              overId={overId}
              depth={depth + 1}
            />
          ))}
          <div className="ml-3 mt-1 pl-1">
            <button
              type="button"
              onClick={handleAddInside}
              className="text-[10px] flex items-center gap-1 font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider py-1"
            >
              <Plus className="w-3 h-3" /> Add {addLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SortableSectionItem;
