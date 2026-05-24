"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/SettingsContext";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { settings } = useSettings();

  const hasLiveChat = !settings?.isSaaS;

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        "fixed right-6 z-50 p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg shadow-brand-500/30 transition-all duration-300 flex items-center justify-center transform",
        hasLiveChat ? "bottom-[144px] md:bottom-[88px]" : "bottom-20 md:bottom-6",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}

