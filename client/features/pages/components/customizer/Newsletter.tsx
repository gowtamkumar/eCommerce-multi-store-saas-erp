"use client";

import { fetchAPI } from "@/services/api";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import SectionHeader from "./SectionHeader";

interface NewsletterProps {
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  styles?: any;
}

export default function Newsletter({
  title = "Join our Newsletter",
  description = "Get the latest updates and special offers directly in your inbox.",
  buttonText = "Subscribe",
  placeholder = "Enter your email",
  styles
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchAPI("/leads", {
        method: "POST",
        body: JSON.stringify({
          email,
          name: "Newsletter Subscriber",
          subject: "Newsletter Signup",
          message: "User signed up for newsletter from footer/page section."
        }),
      });

      if (res.success || res.id) {
        toast.success("Thanks for subscribing!");
        setEmail("");
      } else {
        toast.error(res.message || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        ...styles,
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
      className="w-full py-20 px-6 rounded-[2.5rem]"
    >
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="newsletter-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#newsletter-grid)" />
        </svg>
      </div>

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-4xl mx-auto">
        <div className={`flex flex-col space-y-10
          ${styles?.textAlign === 'center' ? 'items-center text-center' : ''}
          ${styles?.textAlign === 'left' ? 'items-start text-left' : ''}
          ${styles?.textAlign === 'right' ? 'items-end text-right' : ''}
        `}>
          <div className="space-y-4 w-full">
            <SectionHeader title={title} styles={styles} className="!mb-0 !px-0" />
            <p
              className="text-xl md:text-2xl font-medium opacity-70 max-w-2xl"
              style={{ 
                color: styles?.color || 'inherit',
                fontSize: styles?.fontSize ? (typeof styles.fontSize === 'number' ? `${styles.fontSize}px` : styles.fontSize) : undefined,
                lineHeight: styles?.lineHeight || '1.4',
                marginLeft: styles?.textAlign === 'center' ? 'auto' : undefined,
                marginRight: styles?.textAlign === 'center' ? 'auto' : undefined,
              }}
            >
              {description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-2xl flex flex-col sm:flex-row gap-4 p-2 rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl
               ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
               ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
            `}
          >
            <div className="relative flex-1 group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white/50 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-base font-semibold"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="px-10 py-5 rounded-[1.5rem] bg-brand-600 hover:bg-brand-700 text-white font-black transition-all flex items-center justify-center gap-3 group disabled:opacity-70 whitespace-nowrap shadow-lg shadow-brand-600/20 active:scale-95"
              style={{
                backgroundColor: styles?.buttonColor || styles?.headlineColor || '#2563eb',
                color: styles?.buttonTextColor || '#ffffff'
              }}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="text-lg">{buttonText}</span>
                  <Send className="w-5 h-5 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <div className="flex flex-col space-y-2 opacity-40">
            <p className="text-sm font-bold tracking-tight">
              By subscribing, you agree to our Privacy Policy.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] font-black">
              No spam. Just value.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
