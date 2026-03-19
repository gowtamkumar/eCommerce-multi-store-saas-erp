import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { motion } from "framer-motion";
import { Globe, Loader2 } from "lucide-react";
export const DomainSetting = () => {
    const [tenantInfo, setTenantInfo] = useState<any>(null);
    const [domainInput, setDomainInput] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const res = await fetchAPI("/tenants/info");
                setTenantInfo(res);
                setDomainInput(res.customDomain || "");
            } catch (err) {
                console.error("Failed to fetch tenant info", err);
            }
        };
        fetchTenant();
    }, []);

    const handleUpdateDomain = async () => {
        if (!domainInput) return;
        setIsUpdating(true);
        try {
            const res = await fetchAPI("/tenants/custom-domain", {
                method: "PUT",
                body: JSON.stringify({ customDomain: domainInput }),
            });
            setTenantInfo(res);
            toast.success("Custom domain updated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to update domain");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerifyStatus = async () => {
        setIsVerifying(true);
        try {
            const res = await fetchAPI("/tenants/custom-domain/verify", {
                method: "POST",
            });
            setTenantInfo(res);
            toast.success("Domain status updated!");
        } catch (err: any) {
            toast.error(err.message || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!tenantInfo)
        return (
            <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        );

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
                    Custom Domain
                </h2>
            </div>

            <div className="space-y-8">
                {/* Current Status */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Domain Status
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-mono">
                                    {tenantInfo.customDomain || "No custom domain set"}
                                </span>
                                {tenantInfo.customDomain && (
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tenantInfo.customDomainStatus === "active"
                                            ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                                            : tenantInfo.customDomainStatus === "verified"
                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                                : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                            }`}
                                    >
                                        {tenantInfo.customDomainStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                        {tenantInfo.customDomain &&
                            tenantInfo.customDomainStatus !== "active" && (
                                <button
                                    type="button"
                                    onClick={handleVerifyStatus}
                                    disabled={isVerifying}
                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isVerifying ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Check Status"
                                    )}
                                </button>
                            )}
                    </div>
                </div>

                {/* Edit Domain */}
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Set Custom Domain
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                            placeholder="e.g., shop.yourbrand.com"
                            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={handleUpdateDomain}
                            disabled={
                                isUpdating ||
                                !domainInput ||
                                domainInput === tenantInfo.customDomain
                            }
                            className="px-6 py-3.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            Update Custom Domain
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">
                        Updating your domain will reset your verification status. You will
                        need to verify your DNS again.
                    </p>
                </div>

                {/* DNS Instructions */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        DNS Setup Instructions
                    </h3>
                    <p className="text-sm text-slate-500">
                        To link your custom domain, add the following DNS records through
                        your domain provider (e.g., GoDaddy, Namecheap).
                    </p>

                    <div className="grid gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Recommended (CNAME)
                                </span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase">
                                    Subdomains
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm font-mono p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
                                <div className="text-slate-400">Type</div>
                                <div className="text-slate-400">Host</div>
                                <div className="text-slate-400">Value</div>
                                <div className="text-slate-600 dark:text-slate-300">CNAME</div>
                                <div className="text-slate-600 dark:text-slate-300">@</div>
                                <div className="text-slate-600 dark:text-slate-300">
                                    cname.your-saas.com
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Alternative (A Record)
                                </span>
                                <span className="text-[10px] font-bold text-amber-500 uppercase">
                                    Root Domains
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm font-mono p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
                                <div className="text-slate-400">Type</div>
                                <div className="text-slate-400">Host</div>
                                <div className="text-slate-400">Value</div>
                                <div className="text-slate-600 dark:text-slate-300">A</div>
                                <div className="text-slate-600 dark:text-slate-300">@</div>
                                <div className="text-slate-600 dark:text-slate-300">
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