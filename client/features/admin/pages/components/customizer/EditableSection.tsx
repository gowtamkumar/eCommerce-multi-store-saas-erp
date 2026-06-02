"use client";

import RuntimeSectionContent from '@/features/admin/pages/components/customizer/RuntimeSectionContent';
import SelectionToolbar from '@/features/admin/pages/components/customizer/panels/SelectionToolbar';
import { useEditorActions } from '@/features/admin/pages/components/customizer/EditorActionsContext';
import { CustomizerSection } from '@/types/customizer';
import { EyeOff, Lock } from 'lucide-react';
import React from 'react';

interface EditableSectionProps {
  section: CustomizerSection;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

const EditableSection: React.FC<EditableSectionProps> = ({ section, selectedId, onSelect }) => {
  const isStructural = ['section', 'row', 'column'].includes(section.type);
  const isSelected = selectedId === section.id;
  const isHidden = section.hidden === true;
  const isLocked = section.locked === true;
  const actions = useEditorActions();

  return (
    <div
      onClick={(e) => {
        if (onSelect && !isLocked) {
          e.stopPropagation();
          onSelect(section.id);
        }
      }}
      onContextMenu={(e) => {
        if (actions) {
          e.preventDefault();
          e.stopPropagation();
          onSelect?.(section.id);
          actions.openContextMenu(section.id, e);
        }
      }}
      className={`relative transition-all duration-200
        ${isStructural ? 'min-h-[20px]' : ''}
        ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${isHidden ? 'opacity-40' : ''}
        ${isSelected ? 'outline outline-2 outline-brand-500 outline-offset-[-2px] z-[5]' : 'hover:outline hover:outline-2 hover:outline-brand-500/30 hover:outline-offset-[-2px]'}
      `}
      data-section-id={section.id}
    >
      {isSelected && actions && (
        <SelectionToolbar
          section={section}
          onDuplicate={() => actions.duplicate(section.id)}
          onDelete={() => actions.remove(section.id)}
          onMoveUp={() => actions.moveUp(section.id)}
          onMoveDown={() => actions.moveDown(section.id)}
          onToggleHidden={() => actions.toggleHidden(section.id)}
          onToggleLocked={() => actions.toggleLocked(section.id)}
          canMoveUp={actions.canMoveUp(section.id)}
          canMoveDown={actions.canMoveDown(section.id)}
        />
      )}

      {(isHidden || isLocked) && (
        <div className="absolute top-1 right-1 z-[11] flex items-center gap-1 pointer-events-none">
          {isLocked && (
            <span className="px-1.5 py-0.5 rounded bg-slate-700/90 text-white text-[9px] font-bold flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Locked
            </span>
          )}
          {isHidden && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-white text-[9px] font-bold flex items-center gap-1">
              <EyeOff className="w-2.5 h-2.5" /> Hidden
            </span>
          )}
        </div>
      )}

      <RuntimeSectionContent section={section} onSelect={onSelect} selectedId={selectedId} />
    </div>
  );
};

export default EditableSection;
