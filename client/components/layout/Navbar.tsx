"use client";

import { useCart } from "@/hooks/CartContext";
import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Lock, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CurrencySwitcher from "../shared/CurrencySwitcher";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { settings } = useSettings();
  const { totalItems, openCart } = useCart();
  const brandName = settings?.brandName || "LuxeAudio";
  const navbarSettings = settings?.navbar;
  const navbarLayout = navbarSettings?.layout || "default";


  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // ESC to close search results
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products with debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetchAPI(`/products?search=${encodeURIComponent(searchQuery)}&limit=6&status=active`);
        if (res.success) {
          setSearchResults(res.data?.products || []);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(searchProducts, 200); // Faster debounce
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: `${window.location.origin}/login` });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchResultClick = () => {
    setIsSearchFocused(false);
    setSearchQuery("");
  };

  // Shared Components to avoid repetition
  const Brand = () => (
    <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
      {settings?.logo ? (
        <Image src={settings.logo} height={500} width={500} priority unoptimized alt={brandName} className="h-10 sm:h-12 w-auto object-contain" />
      ) : (
        <>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
            <span className="text-white font-bold text-base sm:text-lg">
              {brandName.charAt(0)}
            </span>
          </div>
          <span className="hidden lg:block text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {brandName}
          </span>
        </>
      )}
    </Link>
  );

  const NavigationLinks = () => (
    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
      {navbarSettings?.links
        ?.filter((link: any) => link.isActive !== false)
        ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        ?.map((link: any, index: number) => (
          <Link
            key={index}
            href={link.href}
            target={link.isOpenInNewTab ? "_blank" : undefined}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative group"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all group-hover:w-full"></span>
          </Link>
        ))
      }
    </div>
  );

  const SearchBar = () => (
    <div className="hidden md:block relative" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Search..."
          className="w-48 lg:w-64 pl-10 pr-12 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm outline-none"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>
      </form>

      {/* Search Results Dropdown remains same content-wise */}
      {isSearchFocused && (searchQuery.length >= 2 || searchResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[400px] overflow-y-auto z-50">
          {searchResults.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={handleSearchResultClick}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {product.name}
                    </h4>
                    <span className="text-xs font-bold text-brand-600">${product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-slate-500">No products found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const UserActions = () => (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="hidden sm:block">
        <CurrencySwitcher />
      </div>

      <button
        onClick={openCart}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
        title="Cart"
      >
        <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
      </button>

      <Link
        href="/profile"
        className="hidden sm:block p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        title="Profile"
      >
        <User className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
      </Link>

      {session?.user?.role === "Admin" && (
        <Link
          href="/admin"
          className="hidden sm:block p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          title="Admin"
        >
          <Lock className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
        </Link>
      )}

      {session && (
        <button
          onClick={handleLogout}
          className="hidden sm:block p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
        </button>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
      </button>
    </div>
  );

  return (
    <>
      <nav className={`${navbarSettings?.sticky !== false ? 'fixed' : 'absolute'} top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg h-16 sm:h-20'
        : navbarSettings?.transparent && !isScrolled
          ? 'bg-transparent h-20 sm:h-24'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-20 sm:h-24'
        } border-b border-slate-200 dark:border-slate-800 flex items-center`}>
        <div className={`${navbarSettings?.maxWidth === 'full' ? 'max-w-full px-4 sm:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} w-full`}>

          {/* Layout Switcing logic */}
          {navbarLayout === 'centered' ? (
            <div className="grid grid-cols-3 items-center w-full">
              <div className="flex justify-start">
                <NavigationLinks />
                <div className="md:hidden">
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" onClick={toggleMobileMenu} />
                </div>
              </div>
              <div className="flex justify-center">
                <Brand />
              </div>
              <div className="flex justify-end items-center gap-4">
                <SearchBar />
                <UserActions />
              </div>
            </div>
          ) : navbarLayout === 'minimal' ? (
            <div className="flex justify-between items-center w-full">
              <Brand />
              <div className="flex items-center gap-6">
                <NavigationLinks />
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                <UserActions />
              </div>
            </div>
          ) : (
            /* Default Layout */
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-8 lg:gap-12">
                <Brand />
                <NavigationLinks />
              </div>
              <div className="flex items-center gap-4 lg:gap-6">
                <SearchBar />
                <UserActions />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu (unchanged logic, just ensuring props match) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] sm:w-80 bg-white dark:bg-slate-900 z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xl font-black text-slate-900 dark:text-white">{brandName}</span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); closeMobileMenu(); }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-brand-500 transition-all text-sm outline-none"
                    />
                  </div>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col space-y-1 px-4">
                  {navbarSettings?.links
                    ?.filter((link: any) => link.isActive !== false)
                    ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    ?.map((link: any, index: number) => (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={closeMobileMenu}
                        target={link.isOpenInNewTab ? "_blank" : undefined}
                        className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all"
                      >
                        {link.label}
                      </Link>
                    ))
                  }
                  <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all">
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  {session?.user?.role === "Admin" && (
                    <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all">
                      <Lock className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
                  {session && (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        handleLogout();
                      }}
                      className="flex items-center gap-3 text-base font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-xl transition-all w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  )}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <CurrencySwitcher />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
