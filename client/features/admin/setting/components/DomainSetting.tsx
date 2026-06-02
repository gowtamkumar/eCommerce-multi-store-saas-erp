import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2, Star, Trash2, CheckCircle2, Plus } from "lucide-react";

export const DomainSetting = () => {
    const [tenantInfo, setTenantInfo] = useState<any>(null);
    const [domainInput, setDomainInput] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Track loading states for specific domain actions
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [primaryId, setPrimaryId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const res = await fetchAPI("/tenants/info");
                setTenantInfo(res.data);
            } catch (err) {
                console.error("Failed to fetch tenant info", err);
            }
        };
        fetchTenant();
    }, []);

    const handleAddDomain = async () => {
        if (!domainInput) return;
        setIsUpdating(true);
        try {
            const res = await fetchAPI("/tenants/custom-domain", {
                method: "PATCH",
                body: JSON.stringify({ customDomain: domainInput }),
            });
            setTenantInfo(res.data);
            setDomainInput("");
            toast.success("Custom domain added successfully!");
        } catch (err: any) {
            toast.error(err.message || "Failed to add domain");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerifyStatus = async (domainId: string) => {
        setVerifyingId(domainId);
        try {
            const res = await fetchAPI(`/tenants/custom-domain/verify/${domainId}`, {
                method: "POST",
            });
            setTenantInfo(res.data);
            toast.success("Domain verified successfully!");
        } catch (err: any) {
            toast.error(err.message || "Verification failed");
        } finally {
            setVerifyingId(null);
        }
    };

    const handleRemoveDomain = async (domainId: string) => {
        if (!confirm("Are you sure you want to remove this custom domain? This will stop all traffic routing to it.")) return;
        setRemovingId(domainId);
        try {
            const res = await fetchAPI(`/tenants/custom-domain/${domainId}`, {
                method: "DELETE",
            });
            setTenantInfo(res.data);
            toast.success("Custom domain removed!");
        } catch (err: any) {
            toast.error(err.message || "Failed to remove domain");
        } finally {
            setRemovingId(null);
        }
    };

    const handleSetPrimary = async (domainId: string) => {
        setPrimaryId(domainId);
        try {
            const res = await fetchAPI(`/tenants/custom-domain/primary/${domainId}`, {
                method: "PATCH",
            });
            setTenantInfo(res.data);
            toast.success("Primary domain updated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to set primary domain");
        } finally {
            setPrimaryId(null);
        }
    };

    if (!tenantInfo)
        return (
            <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        );

    const domainsList = tenantInfo.domains || [];

    return (
        <motion.div
            key="domain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Domains Management
                </h2>
            </div>

            <div className="space-y-8">
                {/* Domains List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Configured Domains
                    </h3>
                    
                    {domainsList.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-slate-500">No custom domains configured yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {domainsList.map((domain: any) => (
                                    <motion.div
                                        key={domain.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                        {domain.hostname}
                                                    </span>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            domain.status === "active"
                                                                ? "bg-green-105 text-green-600 dark:bg-green-900/30"
                                                                : "bg-amber-105 text-amber-600 dark:bg-amber-900/30"
                                                        }`}
                                                    >
                                                        {domain.status}
                                                    </span>
                                                    {domain.isPrimary && (
                                                        <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-650 dark:bg-brand-900/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-current" /> Primary
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Added on {new Date(domain.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Set Primary Button */}
                                                {domain.status === "active" && !domain.isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(domain.id)}
                                                        disabled={!!primaryId}
                                                        className="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 hover:text-brand-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                                                    >
                                                        {primaryId === domain.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Star className="w-3.5 h-3.5" />
                                                        )}
                                                        Make Primary
                                                    </button>
                                                )}

                                                {/* Verify Button */}
                                                {domain.status !== "active" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyStatus(domain.id)}
                                                        disabled={!!verifyingId}
                                                        className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
                                                    >
                                                        {verifyingId === domain.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        )}
                                                        Verify DNS
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDomain(domain.id)}
                                                    disabled={!!removingId}
                                                    className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 rounded-xl transition-all flex items-center justify-center"
                                                >
                                                    {removingId === domain.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline Verification Instructions for Pending Domains */}
                                        {domain.status !== "active" && domain.verificationToken && (
                                            <div className="mt-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-950/30">
                                                        Verification Required
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        Create a <strong>TXT</strong> record at your domain registrar to verify ownership:
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                                    <div>
                                                        <span className="text-[9px] text-slate-400 block font-sans">Type</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">TXT</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] text-slate-400 block font-sans">Host / Name</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300 break-all">_omnicart-verify.{domain.hostname}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] text-slate-400 block font-sans">Value / Content</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300 break-all select-all">{domain.verificationToken}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Add Domain */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Add Custom Domain
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                            placeholder="e.g., shop.yourbrand.com"
                            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={handleAddDomain}
                            disabled={isUpdating || !domainInput}
                            className="px-6 py-3.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Plus className="w-4 h-4" /> Add Domain
                        </button>
                    </div>
                </div>

                {/* DNS Instructions */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        DNS Setup Instructions
                    </h3>
                    <p className="text-sm text-slate-500">
                        To link your custom domain to your storefront, configure the following DNS records in your registrar's portal (e.g. GoDaddy, Cloudflare, Namecheap).
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Subdomains (Recommended)
                                </span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase">
                                    CNAME
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                <div className="text-slate-400">Type</div>
                                <div className="text-slate-400">Host</div>
                                <div className="text-slate-400">Points to</div>
                                <div className="text-slate-600 dark:text-slate-350">CNAME</div>
                                <div className="text-slate-600 dark:text-slate-350">shop (or host)</div>
                                <div className="text-slate-600 dark:text-slate-350 break-all">
                                    cname.your-saas.com
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Root Domains (Alternative)
                                </span>
                                <span className="text-[10px] font-bold text-amber-500 uppercase">
                                    A Record
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                <div className="text-slate-400">Type</div>
                                <div className="text-slate-400">Host</div>
                                <div className="text-slate-400">IP Value</div>
                                <div className="text-slate-600 dark:text-slate-350">A</div>
                                <div className="text-slate-600 dark:text-slate-350">@</div>
                                <div className="text-slate-600 dark:text-slate-350">
                                    76.76.21.21
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};