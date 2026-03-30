"use client";

import { useCart } from "@/hooks/CartContext";
import { useWishlist } from "@/hooks/WishlistContext";
import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgePercent, Command, Facebook, Grid, Heart, Home, Instagram, Lock, LogOut, Menu, Phone, Search, ShoppingBag, Twitter, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CurrencySwitcher from "../shared/CurrencySwitcher";
import UserDropdown from "./UserDropdown";
import { UserRole } from "@/lib/enums/user-role.enum";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { settings } = useSettings();
  const { totalItems, openCart } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
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
      const isOutsideDesktop = searchRef.current && !searchRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node);

      if (isOutsideDesktop && isOutsideMobile) {
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
  const Brand = (onClick?: () => void) => (
    <Link href="/" onClick={onClick} className="flex-shrink-0 flex items-center gap-2 group">
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
      {/* 🔥 Offers — Always visible hardcoded link */}
      <Link
        href="/offers"
        className="relative flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors py-2 px-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
        🔥 Offers
      </Link>
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
      {navbarSettings?.showCurrency !== false && (
        <div className="hidden md:block">
          <CurrencySwitcher />
        </div>
      )}

      <Link
        href="/wishlist"
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative group"
        title="Wishlist"
      >
        <Heart className={`w-5 h-5 transition-colors ${iconColorClass}`} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
            {wishlistCount}
          </span>
        )}
      </Link>

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

      <div className="hidden md:block">
        <UserDropdown navbarTemplate={navbarTemplate} iconColorClass={iconColorClass} />
      </div>

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

  const MobileTabBar = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1 group">
          <Home className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
          <span className="text-[10px] font-bold text-slate-500">Home</span>
        </Link>
        <button
          onClick={() => {
            setIsMobileMenuOpen(true);
            setTimeout(() => {
              setIsSearchFocused(true);
            }, 500);
          }}
          className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1"
        >
          <Search className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500">Search</span>
        </button>
        <Link href="/wishlist" className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1 group relative">
          <Heart className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
          <span className="text-[10px] font-bold text-slate-500">Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
              {wishlistCount}
            </span>
          )}
        </Link>
        <div className="relative -top-3">
          <button
            onClick={openCart}
            className="w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-500/40 border-4 border-white dark:border-slate-900 active:scale-91 transition-transform"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-900 text-[9px] font-bold flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
        <button onClick={toggleMobileMenu} className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1">
          <Grid className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500">Links</span>
        </button>
        <Link href={session ? "/profile" : "/login"} className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1">
          <User className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500">{session ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  );

  const BottomShape = () => {
    const shape = navbarSettings?.bottomShape;
    if (!shape || shape === 'none') return null;

    const color = navbarSettings?.backgroundColor || (navbarTemplate === 'gradient' ? '#4f46e5' : '#ffffff');

    return (
      <div className="absolute top-[98%] left-0 w-full overflow-hidden leading-[0] z-[-1] pointer-events-none">
        {shape === 'wave' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[30px] h-[20px]" fill={color}>
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C48.1,6,110,24.49,168.69,37.23,212.06,46.67,265,56.44,321.39,56.44Z"></path>
          </svg>
        )}
        {shape === 'curve' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[40px] h-[25px]" fill={color}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </svg>
        )}
        {shape === 'slant' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[40px] h-[25px]" fill={color}>
            <path d="M1200 120L0 16.48V0h1200v120z"></path>
          </svg>
        )}
        {shape === 'notch' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[20px] h-[12px]" fill={color}>
            <path d="M0 0h450l50 30h200l50-30h450v120H0z"></path>
          </svg>
        )}
      </div>
    );
  };

  const getPatternStyles = () => {
    const pattern = navbarSettings?.backgroundPattern;
    if (!pattern || pattern === 'none') return {};

    const color = (navbarTemplate === 'gradient' || (navbarSettings?.backgroundColor && navbarSettings.backgroundColor !== '#ffffff'))
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.03)';

    switch (pattern) {
      case 'dots':
        return { backgroundImage: `radial-gradient(${color} 1px, transparent 0)`, backgroundSize: '10px 10px' };
      case 'mesh':
        return { backgroundImage: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color} 75%), linear-gradient(-45deg, transparent 75%, ${color} 75%)`, backgroundSize: '16px 16px' };
      case 'grid':
        return { backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'stripes':
        return { backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, transparent 2px, transparent 10px)` };
      default:
        return {};
    }
  };

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
    color: navbarSettings?.textColor || undefined,
    ...getPatternStyles()
  };

  return (
    <>
      <nav className={getNavStyles()} style={navCustomStyle}>
        <div className={getContainerStyles()}>
          {BottomShape()}

          {/* Layout Switcing logic */}
          {navbarLayout === 'centered' ? (
            <div className="grid grid-cols-3 items-center w-full">
              <div className="flex justify-start">
                {NavigationLinks()}
                <div className="md:hidden">
                  <Menu className={`w-6 h-6 ${iconColorClass}`} onClick={toggleMobileMenu} />
                </div>
              </div>
              <div className="flex justify-center">
                {Brand()}
              </div>
              <div className="flex justify-end items-center gap-4">
                {SearchBar()}
                {UserActions()}
              </div>
            </div>
          ) : navbarLayout === 'minimal' ? (
            <div className="flex justify-between items-center w-full">
              {Brand()}
              <div className="flex items-center gap-6">
                {NavigationLinks()}
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                {UserActions()}
              </div>
            </div>
          ) : (
            /* Default Layout */
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-8 lg:gap-12">
                {Brand()}
                {NavigationLinks()}
              </div>
              <div className="flex items-center gap-4 lg:gap-6">
                {SearchBar()}
                {UserActions()}
              </div>
            </div>
          )}
        </div>
      </nav>
      {MobileTabBar()}

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
              className={`fixed top-0 right-0 h-full w-[280px] sm:w-80 z-[70] md:hidden shadow-2xl flex flex-col ${navbarTemplate === 'glass'
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl'
                : 'bg-white dark:bg-slate-900'
                }`}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                {Brand(closeMobileMenu)}
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-200 dark:border-slate-800 relative" ref={mobileSearchRef}>
                <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); closeMobileMenu(); }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        console.log("Mobile search query updated:", e.target.value);
                        setSearchQuery(e.target.value);
                        setIsSearchFocused(true);
                      }}
                      onFocus={() => {
                        console.log("Mobile search focused");
                        setIsSearchFocused(true);
                      }}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-brand-500 transition-all text-sm outline-none font-bold"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Mobile Search Results */}
                {isSearchFocused && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[350px] overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col py-2">
                        <div className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                          Products Found ({searchResults.length})
                        </div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              console.log("Mobile search result clicked:", product.name);
                              handleSearchResultClick();
                              closeMobileMenu();
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                          >
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                  <ShoppingBag className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black truncate text-slate-900 dark:text-white group-hover:text-brand-600">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-brand-600">{settings?.currencySymbol || "৳"}{product.price}</span>
                                {product.oldPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">{settings?.currencySymbol || "৳"}{product.oldPrice}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/products?search=${encodeURIComponent(searchQuery)}`}
                          onClick={closeMobileMenu}
                          className="mt-2 mx-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center text-[10px] font-bold text-slate-500 hover:text-brand-600 transition-colors"
                        >
                          View all results for "{searchQuery}"
                        </Link>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">No products found</p>
                        <p className="text-[10px] text-slate-500 mt-1">Try a different keyword</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col space-y-1 px-4 mb-8">
                  <div className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Main Navigation</div>
                  {navbarSettings?.links
                    ?.filter((link: any) => link.isActive !== false)
                    ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    ?.map((link: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          target={link.isOpenInNewTab ? "_blank" : undefined}
                          className="flex items-center justify-between text-base font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-4 py-3 rounded-xl transition-all group"
                        >
                          {link.label}
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>
                      </motion.div>
                    ))
                  }

                  <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

                  {/* 🔥 Offers  */}
                  <Link
                    href="/offers"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between text-base font-bold text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-4 py-3 rounded-xl transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <BadgePercent className="w-5 h-5" />
                      🔥 Special Offers
                    </span>
                    <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                      LIVE
                    </span>
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between text-base font-bold text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-4 py-3 rounded-xl transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

                  {session && (
                    <div className="px-4 py-4 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600">
                          {session.user?.image ? (
                            <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{session.user?.name}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{session.user?.email}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 px-3 py-2 rounded-xl transition-all">
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        {session?.user?.role === UserRole.ADMIN && (
                          <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 px-3 py-2 rounded-xl transition-all">
                            <Lock className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            closeMobileMenu();
                            handleLogout();
                          }}
                          className="flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                  {!session && (
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center gap-2 m-4 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </nav>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
                <div className="flex justify-between items-center mb-6">
                  {navbarSettings?.showCurrency !== false && <CurrencySwitcher />}
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <Facebook className="w-4 h-4 text-brand-600" />
                    </button>
                    <button className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <Instagram className="w-4 h-4 text-brand-600" />
                    </button>
                    <button className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <Twitter className="w-4 h-4 text-brand-600" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Support 24/7</span>
                    <span className="text-xs font-bold">+880 1234 567890</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
