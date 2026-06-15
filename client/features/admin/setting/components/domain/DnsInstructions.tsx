"use client";

// Gateway targets are deployment-specific. Configure them per-environment so
// the instructions always point at the real reverse proxy rather than a
// placeholder. Fallbacks are clearly marked so a misconfiguration is obvious.
const GATEWAY_HOST = process.env.NEXT_PUBLIC_GATEWAY_HOST || "gateway.your-saas.com";
const GATEWAY_IP = process.env.NEXT_PUBLIC_GATEWAY_IP || "<your-server-ip>";

export function DnsInstructions() {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <h3 className="font-bold text-slate-900 dark:text-white">
        DNS Setup Instructions
      </h3>
      <p className="text-sm text-slate-500">
        Linking a custom domain takes two steps: (1) prove ownership with the{" "}
        <strong>TXT</strong> record shown on each pending domain above, then (2)
        route traffic to us with the <strong>CNAME</strong> (or{" "}
        <strong>A</strong>) record below. Configure these in your registrar&apos;s
        portal (e.g. GoDaddy, Cloudflare, Namecheap).
      </p>

      <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl text-xs text-slate-500">
        <span className="font-bold text-slate-700 dark:text-slate-300">Step 1 — Verify ownership: </span>
        add the <strong>TXT</strong> record displayed on your pending domain card
        (host <span className="font-mono">_omnicart-verify.&lt;your-domain&gt;</span>),
        then click <strong>Verify DNS</strong>.
      </div>

      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-1">
        Step 2 — Route traffic
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
              {GATEWAY_HOST}
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
            <div className="text-slate-600 dark:text-slate-300 break-all">{GATEWAY_IP}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
