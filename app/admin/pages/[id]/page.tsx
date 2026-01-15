"use client";

import PageBuilderEditor from "@/components/admin/page-builder/PageBuilderEditor";
import { fetchAPI } from "@/lib/api";
import { defaultSectionStyles } from "@/types/page-builder";
import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PageData {
    id?: string;
    title: string;
    slug: string;
    isHomePage: boolean;
    status: "draft" | "published";
    sections: any[];
    metaTitle: string;
    metaDescription: string;
}

export default function PageBuilder({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "new";

    const [loading, setLoading] = useState(!isNew);
    const [data, setData] = useState<PageData>({
        title: "",
        slug: "",
        isHomePage: false,
        status: "published",
        sections: [],
        metaTitle: "",
        metaDescription: "",
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
                // Ensure all sections have proper structure
                const sections = (res.data.sections || []).map((section: any, index: number) => ({
                    ...section,
                    styles: section.styles || { ...defaultSectionStyles },
                    order: section.order !== undefined ? section.order : index,
                    isExpanded: section.isExpanded !== undefined ? section.isExpanded : false,
                }));
                setData({ ...res.data, sections });
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return <PageBuilderEditor pageId={resolvedParams.id} initialData={data} />;
}
