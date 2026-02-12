"use client";

import { useSettings } from "@/hooks/SettingsContext";
import Image from "next/image";

const WhatsAppWidget = () => {
  const { settings } = useSettings()


  return (
    <div className="z-80 fixed cursor-pointer bottom-20 right-4 bg-gray-700 rounded-full shadow-lg hover:bg-gray-900 transition-all">
      <a
        href={`https://wa.me/${settings?.whatsappPhone ?? ""}?text=${encodeURIComponent(
          settings?.siteDescription ?? ""
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Image
          src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
          alt="WhatsApp"
          width={32}
          height={32}
        />
      </a>
    </div>
  );
};

export default WhatsAppWidget;
