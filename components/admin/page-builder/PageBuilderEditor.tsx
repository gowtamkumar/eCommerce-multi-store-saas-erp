"use client";

import { fetchAPI } from '@/lib/api';
import { cloneSection, generateSectionId } from '@/lib/page-builder-utils';
import { defaultSectionStyles, PageBuilderSection, SectionType } from '@/types/page-builder';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Eye, LayoutTemplate, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import SectionEditor from './SectionEditor';
import SectionLibrary from './SectionLibrary';
import TemplateSelector from './TemplateSelector';

interface PageBuilderEditorProps {
  pageId: string;
  initialData: {
    title: string;
    slug: string;
    isHomePage: boolean;
    status: 'draft' | 'published';
    sections: PageBuilderSection[];
    metaTitle: string;
    metaDescription: string;
  };
}

// Sortable wrapper for sections
function SortableSection({ section, onUpdate, onDelete, onDuplicate }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionEditor
        section={section}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function PageBuilderEditor({ pageId, initialData }: PageBuilderEditorProps) {
  const router = useRouter();
  const [sections, setSections] = useState<PageBuilderSection[]>(initialData.sections || []);
  const [pageData, setPageData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addSection = (type: SectionType) => {
    const newSection: PageBuilderSection = {
      id: generateSectionId(),
      type,
      content: {},
      styles: { ...defaultSectionStyles },
      order: sections.length,
      isExpanded: true, // Auto-expand new sections
    };
    setSections([...sections, newSection]);
    toast.success(`${type} section added!`);
  };

  const updateSection = (id: string, updatedSection: PageBuilderSection) => {
    setSections(sections.map(s => s.id === id ? updatedSection : s));
  };

  const deleteSection = (id: string) => {
    if (confirm('Delete this section?')) {
      setSections(sections.filter(s => s.id !== id));
      toast.success('Section deleted');
    }
  };

  const duplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) {
      const cloned = cloneSection(section);
      const index = sections.findIndex(s => s.id === id);
      const newSections = [...sections];
      newSections.splice(index + 1, 0, cloned);
      setSections(newSections);
      toast.success('Section duplicated!');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = pageId === 'new' ? '/pages' : `/pages/${pageId}`;
      const method = pageId === 'new' ? 'POST' : 'PUT';

      const res = await fetchAPI(url, {
        method,
        body: JSON.stringify({
          ...pageData,
          sections,
        }),
      });

      if (res.success) {
        toast.success('Page saved successfully!');
        if (pageId === 'new' && res.data?.id) {
          router.push(`/admin/pages/${res.data.id}`);
        }
      } else {
        toast.error(res.message || 'Failed to save page');
      }
    } catch (error) {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const previewUrl = pageData.isHomePage ? '/' : `/${pageData.slug}`;
    window.open(previewUrl, '_blank');
  };

  const handleTemplateSelect = (newSections: PageBuilderSection[]) => {
    setSections(newSections);
    toast.success('Template applied successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/pages"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <input
                  type="text"
                  value={pageData.title}
                  onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                  placeholder="Page Title"
                  className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  {sections.length} section{sections.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <LayoutTemplate className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Sidebar - Section Library */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto shrink-0">
          <SectionLibrary onAddSection={addSection} />
        </div>

        {/* Center - Sections Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {sections.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                No sections yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Add your first section from the library on the left
              </p>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="mt-6 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-brand-500 transition-all text-slate-900 dark:text-white font-medium flex items-center gap-2 mx-auto"
              >
                <LayoutTemplate className="w-4 h-4" />
                Choose a Template
              </button>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onUpdate={(updated: PageBuilderSection) => updateSection(section.id, updated)}
                      onDelete={() => deleteSection(section.id)}
                      onDuplicate={() => duplicateSection(section.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Right Sidebar - Page Settings */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto shrink-0">
          <h3 className="text-lg font-bold mb-4">Page Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={pageData.slug}
                onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pageData.isHomePage}
                  onChange={(e) => setPageData({ ...pageData, isHomePage: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Set as Homepage</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={pageData.status}
                onChange={(e) => setPageData({ ...pageData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                type="text"
                value={pageData.metaTitle}
                onChange={(e) => setPageData({ ...pageData, metaTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                value={pageData.metaDescription}
                onChange={(e) => setPageData({ ...pageData, metaDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </div>
      </div>
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
