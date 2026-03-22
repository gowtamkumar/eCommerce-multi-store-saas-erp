"use client";

import { UserRole } from "@/lib/enums/user-role";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, User, UserCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface UserDropdownProps {
    navbarTemplate?: string;
    iconColorClass?: string;
}

export default function UserDropdown({ navbarTemplate, iconColorClass }: UserDropdownProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session) {
        return (
            <Link
                href="/login"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${navbarTemplate === 'gradient'
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:hover:bg-brand-900/30'
                    }`}
            >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
            </Link>
        );
    }

    const dropdownBg = navbarTemplate === 'gradient'
        ? 'bg-brand-700/95 backdrop-blur-xl border-brand-400/30'
        : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800';

    const itemHover = navbarTemplate === 'gradient'
        ? 'hover:bg-white/10 text-white'
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-1.5 sm:pl-1.5 sm:pr-3 rounded-full sm:rounded-2xl transition-all border border-transparent hover:border-white/10 hover:bg-white/5 active:scale-95 group`}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-brand-100 dark:bg-brand-900/40 text-brand-600 shadow-inner group-hover:scale-110 transition-transform`}>
                    {session.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <UserCircle className="w-5 h-5" />
                    )}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${navbarTemplate === 'gradient' ? 'text-white' : 'text-slate-500'}`}>
                        Account
                    </span>
                    <span className={`text-xs font-black truncate max-w-[80px] ${navbarTemplate === 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {session.user?.name?.split(' ')[0] || "User"}
                    </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                        className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl border p-2 z-[100] ${dropdownBg}`}
                    >
                        {/* Header */}
                        <div className="p-3 mb-1 border-b border-slate-100 dark:border-slate-800/50">
                            <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{session.user?.email}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{session.user?.name}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-0.5">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${itemHover}`}
                            >
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                                    <User className="w-4 h-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">My Profile</span>
                                    <span className="text-[10px] opacity-60">Manage your account</span>
                                </div>
                            </Link>

                            {session?.user?.role === UserRole.ADMIN && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${itemHover}`}
                                >
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                                        <LayoutDashboard className="w-4 h-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Admin Panel</span>
                                        <span className="text-[10px] opacity-60">Store management</span>
                                    </div>
                                </Link>
                            )}

                            <div className="h-px bg-slate-100 dark:bg-slate-800/50 my-2 mx-2" />

                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600`}
                            >
                                <div className="p-1.5 bg-red-100/50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-100 transition-colors">
                                    <LogOut className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-bold">Sign Out</span>
                                    <span className="text-[10px] text-red-400">Secure logout</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
