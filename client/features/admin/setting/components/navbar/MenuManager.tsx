import React, { useCallback } from "react";
import { Menu, Plus } from "lucide-react";
import NavLinkItem from "./NavLinkItem";

interface MenuManagerProps {
    navbarData: any;
    onUpdate: (links: any[]) => void;
}

const MenuManager = React.memo(({ navbarData, onUpdate }: MenuManagerProps) => {
    const links = navbarData?.links || [];

    const handleAddLink = useCallback(() => {
        const newLink = {
            label: "",
            href: "",
            order: links.length,
            isOpenInNewTab: false,
            isActive: true,
        };
        onUpdate([...links, newLink]);
    }, [links, onUpdate]);

    const handleInitializeDefaults = useCallback(() => {
        onUpdate([
            { label: "Home", href: "/", order: 0, isOpenInNewTab: false, isActive: true },
            { label: "Shop", href: "/products", order: 1, isOpenInNewTab: false, isActive: true },
            { label: "Contact", href: "/contact", order: 2, isOpenInNewTab: false, isActive: true },
        ]);
    }, [onUpdate]);

    const handleUpdateLink = useCallback((index: number, field: string, value: any) => {
        const next = [...links];
        next[index] = { ...next[index], [field]: value };
        onUpdate(next);
    }, [links, onUpdate]);

    const handleRemoveLink = useCallback((index: number) => {
        const next = links.filter((_: any, i: number) => i !== index);
        onUpdate(next);
    }, [links, onUpdate]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Menu className="w-5 h-5 text-brand-600" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Navbar Menu
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Link
                </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">
                Manage the main navigation links of your store. Leave
                empty to use default links (Home, Shop, Contact).
            </p>

            <div className="space-y-4">
                {links.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Menu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No custom links yet</p>
                        <button
                            type="button"
                            onClick={handleInitializeDefaults}
                            className="mt-4 text-brand-600 font-bold hover:underline"
                        >
                            Initialize with defaults
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {[...links]
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((link, index) => (
                                <NavLinkItem
                                    key={index}
                                    link={link}
                                    index={index}
                                    onUpdate={handleUpdateLink}
                                    onRemove={handleRemoveLink}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default MenuManager;
