"use client";

import CustomizerEditor from "@/components/admin/customizer/CustomizerEditor";
import { fetchAPI } from "@/lib/api";
import { PageData } from "@/types/customizer";
import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CustomizerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [data, setData] = useState<PageData>({
    title: "",
    slug: "",
    isHomePage: false,
    status: "published",
    content: { sections: [] },
  });

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    }
  }, [isNew]);

  const fetchPage = async () => {
    try {
      const res = await fetchAPI(`/pages/${resolvedParams.id}`);
      if (res.success) {
        // Adapt old data structure if needed
        const content = res.data.content || { sections: [] };
        // If old sections existed but were not in 'content', migrate them
        if (res.data.sections && !res.data.content) {
          content.sections = res.data.sections.map((s: any) => ({
            id: s.id,
            type: s.type === 'hero' ? 'hero-banner' : s.type, // Map old types
            settings: s.content || {},
            styles: s.styles || { paddingTop: 40, paddingBottom: 40 },
          }));
        }
        setData({ ...res.data, content });
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

  return <CustomizerEditor pageId={resolvedParams.id} initialData={data} />;
}
