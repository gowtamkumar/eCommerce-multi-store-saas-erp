"use client";

import { CustomizerSection, SectionType } from '@/types/customizer';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BarChart2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Columns,
  Grid,
  HelpCircle,
  ImageIcon,
  Layout,
  LayoutTemplate,
  Mail,
  MessageSquare,
  MousePointer2,
  Plus,
  Rows,
  Sliders,
  Tag,
  Trash2,
  Type,
  Video,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  sections: CustomizerSection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (sections: CustomizerSection[]) => void;
}

const SECTION_ICONS: Record<SectionType, any> = {
  'section': LayoutTemplate,
  'row': Rows,
  'column': Columns,
  'banner': Layout,
  'product-slider': Sliders,
  'category-grid': Grid,
  'brand-grid': Grid,
  'newsletter': Mail,
  'stats-counter': BarChart2,
  'offer-banner': Tag,
  'review-slider': MessageSquare,
  'text-block': Type,
  'image-block': ImageIcon,
  'button': MousePointer2,
  'faq-section': HelpCircle,
  'video-block': Video,
  'contact': Mail,
};

const getLabel = (type: SectionType) => {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

function generateId() {
  return `block-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to recursively find a block and apply an update function
function updateBlockInTree(
  blocks: CustomizerSection[],
  targetId: string,
  updateFn: (block: CustomizerSection) => CustomizerSection | null
): CustomizerSection[] {
  return blocks.map(block => {
    if (block.id === targetId) {
      const updated = updateFn(block);
      return updated === null ? null : updated;
    }
    if (block.children) {
      const newChildren = updateBlockInTree(block.children, targetId, updateFn).filter(Boolean) as CustomizerSection[];
      return { ...block, children: newChildren };
    }
    return block;
  }).filter(Boolean) as CustomizerSection[];
}

function removeBlockFromTree(blocks: CustomizerSection[], idToRemove: string): CustomizerSection[] {
  return blocks.filter(block => {
    if (block.id === idToRemove) return false;
    if (block.children) {
      block.children = removeBlockFromTree(block.children, idToRemove);
    }
    return true;
  });
}

function findBlockInTree(blocks: CustomizerSection[], id: string): CustomizerSection | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockInTree(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentArray(blocks: CustomizerSection[], id: string): CustomizerSection[] | null {
  if (blocks.some(b => b.id === id)) return blocks;
  for (const block of blocks) {
    if (block.children) {
      const found = findParentArray(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Flatten tree for dnd-kit sortable context (we only sort top level or siblings, but this basic implementation handles full flattening for drag overlay)
function flattenTree(blocks: CustomizerSection[]): CustomizerSection[] {
  let flat: CustomizerSection[] = [];
  blocks.forEach(block => {
    flat.push(block);
    if (block.children) {
      flat = [...flat, ...flattenTree(block.children)];
    }
  });
  return flat;
}


// Recursive Sortable Item Property
interface SortableItemProps {
  section: CustomizerSection;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onAddChild: (parentId: string, type: SectionType) => void;
  onOpenComponentModal: (id: string) => void;
  depth?: number;
}

function SortableItem({ section, selectedId, onSelect, onDelete, onAddChild, onOpenComponentModal, depth = 0 }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, data: { ...section } });

  const [expanded, setExpanded] = useState(true);
  const [showComponentSelector, setShowComponentSelector] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginLeft: `${depth * 12}px`, // Indentation for children
  };

  const isActive = selectedId === section.id;
  const Icon = SECTION_ICONS[section.type] || Layout;
  const isStructural = ['section', 'row', 'column'].includes(section.type);

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        onClick={() => onSelect(section.id)}
        className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isActive ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'}`}
      >
        <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
        </div>

        {isStructural && section.children && section.children.length > 0 && (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
        {isStructural && (!section.children || section.children.length === 0) && (
          <div className="w-4"></div>
        )}


        <div className={`p-1.5 rounded-md ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold truncate ${isActive ? 'text-brand-900 dark:text-brand-100' : 'text-slate-700 dark:text-slate-300'}`}>
            {getLabel(section.type)}
          </p>
        </div>

        <button
          onClick={(e) => onDelete(section.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isStructural && expanded && (
        <div className="mt-2 pl-2 border-l-2 border-slate-100 dark:border-slate-800 border-dashed">
          {section.children?.map(child => (
            <SortableItem
              key={child.id}
              section={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onOpenComponentModal={onOpenComponentModal}
              depth={depth + 1}
            />
          ))}
          {/* Quick Add inside structural block */}
          <div className="ml-3 mt-1 pl-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (section.type === 'section') onAddChild(section.id, 'row');
                else if (section.type === 'row') onAddChild(section.id, 'column');
                else onOpenComponentModal(section.id);
              }}
              className="text-[10px] flex items-center gap-1 font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider py-1"
            >
              <Plus className="w-3 h-3" /> Add {section.type === 'section' ? 'Row' : section.type === 'row' ? 'Column' : 'Component'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Draggable item for the Library Panel
function DraggableLibraryItem({ type, onClick }: { type: SectionType, onClick: () => void }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `library-${type}`,
    data: { isLibraryItem: true, type }
  });

  const Icon = SECTION_ICONS[type];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-grab active:cursor-grabbing group"
    >
      <Icon className="w-4 h-4 group-hover:text-brand-600 transition-colors" />
      <span className="truncate w-full text-center">{getLabel(type)}</span>
    </div>
  );
}


export default function Sidebar({ sections, selectedId, onSelect, onUpdate }: SidebarProps) {
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [modalTargetId, setModalTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addNode = (type: SectionType, parentId: string | null = null) => {
    const newNode: CustomizerSection = {
      id: generateId(),
      type,
      settings: {},
      styles: { paddingTop: type === 'section' ? 40 : 0, paddingBottom: type === 'section' ? 40 : 0 },
      children: ['section', 'row', 'column'].includes(type) ? [] : undefined
    };

    if (parentId) {
      const updatedSections = updateBlockInTree(sections, parentId, (block) => {
        return { ...block, children: [...(block.children || []), newNode] };
      });
      onUpdate(updatedSections);
    } else {
      onUpdate([...sections, newNode]);
    }

    onSelect(newNode.id);
  };

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(removeBlockFromTree(sections, id));
    if (selectedId === id) onSelect(null);
  };


  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    // Handle dropping from Library
    if (active.id.toString().startsWith('library-')) {
      const draggedType = active.id.toString().replace('library-', '') as SectionType;

      const targetNode = findBlockInTree(sections, over.id as string);

      if (targetNode && ['section', 'row', 'column'].includes(targetNode.type)) {
        // Drop inside structural node
        addNode(draggedType, targetNode.id);
      } else {
        // Drop at root
        addNode(draggedType);
      }
      return;
    }

    if (active.id === over.id) return;

    // Moving existing blocks
    const sourceNode = findBlockInTree(sections, active.id as string);
    const targetNode = findBlockInTree(sections, over.id as string);

    if (!sourceNode || !targetNode) return;

    let newTree = removeBlockFromTree(sections, active.id as string);

    // If dropping ON a structural node, put it inside it as a child
    if (['section', 'row', 'column'].includes(targetNode.type)) {
      newTree = updateBlockInTree(newTree, targetNode.id, (block) => {
        return { ...block, children: [...(block.children || []), sourceNode] };
      });
      onUpdate(newTree);
      return;
    }

    // Otherwise, dropping on a normal node. Insert sibling
    const recursiveInsert = (blocks: CustomizerSection[]): CustomizerSection[] => {
      const index = blocks.findIndex(b => b.id === targetNode.id);
      if (index !== -1) {
        const newArray = [...blocks];
        newArray.splice(index, 0, sourceNode);
        return newArray;
      }
      return blocks.map(b => {
        if (b.children) {
          return { ...b, children: recursiveInsert(b.children) };
        }
        return b;
      });
    };

    onUpdate(recursiveInsert(newTree));
  };

  const flatBlocks = flattenTree(sections);
  const activeDragNode = activeDragId ? flatBlocks.find(b => b.id === activeDragId) : null;

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1 mb-4 select-none">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flatBlocks.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={deleteNode}
                onAddChild={(parentId, type) => addNode(type, parentId)}
                onOpenComponentModal={setModalTargetId}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeDragId?.toString().startsWith('library-') ? (
              <div className="bg-white border-2 border-brand-500 shadow-xl p-2 rounded-lg opacity-80 flex items-center gap-2">
                {(() => {
                  const type = activeDragId.toString().replace('library-', '') as SectionType;
                  const Icon = SECTION_ICONS[type] || Layout;
                  return <Icon className="w-4 h-4 text-brand-500" />;
                })()}
                <span className="text-xs font-bold text-brand-700">
                  {getLabel(activeDragId.toString().replace('library-', '') as SectionType)}
                </span>
              </div>
            ) : activeDragNode ? (
              <div className="bg-white border-2 border-brand-500 shadow-xl p-2 rounded-lg opacity-80 flex items-center gap-2">
                {(() => {
                  const Icon = SECTION_ICONS[activeDragNode.type] || Layout;
                  return <Icon className="w-4 h-4 text-brand-500" />;
                })()}
                <span className="text-xs font-bold text-brand-700">{getLabel(activeDragNode.type)}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {sections.length === 0 && (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No nodes added</p>
            <p className="text-[10px] text-slate-400 mt-1">Start by adding a layout section</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
        <button
          onClick={() => setIsAddSectionOpen(!isAddSectionOpen)}
          className="w-full flex items-center justify-between px-1 py-3 group"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-brand-600 transition-colors">Library</p>
          {isAddSectionOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
          )}
        </button>

        <div className={`grid grid-cols-2 gap-2 flex-1 overflow-y-auto space-y-1 mb-4 transition-all duration-300 ${isAddSectionOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>
          {/* Prioritize Layout Elements */}
          <div className="col-span-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Layout</p>
            <div className="grid grid-cols-3 gap-2">
              {(['section', 'row', 'column'] as SectionType[]).map((type) => (
                <DraggableLibraryItem key={type} type={type} onClick={() => addNode(type)} />
              ))}
            </div>
          </div>


          {(Object.keys(SECTION_ICONS) as SectionType[]).filter(t => !['section', 'row', 'column'].includes(t)).map((type) => (
            <DraggableLibraryItem
              key={type}
              type={type}
              onClick={() => {
                if (selectedId) {
                  const selectedBlock = flatBlocks.find(b => b.id === selectedId);
                  if (selectedBlock && ['section', 'row', 'column'].includes(selectedBlock.type)) {
                    addNode(type, selectedId);
                    return;
                  }
                }
                addNode(type);
              }}
            />
          ))}
        </div>
      </div>

      {/* Component Library Modal */}
      {modalTargetId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setModalTargetId(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Component</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a widget to append inside the current block.</p>
              </div>
              <button onClick={() => setModalTargetId(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(Object.keys(SECTION_ICONS) as SectionType[]).filter(t => !['section', 'row', 'column'].includes(t)).map((type) => {
                  const Icon = SECTION_ICONS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        addNode(type, modalTargetId);
                        setModalTargetId(null);
                      }}
                      className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-600 dark:group-hover:bg-brand-900/50 transition-colors">
                        <Icon className="w-6 h-6 text-slate-500 group-hover:text-brand-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">{getLabel(type)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
