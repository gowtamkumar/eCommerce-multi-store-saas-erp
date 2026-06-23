import { motion } from "framer-motion";
import { BanknoteArrowDown, Plus, X, Percent } from "lucide-react";
export default function CurrenciesSetting({
    formData,
    setFormData,
}: {
    formData: any;
    setFormData: any;
}) {
    return <motion.div
        key="currencies"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
        <div className="flex items-center gap-2 mb-2">
            <BanknoteArrowDown className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Localization & Currencies
            </h2>
        </div>

        {/* Supported Currencies List */}
        <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                Manage Currencies
            </label>
            <div className="grid gap-4">
                {formData.supportedCurrencies?.map(
                    (currency: any, index: number) => (
                        <div
                            key={index}
                            className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative group transition-all"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    const newCurrencies =
                                        formData.supportedCurrencies.filter(
                                            (_: any, i: number) => i !== index,
                                        );
                                    setFormData({
                                        ...formData,
                                        supportedCurrencies: newCurrencies,
                                    });
                                }}
                                className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Name
                                    </span>
                                    <input
                                        type="text"
                                        value={currency.name}
                                        onChange={(e) => {
                                            const next = [
                                                ...formData.supportedCurrencies,
                                            ];
                                            next[index].name = e.target.value;
                                            setFormData({
                                                ...formData,
                                                supportedCurrencies: next,
                                            });
                                        }}
                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Code
                                    </span>
                                    <input
                                        type="text"
                                        value={currency.code}
                                        onChange={(e) => {
                                            const next = [
                                                ...formData.supportedCurrencies,
                                            ];
                                            next[index].code =
                                                e.target.value.toUpperCase();
                                            setFormData({
                                                ...formData,
                                                supportedCurrencies: next,
                                            });
                                        }}
                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Symbol
                                    </span>
                                    <input
                                        type="text"
                                        value={currency.symbol}
                                        onChange={(e) => {
                                            const next = [
                                                ...formData.supportedCurrencies,
                                            ];
                                            next[index].symbol = e.target.value;
                                            setFormData({
                                                ...formData,
                                                supportedCurrencies: next,
                                            });
                                        }}
                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Rate (vs Base)
                                    </span>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={currency.rate}
                                        onChange={(e) => {
                                            const next = [
                                                ...formData.supportedCurrencies,
                                            ];
                                            next[index].rate = parseFloat(
                                                e.target.value,
                                            );
                                            setFormData({
                                                ...formData,
                                                supportedCurrencies: next,
                                            });
                                        }}
                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    ),
                )}
            </div>

            <button
                type="button"
                onClick={() => {
                    setFormData({
                        ...formData,
                        supportedCurrencies: [
                            ...formData.supportedCurrencies,
                            { code: "", symbol: "", rate: 1, name: "" },
                        ],
                    });
                }}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-2xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold"
            >
                <Plus className="w-5 h-5" />
                Add New Currency
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Base Store Currency
                </label>
                <select
                    value={formData.currency}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            currency: e.target.value,
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                >
                    {formData.supportedCurrencies?.map((c: any) => (
                        <option key={c.code} value={c.code}>
                            {c.name} ({c.code})
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Default Symbol
                </label>
                <div className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                    {formData.supportedCurrencies?.find(
                        (c: any) => c.code === formData.currency,
                    )?.symbol || "৳"}
                </div>
            </div>
        </div>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-6" />

        <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Tax Automation Settings (Sales Tax & VAT)
            </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tax Provider
                </label>
                <select
                    value={formData.financeConfig?.taxProvider || "local"}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            financeConfig: {
                                ...formData.financeConfig,
                                taxProvider: e.target.value,
                            },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                >
                    <option value="local">Local Lookup (DB rules)</option>
                    <option value="taxjar">TaxJar API</option>
                    <option value="avalara">Avalara API</option>
                </select>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tax Calculation Mode
                </label>
                <select
                    value={formData.financeConfig?.taxMode || "test"}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            financeConfig: {
                                ...formData.financeConfig,
                                taxMode: e.target.value,
                            },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                >
                    <option value="test">Sandbox / Testing</option>
                    <option value="production">Production</option>
                </select>
            </div>

            {formData.financeConfig?.taxProvider !== "local" && (
                <div className="md:col-span-2 space-y-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tax Provider API Key
                    </label>
                    <input
                        type="password"
                        value={formData.financeConfig?.taxApiKey || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                financeConfig: {
                                    ...formData.financeConfig,
                                    taxApiKey: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter API Key for TaxJar or Avalara"
                    />
                </div>
            )}
        </div>
    </motion.div>
}