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
  const navbarTemplate = navbarSettings?.template || "classic";


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
          <span
            style={{ color: navbarSettings?.textColor || undefined }}
            className={`hidden lg:block text-xl sm:text-2xl font-black tracking-tight ${!navbarSettings?.textColor ? (navbarTemplate === 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white') : ''}`}>
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
            style={{ color: navbarSettings?.textColor || undefined }}
            className={`text-sm font-semibold transition-all relative group py-2 px-3 rounded-${navbarSettings?.borderRadius || 'xl'} ${navbarSettings?.hoverEffect === 'background' ? 'hover:bg-white/10' : ''
              } ${navbarSettings?.hoverEffect === 'glow' ? 'hover:text-brand-500 hover:drop-shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.5)]' : ''
              }`}
          >
            {link.label}
            {navbarSettings?.hoverEffect === 'underline' && (
              <span
                style={{ backgroundColor: navbarSettings?.textColor || undefined }}
                className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${!navbarSettings?.textColor ? (navbarTemplate === 'gradient' ? 'bg-white' : 'bg-brand-600') : ''}`}
              ></span>
            )}
          </Link>
        ))
      }
    </div>
  );

  const SearchBar = () => (
    <div className="hidden md:block relative" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 ${iconColorClass}`} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Search..."
          style={{ color: navbarSettings?.textColor || undefined }}
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
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden max-h-[400px] overflow-y-auto z-50 transition-all ${navbarTemplate === 'gradient'
          ? 'bg-brand-700/95 backdrop-blur-xl border-brand-400/30'
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800'
          }`}>
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
                    <h4 className={`text-xs font-bold truncate transition-colors ${navbarTemplate === 'gradient' ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-brand-600'
                      }`}>
                      {product.name}
                    </h4>
                    <span className={`text-xs font-bold ${navbarTemplate === 'gradient' ? 'text-white/80' : 'text-brand-600'
                      }`}>
                      {settings?.currencySymbol || "৳"}{product.price}
                    </span>
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
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative group"
        title="Cart"
      >
        <ShoppingBag className={`w-5 h-5 transition-colors ${iconColorClass}`} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
      </button>

      <Link
        href="/profile"
        className="hidden sm:block p-2 rounded-full hover:bg-white/10 transition-colors group"
        title="Profile"
      >
        <User className={`w-5 h-5 transition-colors ${iconColorClass}`} />
      </Link>

      {session?.user?.role === "Admin" && (
        <Link
          href="/admin"
          className="hidden sm:block p-2 rounded-full hover:bg-white/10 transition-colors group"
          title="Admin"
        >
          <Lock className={`w-5 h-5 transition-colors ${iconColorClass}`} />
        </Link>
      )}

      {session && (
        <button
          onClick={handleLogout}
          className="hidden sm:block p-2 rounded-full hover:bg-white/10 transition-colors group"
          title="Logout"
        >
          <LogOut className={`w-5 h-5 transition-colors ${iconColorClass}`} />
        </button>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className={`w-6 h-6 ${iconColorClass}`} />
      </button>
    </div>
  );

  // Determine background and container styles based on template
  const getNavStyles = () => {
    const isSticky = navbarSettings?.sticky !== false;
    const isTransparent = navbarSettings?.transparent && !isScrolled;

    let baseStyles = isSticky ? 'fixed' : 'absolute';
    baseStyles += ' top-0 w-full z-50 transition-all duration-500 flex items-center ';

    switch (navbarTemplate) {
      case 'glass':
        return `${baseStyles} bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 h-16 sm:h-20 shadow-sm`;
      case 'gradient':
        return `${baseStyles} bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-700 dark:to-brand-600 h-16 sm:h-20 shadow-lg border-none text-white`;
      case 'floating':
        return `${baseStyles} ${isScrolled ? 'top-2' : 'top-4'} w-full px-4 sm:px-6 pointer-events-none transition-all`;
      default:
        return `${baseStyles} ${isScrolled ? 'bg-white/95 dark:bg-slate-900/95 h-16 sm:h-20' : 'bg-white dark:bg-slate-900 h-20 sm:h-24'} backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800`;
    }
  };

  const shadowClasses: Record<string, string> = {
    none: 'shadow-none',
    subtle: 'shadow-sm',
    medium: 'shadow-md',
    strong: 'shadow-xl'
  };

  const radiusClasses: Record<string, string> = {
    none: 'rounded-none',
    md: 'rounded-md',
    xl: 'rounded-xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  };

  const getContainerStyles = () => {
    const shadowClass = shadowClasses[navbarSettings?.shadowIntensity || ''] || '';
    const radiusClass = radiusClasses[navbarSettings?.borderRadius || ''] || 'rounded-2xl sm:rounded-3xl';

    if (navbarTemplate === 'floating') {
      return `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 h-16 sm:h-20 pointer-events-auto transition-all flex items-center ${isScrolled ? 'scale-95' : 'scale-100'} ${shadowClass} ${radiusClass}`;
    }
    return `${navbarSettings?.maxWidth === 'full' ? 'max-w-full px-4 sm:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} w-full flex items-center h-full transition-all ${shadowClass}`;
  };

  const iconColorClass = navbarSettings?.textColor
    ? ""
    : (navbarTemplate === 'gradient' ? 'text-white hover:text-white/80' : 'text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400');

  const navCustomStyle = {
    backgroundColor: (navbarSettings?.backgroundColor && (!navbarSettings?.transparent || isScrolled)) ? navbarSettings.backgroundColor : undefined,
    color: navbarSettings?.textColor || undefined
  };

  return (
    <>
      <nav className={getNavStyles()} style={navCustomStyle}>
        <div className={getContainerStyles()}>

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
