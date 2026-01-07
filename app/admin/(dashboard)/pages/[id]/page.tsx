"use client";

import RichEditor from "@/components/admin/RichEditor";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Layout,
    Loader2,
    Save,
    Send,
    ShoppingCart,
    Trash2,
    Type
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Section {
    id: string;
    type: "hero" | "features" | "product-grid" | "rich-text" | "faq" | "cta";
    content: any;
}

interface PageData {
    _id?: string;
    title: string;
    slug: string;
    isHomePage: boolean;
    status: "draft" | "published";
    sections: Section[];
    metaTitle: string;
    metaDescription: string;
}

const SECTION_TYPES = [
    { type: "hero", label: "Hero Banner", icon: Layout },
    { type: "product-grid", label: "Product Grid", icon: ShoppingCart },
    { type: "features", label: "Features List", icon: CheckCircle2 },
    { type: "rich-text", label: "Rich Text Content", icon: Type },
    { type: "faq", label: "FAQ Section", icon: HelpCircle },
    { type: "cta", label: "Call to Action", icon: Send },
];

export default function PageBuilder({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "new";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
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
            const res = await fetch(`/api/pages/${resolvedParams.id}`);
            const json = await res.json();
            if (json.success) {
                setData(json.page);
            } else {
                toast.error("Page not found");
                router.push("/admin/pages");
            }
        } catch (error) {
            toast.error("Failed to load page");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = isNew ? "/api/pages" : `/api/pages/${resolvedParams.id}`;
            const method = isNew ? "POST" : "PUT";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Page saved successfully");
                if (isNew) {
                    router.push(`/admin/pages/${json.page._id}`);
                }
            } else {
                toast.error(json.error || "Failed to save page");
            }
        } catch (error) {
            toast.error("Error saving page");
        } finally {
            setSaving(false);
        }
    };

    const addSection = (type: any) => {
        const newSection: Section = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: {},
        };
        setData({ ...data, sections: [...data.sections, newSection] });
    };

    const removeSection = (id: string) => {
        setData({ ...data, sections: data.sections.filter((s) => s.id !== id) });
    };

    const updateSectionContent = (id: string, content: any) => {
        setData({
            ...data,
            sections: data.sections.map((s) =>
                s.id === id ? { ...s, content: { ...s.content, ...content } } : s
            ),
        });
    };

    const moveSection = (index: number, direction: "up" | "down") => {
        const newSections = [...data.sections];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        [newSections[index], newSections[targetIndex]] = [
            newSections[targetIndex],
            newSections[index],
        ];
        setData({ ...data, sections: newSections });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/pages"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                        {isNew ? "Create Page" : "Edit Page"}
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isNew ? "Create Page" : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Content / Builder */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-brand-600" /> Page Layout
                        </h2>

                        <div className="space-y-4">
                            {data.sections.map((section, index) => (
                                <div
                                    key={section.id}
                                    className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => moveSection(index, "up")}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => moveSection(index, "down")}
                                                    disabled={index === data.sections.length - 1}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-widest">
                                                {section.type} Section
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeSection(section.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Section-specific Editor Fields */}
                                        {section.type === "hero" && (
                                            <div className="grid grid-cols-1 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Headline"
                                                    value={section.content.headline || ""}
                                                    onChange={(e) =>
                                                        updateSectionContent(section.id, {
                                                            headline: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                                <textarea
                                                    placeholder="Subline"
                                                    value={section.content.subline || ""}
                                                    onChange={(e) =>
                                                        updateSectionContent(section.id, {
                                                            subline: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </div>
                                        )}

                                        {section.type === "rich-text" && (
                                            <RichEditor
                                                content={section.content.html || ""}
                                                onChange={(html) =>
                                                    updateSectionContent(section.id, { html })
                                                }
                                            />
                                        )}

                                        {section.type === "product-grid" && (
                                            <div className="text-center py-4 text-slate-500 text-sm">
                                                This will render your product collection in a grid.
                                            </div>
                                        )}

                                        {section.type === "faq" && (
                                            <div className="grid grid-cols-1 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Section Title (Optional)"
                                                    value={section?.content?.title || ""}
                                                    onChange={(e) =>
                                                        updateSectionContent(section.id, {
                                                            title: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                                <textarea
                                                    placeholder="Description (Optional)"
                                                    value={section.content?.description || ""}
                                                    onChange={(e) =>
                                                        updateSectionContent(section.id, {
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                            </div>
                                        )}

                                        {section.type === "cta" && (
                                            <div className="grid grid-cols-1 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Headline"
                                                    value={section.content?.headline || ""}
                                                    onChange={(e) =>
                                                        updateSectionContent(section.id, {
                                                            headline: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                                <textarea
                                                    placeholder="Subline text..."
                                                    value={section.content?.subline || ""}
                                                    onChange={(e) =>
                                                        updateSectionContent(section.id, {
                                                            subline: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Button Label"
                                                        value={section.content?.buttonLabel || ""}
                                                        onChange={(e) =>
                                                            updateSectionContent(section.id, {
                                                                buttonLabel: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Button Link (e.g. /products)"
                                                        value={section.content?.buttonLink || ""}
                                                        onChange={(e) =>
                                                            updateSectionContent(section.id, {
                                                                buttonLink: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {data.sections.length === 0 && (
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl py-12 text-center text-slate-400">
                                    No sections added yet. Start by adding a block below.
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className="flex flex-wrap gap-2">
                                {SECTION_TYPES.map((st) => (
                                    <button
                                        key={st.type}
                                        onClick={() => addSection(st.type)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all font-semibold"
                                    >
                                        <st.icon className="w-4 h-4 text-brand-600" />
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Settings Sidebar */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Page Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Page Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData({ ...data, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    placeholder="e.g. About Us"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Slug (URL Path)
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">/</span>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        disabled={data.isHomePage}
                                        onChange={(e) => setData({ ...data, slug: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 disabled:opacity-50"
                                        placeholder="about-us"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Set as Home Page
                                </span>
                                <input
                                    type="checkbox"
                                    checked={data.isHomePage}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            isHomePage: e.target.checked,
                                            slug: e.target.checked ? "" : data.slug,
                                        })
                                    }
                                    className="w-5 h-5 rounded accent-brand-600"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            status: e.target.value as "draft" | "published",
                                        })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            SEO Settings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    value={data.metaTitle}
                                    onChange={(e) =>
                                        setData({ ...data, metaTitle: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    Meta Description
                                </label>
                                <textarea
                                    value={data.metaDescription}
                                    onChange={(e) =>
                                        setData({ ...data, metaDescription: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
