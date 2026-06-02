"use client";

import CustomizerEditor from "@/features/admin/pages/components/customizer/CustomizerEditor";
import TemplatePicker from "@/features/admin/pages/components/customizer/panels/TemplatePicker";
import { fetchAPI } from "@/services/api";
import { CustomizerSection, PageData } from "@/types/customizer";
import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

const EMPTY_PAGE: PageData = {
  title: "",
  slug: "",
  isHomePage: false,
  status: "draft",
  content: { sections: [] },
};

export default function CustomizerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [data, setData] = useState<PageData>(EMPTY_PAGE);
  const [showTemplatePicker, setShowTemplatePicker] = useState(isNew);

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    }
  }, [isNew]);

  const fetchPage = async () => {
    try {
      const res = await fetchAPI(`/pages/${resolvedParams.id}`);
      if (res.success) {
        const page = res.data;
        const adaptSections = (sections: any[]): CustomizerSection[] => {
          return sections.map((s: any) => ({
            id: s.id,
            type: s.type === 'hero' || s.type === 'hero-banner' ? 'banner' : s.type,
            settings: s.settings || s.content || {},
            styles: s.styles || { paddingTop: 40, paddingBottom: 40 },
            hidden: s.hidden ?? false,
            locked: s.locked ?? false,
            visibility: s.visibility,
            children: s.children ? adaptSections(s.children) : (['section', 'row', 'column'].includes(s.type) ? [] : undefined),
          }));
        };

        setData({
          id: page.id,
          title: page.title || "",
          slug: page.slug || "",
          isHomePage: page.isHomePage || false,
          status: page.status || "published",
          metaTitle: page.metaTitle || "",
          metaDescription: page.metaDescription || "",
          ogImage: page.ogImage || "",
          publishAt: page.publishAt || null,
          typography: page.typography || undefined,
          content: { sections: adaptSections(page.sections || []) },
        });
      } else {
        toast.error("Page not found");
      }
    } catch (error) {
      toast.error("Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <>
      <CustomizerEditor pageId={resolvedParams.id} initialData={data} />
      {showTemplatePicker && (
        <TemplatePicker
          onClose={() => setShowTemplatePicker(false)}
          onSelect={(sections) => {
            setData((prev) => ({ ...prev, content: { sections } }));
            setShowTemplatePicker(false);
          }}
        />
      )}
    </>
  );
}
