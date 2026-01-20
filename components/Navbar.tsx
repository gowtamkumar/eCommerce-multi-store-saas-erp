"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { fetchAPI } from "@/lib/api";
import { Lock, LogOut, Menu, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CurrencySwitcher from "./CurrencySwitcher";
import Template from "./Template";

const Navbar = ({ settings: propSettings }: { settings?: any }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings: contextSettings } = useSettings();
  const settings = propSettings || contextSettings;
  const brandName = settings?.brandName || "LuxeAudio";

  const { data: session } = useSession();
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetchAPI("/pages?status=published");
      if (res.success) {
        // The backend returns { statusCode: 200, data: [...], success: true }
        setPages(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch menu pages", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };




  const handleLogout = async () => {
    // Preserve current domain (subdomain or custom domain) when redirecting to login
    // const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

    // Sign out without automatic redirect
    await signOut({ redirect: false });
    // Manually redirect to preserve domain
    // window.location.href = `${currentDomain}`;
  };
  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              {settings?.logo ? (
                <img src={settings.logo} alt={brandName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <span className="text-white font-bold text-lg">
                      {brandName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {brandName}
                  </span>
                </>
              )}
            </Link>
            <div className="hidden md:flex items-center space-x-10">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={page.isHomePage ? "/" : `/${page.slug}`}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                >
                  {page.title}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
              ))}

              <Template />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <CurrencySwitcher />
              </div>
              <Link
                href="/profile"
                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
                title="My Profile"
              >
                <User className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </Link>
              {session?.user?.role === "Admin" ? (
                <Link
                  href="/admin"
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
                  title="Admin Panel"
                >
                  <Lock className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </Link>
              ) : null}

              {/* Logout Button - Show only if logged in */}
              {session && (
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                </button>
              )}

              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
              {settings?.logo ? (
                <img src={settings.logo} alt={brandName} className="h-8 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {brandName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {brandName}
                  </span>
                </>
              )}
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close mobile menu"
            >
              <X className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          </div>

          {/* Mobile Menu Links */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="flex flex-col space-y-1 px-4">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={page.isHomePage ? "/" : `/${page.slug}`}
                  onClick={closeMobileMenu}
                  className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors"
                >
                  {page.title}
                </Link>
              ))}



              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors"
              >
                My Profile
              </Link>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-slate-200 dark:border-slate-800" />
            {/* Admin Link */}
            {session?.user?.role === "Admin" ? (
              <div className="px-4">
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors"
                >
                  <Lock className="w-5 h-5" />
                  Admin Panel
                </Link>
              </div>
            ) : null}

            {/* Logout Button in Mobile Menu */}
            {session && (
              <div className="px-4">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
