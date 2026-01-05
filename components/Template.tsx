import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Template() {
  const template = [
    { name: "clothing-product", link: "/template/clothing-product" },
    { name: "health-supplement", link: "/template/health-supplement" },
    { name: "pure-gold", link: "/template/pure-gold" },
    { name: "wellness", link: "/template/wellness" },
    { name: "shoes", link: "/template/shoes" },
  ];
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2">
        Templates
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>

      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0">
        <div className="py-2 flex flex-col">
          {template.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors capitalize"
            >
              {item.name.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
