"use client";

import { fetchAPI } from "@/services/api";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

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
      style={styles}
      className="w-full"
    >
      <div className="w-full h-full">
        <div className={`flex flex-col space-y-8
          ${styles?.textAlign === 'center' ? 'items-center text-center' : ''}
          ${styles?.textAlign === 'left' ? 'items-start text-left' : ''}
          ${styles?.textAlign === 'right' ? 'items-end text-right' : ''}
        `}>
          <div className="space-y-4 w-full">
            <h2
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase"
              style={{ color: styles?.headlineColor || styles?.color || 'inherit' }}
            >
              {title}
            </h2>
            <p
              className="text-lg opacity-80"
              style={{ color: styles?.color || 'inherit' }}
            >
              {description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-xl flex flex-col sm:flex-row gap-3
               ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
               ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
            `}
          >
            <div className="relative flex-1 group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-70 whitespace-nowrap"
              style={{
                backgroundColor: styles?.buttonColor || styles?.headlineColor,
                color: styles?.buttonTextColor || '#ffffff'
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {buttonText}
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs opacity-50">
            By subscribing, you agree to our Privacy Policy. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}
