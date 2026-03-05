import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Layout, Plus, X } from "lucide-react";

export default function FooterSetting({ formData, setFormData, setCollapsedFooterSections, collapsedFooterSections }: any) {
    return <motion.div
        key="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Footer Configuration
                </h2>
            </div>
        </div>

        {/* General Footer Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
            <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase">
                    Footer Description
                </label>
                <textarea
                    value={formData.footerDescription}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            footerDescription: e.target.value,
                        })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm min-h-[100px]"
                    placeholder="Short bio for the footer..."
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase">
                    Copyright Text
                </label>
                <input
                    type="text"
                    value={formData.footerCopyright}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            footerCopyright: e.target.value,
                        })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="© 2026 Your Store. All rights reserved."
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">
                    Include "Heart" keyword to keep the animated heart
                    icon.
                </p>
            </div>
        </div>

        {/* Footer Sections */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider">
                    Footer Sections
                </h3>
                <button
                    type="button"
                    onClick={() => {
                        setFormData({
                            ...formData,
                            footerSections: [
                                ...formData.footerSections,
                                {
                                    title: "",
                                    order: formData.footerSections.length,
                                    links: [],
                                },
                            ],
                        });
                    }}
                    className="px-3 py-1.5 text-xs bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg font-bold transition-all flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" />
                    Add Section
                </button>
            </div>

            {
                formData.footerSections.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Layout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">
                            No footer sections configured
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    ...formData,
                                    footerDescription:
                                        "Elevating your audio experience with premium sound and design.",
                                    footerCopyright: `© ${new Date().getFullYear()} ${formData.brandName}. Made with Heart by Gowtam Kumar.`,
                                    footerSections: [
                                        {
                                            title: "Shop Categories",
                                            order: 0,
                                            links: [
                                                {
                                                    label: "All Products",
                                                    href: "/products",
                                                    order: 0,
                                                    isOpenInNewTab: false,
                                                    isActive: true,
                                                },
                                                {
                                                    label: "Headphones",
                                                    href: "/products?category=headphones",
                                                    order: 1,
                                                    isOpenInNewTab: false,
                                                    isActive: true,
                                                },
                                                {
                                                    label: "Speakers",
                                                    href: "/products?category=speakers",
                                                    order: 2,
                                                    isOpenInNewTab: false,
                                                    isActive: true,
                                                },
                                            ],
                                        },
                                        {
                                            title: "Company",
                                            order: 1,
                                            links: [
                                                {
                                                    label: "About Us",
                                                    href: "/",
                                                    order: 0,
                                                    isOpenInNewTab: false,
                                                    isActive: true,
                                                },
                                                {
                                                    label: "Contact",
                                                    href: "/contact",
                                                    order: 1,
                                                    isOpenInNewTab: false,
                                                    isActive: true,
                                                },
                                                {
                                                    label: "Privacy Policy",
                                                    href: "/privacy",
                                                    order: 2,
                                                    isOpenInNewTab: false,
                                                    isActive: true,
                                                },
                                            ],
                                        },
                                    ],
                                });
                            }}
                            className="mt-4 text-brand-600 font-bold hover:underline"
                        >
                            Initialize with defaults
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {[...formData.footerSections]
                            .sort((a, b) => a.order - b.order)
                            .map((section, sIdx) => (
                                <div
                                    key={sIdx}
                                    className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 relative group/section"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = formData.footerSections.filter(
                                                (_: any, i: number) => i !== sIdx,
                                            );
                                            setFormData({
                                                ...formData,
                                                footerSections: next,
                                            });
                                        }}
                                        className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover/section:opacity-100 transition-opacity shadow-sm z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                                            <div className="md:col-span-8 space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">
                                                    Section Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => {
                                                        const next = [
                                                            ...formData.footerSections,
                                                        ];
                                                        next[sIdx].title = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            footerSections: next,
                                                        });
                                                    }}
                                                    placeholder="e.g. Shop categories"
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                                />
                                            </div>
                                            <div className="md:col-span-4 space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">
                                                    Order
                                                </label>
                                                <input
                                                    type="number"
                                                    value={section.order}
                                                    onChange={(e) => {
                                                        const next = [
                                                            ...formData.footerSections,
                                                        ];
                                                        next[sIdx].order =
                                                            parseInt(e.target.value) || 0;
                                                        setFormData({
                                                            ...formData,
                                                            footerSections: next,
                                                        });
                                                    }}
                                                    className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCollapsed = new Set(collapsedFooterSections);
                                                if (newCollapsed.has(sIdx)) {
                                                    newCollapsed.delete(sIdx);
                                                } else {
                                                    newCollapsed.add(sIdx);
                                                }
                                                setCollapsedFooterSections(newCollapsed);
                                            }}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            title={collapsedFooterSections.has(sIdx) ? "Expand section" : "Collapse section"}
                                        >
                                            {collapsedFooterSections.has(sIdx) ? (
                                                <ChevronDown className="w-5 h-5 text-slate-500" />
                                            ) : (
                                                <ChevronUp className="w-5 h-5 text-slate-500" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Nested Links */}
                                    {!collapsedFooterSections.has(sIdx) && (
                                        <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase text-slate-500">
                                                    Links in this section
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [
                                                            ...formData.footerSections,
                                                        ];
                                                        next[sIdx].links.push({
                                                            label: "",
                                                            href: "",
                                                            order: next[sIdx].links.length,
                                                            isOpenInNewTab: false,
                                                            isActive: true,
                                                        });
                                                        setFormData({
                                                            ...formData,
                                                            footerSections: next,
                                                        });
                                                    }}
                                                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Link
                                                </button>
                                            </div>

                                            <div className="grid gap-3">
                                                {section.links
                                                    .sort((a: any, b: any) => a.order - b.order)
                                                    .map((link: any, lIdx: number) => (
                                                        <div
                                                            key={lIdx}
                                                            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 group/link relative"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = [
                                                                        ...formData.footerSections,
                                                                    ];
                                                                    next[sIdx].links = next[
                                                                        sIdx
                                                                    ].links.filter(
                                                                        (_: any, i: number) => i !== lIdx,
                                                                    );
                                                                    setFormData({
                                                                        ...formData,
                                                                        footerSections: next,
                                                                    });
                                                                }}
                                                                className="absolute -top-1 -right-1 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-red-500 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity z-10"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                            <div className="md:col-span-4 space-y-1">
                                                                <label className="text-[9px] font-bold uppercase text-slate-400">
                                                                    Label
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={link.label}
                                                                    onChange={(e) => {
                                                                        const next = [
                                                                            ...formData.footerSections,
                                                                        ];
                                                                        next[sIdx].links[lIdx].label =
                                                                            e.target.value;
                                                                        setFormData({
                                                                            ...formData,
                                                                            footerSections: next,
                                                                        });
                                                                    }}
                                                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-lg px-2 py-1.5 text-[13px] focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-4 space-y-1">
                                                                <label className="text-[9px] font-bold uppercase text-slate-400">
                                                                    URL
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={link.href}
                                                                    onChange={(e) => {
                                                                        const next = [
                                                                            ...formData.footerSections,
                                                                        ];
                                                                        next[sIdx].links[lIdx].href =
                                                                            e.target.value;
                                                                        setFormData({
                                                                            ...formData,
                                                                            footerSections: next,
                                                                        });
                                                                    }}
                                                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-lg px-2 py-1.5 text-[13px] focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2 space-y-1">
                                                                <label className="text-[9px] font-bold uppercase text-slate-400">
                                                                    Order
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={link.order}
                                                                    onChange={(e) => {
                                                                        const next = [
                                                                            ...formData.footerSections,
                                                                        ];
                                                                        next[sIdx].links[lIdx].order =
                                                                            parseInt(e.target.value) || 0;
                                                                        setFormData({
                                                                            ...formData,
                                                                            footerSections: next,
                                                                        });
                                                                    }}
                                                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-lg px-2 py-1.5 text-[13px] focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2 flex items-center justify-around pb-1.5">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="text-[9px] font-bold uppercase text-slate-400">
                                                                        New Tab
                                                                    </span>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={link.isOpenInNewTab}
                                                                        onChange={(e) => {
                                                                            const next = [
                                                                                ...formData.footerSections,
                                                                            ];
                                                                            next[sIdx].links[
                                                                                lIdx
                                                                            ].isOpenInNewTab =
                                                                                e.target.checked;
                                                                            setFormData({
                                                                                ...formData,
                                                                                footerSections: next,
                                                                            });
                                                                        }}
                                                                        className="w-3.5 h-3.5 text-brand-600 rounded"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="text-[9px] font-bold uppercase text-slate-400">
                                                                        Active
                                                                    </span>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            link.isActive !== false
                                                                        }
                                                                        onChange={(e) => {
                                                                            const next = [
                                                                                ...formData.footerSections,
                                                                            ];
                                                                            next[sIdx].links[
                                                                                lIdx
                                                                            ].isActive = e.target.checked;
                                                                            setFormData({
                                                                                ...formData,
                                                                                footerSections: next,
                                                                            });
                                                                        }}
                                                                        className="w-3.5 h-3.5 text-brand-600 rounded"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                    )}
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    </motion.div>
}