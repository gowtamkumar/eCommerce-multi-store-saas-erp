"use client";

export function DnsInstructions() {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <h3 className="font-bold text-slate-900 dark:text-white">
        DNS Setup Instructions
      </h3>
      <p className="text-sm text-slate-500">
        To link your custom domain to your storefront, configure the following DNS records in your registrar&apos;s portal (e.g. GoDaddy, Cloudflare, Namecheap).
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
            <div className="text-slate-600 dark:text-slate-300">CNAME</div>
            <div className="text-slate-600 dark:text-slate-300">shop (or host)</div>
            <div className="text-slate-600 dark:text-slate-300 break-all">
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
            <div className="text-slate-600 dark:text-slate-300">A</div>
            <div className="text-slate-600 dark:text-slate-300">@</div>
            <div className="text-slate-600 dark:text-slate-300">76.76.21.21</div>
          </div>
        </div>
      </div>
    </div>
  );
}
