import React, { useCallback } from "react";
import { Layout, Plus } from "lucide-react";
import FooterSectionItem from "./FooterSectionItem";

interface FooterSectionsManagerProps {
    footerData: any;
    collapsedFooterSections: Set<number>;
    setCollapsedFooterSections: (sections: Set<number>) => void;
    onUpdateSections: (sections: any[]) => void;
    brandName: string;
}

const FooterSectionsManager = React.memo(({
    footerData,
    collapsedFooterSections,
    setCollapsedFooterSections,
    onUpdateSections,
    brandName
}: FooterSectionsManagerProps) => {
    const sections = footerData?.sections || [];

    const handleAddSection = useCallback(() => {
        const newSection = {
            title: "",
            order: sections.length,
            links: [],
        };
        onUpdateSections([...sections, newSection]);
    }, [sections, onUpdateSections]);

    const handleSmartInitialize = useCallback(() => {
        onUpdateSections([
            {
                title: "Shop Categories",
                order: 0,
                links: [
                    { label: "All Products", href: "/products", order: 0, isOpenInNewTab: false, isActive: true },
                    { label: "Hot Releases", href: "/products?sort=newest", order: 1, isOpenInNewTab: false, isActive: true },
                ],
            },
            {
                title: "Support",
                order: 1,
                links: [
                    { label: "Track Order", href: "/profile", order: 0, isOpenInNewTab: false, isActive: true },
                    { label: "Help Center", href: "/contact", order: 1, isOpenInNewTab: false, isActive: true },
                ],
            },
        ]);
        // Also update description and copyright? That should probably be handled in the main component's initialize logic if needed.
    }, [onUpdateSections]);

    const handleUpdateSection = useCallback((index: number, field: string, value: any) => {
        const next = [...sections];
        next[index] = { ...next[index], [field]: value };
        onUpdateSections(next);
    }, [sections, onUpdateSections]);

    const handleRemoveSection = useCallback((index: number) => {
        const next = sections.filter((_: any, i: number) => i !== index);
        onUpdateSections(next);
    }, [sections, onUpdateSections]);

    const handleToggleCollapse = useCallback((index: number) => {
        const newCollapsed = new Set(collapsedFooterSections);
        if (newCollapsed.has(index)) {
            newCollapsed.delete(index);
        } else {
            newCollapsed.add(index);
        }
        setCollapsedFooterSections(newCollapsed);
    }, [collapsedFooterSections, setCollapsedFooterSections]);

    const handleAddLink = useCallback((sIdx: number) => {
        const next = [...sections];
        if (!next[sIdx].links) next[sIdx].links = [];
        next[sIdx].links.push({
            label: "",
            href: "",
            order: next[sIdx].links.length,
            isOpenInNewTab: false,
            isActive: true,
        });
        onUpdateSections(next);
    }, [sections, onUpdateSections]);

    const handleUpdateLink = useCallback((sIdx: number, lIdx: number, field: string, value: any) => {
        const next = [...sections];
        next[sIdx].links[lIdx] = { ...next[sIdx].links[lIdx], [field]: value };
        onUpdateSections(next);
    }, [sections, onUpdateSections]);

    const handleRemoveLink = useCallback((sIdx: number, lIdx: number) => {
        const next = [...sections];
        next[sIdx].links = next[sIdx].links.filter((_: any, i: number) => i !== lIdx);
        onUpdateSections(next);
    }, [sections, onUpdateSections]);

    return (
        <div className="space-y-8 mt-12">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-[0.2em]">
                        Modular Sections
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage your footer links and columns</span>
                </div>
                <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-5 py-2.5 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white rounded-2xl font-black transition-all flex items-center gap-2 shadow-xl active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Create New Section
                </button>
            </div>

            {sections.length === 0 ? (
                <div className="group text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500/30 transition-all duration-500">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:rotate-6 transition-transform">
                        <Layout className="w-10 h-10 text-brand-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm mb-4">
                        Your footer is empty
                    </p>
                    <button
                        type="button"
                        onClick={handleSmartInitialize}
                        className="px-8 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all"
                    >
                        Smart Initialize
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...sections]
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((section, index) => (
                            <FooterSectionItem
                                key={index}
                                section={section}
                                index={index}
                                isCollapsed={collapsedFooterSections.has(index)}
                                onToggleCollapse={handleToggleCollapse}
                                onUpdateSection={handleUpdateSection}
                                onRemoveSection={handleRemoveSection}
                                onAddLink={handleAddLink}
                                onUpdateLink={handleUpdateLink}
                                onRemoveLink={handleRemoveLink}
                            />
                        ))}
                </div>
            )}
        </div>
    );
});

export default FooterSectionsManager;
