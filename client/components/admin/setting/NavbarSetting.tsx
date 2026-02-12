import { motion } from "framer-motion";
import { Menu, Plus, X } from "lucide-react";

export default function NavbarSetting({
    formData,
    setFormData,
}: {
    formData: any;
    setFormData: any;
}) {
    return <motion.div
        key="navbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Menu className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Navbar Menu
                </h2>
            </div>
            <button
                type="button"
                onClick={() => {
                    setFormData({
                        ...formData,
                        navbarLinks: [
                            ...formData.navbarLinks,
                            {
                                label: "",
                                href: "",
                                order: formData.navbarLinks.length,
                                isOpenInNewTab: false,
                                isActive: true,
                            },
                        ],
                    });
                }}
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
            {formData.navbarLinks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Menu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                        No custom links yet
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                ...formData,
                                navbarLinks: [
                                    {
                                        label: "Home",
                                        href: "/",
                                        order: 0,
                                        isOpenInNewTab: false,
                                        isActive: true,
                                    },
                                    {
                                        label: "Shop",
                                        href: "/products",
                                        order: 1,
                                        isOpenInNewTab: false,
                                        isActive: true,
                                    },
                                    {
                                        label: "Contact",
                                        href: "/contact",
                                        order: 2,
                                        isOpenInNewTab: false,
                                        isActive: true,
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
                <div className="grid gap-4">
                    {[...formData.navbarLinks]
                        .sort((a, b) => a.order - b.order)
                        .map((link, index) => (
                            <div
                                key={index}
                                className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 group relative transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = formData.navbarLinks.filter(
                                            (_, i) => i !== index,
                                        );
                                        setFormData({
                                            ...formData,
                                            navbarLinks: next,
                                        });
                                    }}
                                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const next = [...formData.navbarLinks];
                                                next[index].label = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    navbarLinks: next,
                                                });
                                            }}
                                            placeholder="e.g. Products"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                            URL / Path
                                        </label>
                                        <input
                                            type="text"
                                            value={link.href}
                                            onChange={(e) => {
                                                const next = [...formData.navbarLinks];
                                                next[index].href = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    navbarLinks: next,
                                                });
                                            }}
                                            placeholder="e.g. /products"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                            Order
                                        </label>
                                        <input
                                            type="number"
                                            value={link.order}
                                            onChange={(e) => {
                                                const next = [...formData.navbarLinks];
                                                next[index].order =
                                                    parseInt(e.target.value) || 0;
                                                setFormData({
                                                    ...formData,
                                                    navbarLinks: next,
                                                });
                                            }}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-around pb-2">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                New Tab
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={link.isOpenInNewTab}
                                                onChange={(e) => {
                                                    const next = [
                                                        ...formData.navbarLinks,
                                                    ];
                                                    next[index].isOpenInNewTab =
                                                        e.target.checked;
                                                    setFormData({
                                                        ...formData,
                                                        navbarLinks: next,
                                                    });
                                                }}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                Active
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={link.isActive !== false}
                                                onChange={(e) => {
                                                    const next = [
                                                        ...formData.navbarLinks,
                                                    ];
                                                    next[index].isActive =
                                                        e.target.checked;
                                                    setFormData({
                                                        ...formData,
                                                        navbarLinks: next,
                                                    });
                                                }}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    </motion.div>
}