"use client";

import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { fetchAPI } from "@/lib/api";
import { Command, Lock, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CurrencySwitcher from "../store/CurrencySwitcher";

const Navbar = ({ settings: propSettings }: { settings?: any }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { settings: contextSettings } = useSettings();
  const { totalItems, openCart } = useCart();
  const settings = propSettings || contextSettings;
  const brandName = settings?.brandName || "LuxeAudio";

  const { data: session } = useSession();

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
    await signOut({ redirect: false });
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

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg'
        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'
        } border-b border-slate-200 dark:border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              {settings?.logo ? (
                <img src={settings.logo} alt={brandName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {brandName.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden lg:block text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {brandName}
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/products" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative group">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/about" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all group-hover:w-full"></span>
              </Link>
            </div>

            {/* Right Section with Search */}
            <div className="flex items-center gap-3">
              {/* Enhanced Search Bar - Always Visible */}
              <div className="relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search products..."
                    className="w-64 lg:w-80 pl-10 pr-20 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                      <Command className="w-3 h-3" />K
                    </kbd>
                  </div>
                </form>

                {/* Enhanced Search Results Dropdown */}
                {isSearchFocused && (searchQuery.length >= 2 || searchResults.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[500px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={handleSearchResultClick}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                          >
                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <ShoppingBag className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {product.shortDescription || product.description?.substring(0, 60)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-bold text-brand-600">${product.price}</span>
                                {product.category && (
                                  <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs rounded-full">
                                    {product.category.name}
                                  </span>
                                )}
                                {product.stock <= 0 && (
                                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}

                        {searchQuery.trim() && (
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full p-4 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        )}
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-8 text-center">
                        <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No products found for "{searchQuery}"</p>
                        <p className="text-xs text-slate-400 mt-1">Try different keywords</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="hidden md:block">
                <CurrencySwitcher />
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
                title="Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>

              {/* Profile */}
              <Link
                href="/profile"
                className="hidden md:block p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="Profile"
              >
                <User className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
              </Link>

              {/* Admin */}
              {session?.user?.role === "Admin" && (
                <Link
                  href="/admin"
                  className="hidden md:block p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  title="Admin"
                >
                  <Lock className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                </Link>
              )}

              {/* Logout */}
              {session && (
                <button
                  onClick={handleLogout}
                  className="hidden md:block p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
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
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={closeMobileMenu} />

          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-out md:hidden shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xl font-black text-slate-900 dark:text-white">{brandName}</span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
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

              {/* Mobile Links */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col space-y-1 px-4">
                  <Link href="/" onClick={closeMobileMenu} className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all">
                    Home
                  </Link>
                  <Link href="/products" onClick={closeMobileMenu} className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all">
                    Shop
                  </Link>
                  <Link href="/about" onClick={closeMobileMenu} className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all">
                    About
                  </Link>
                  <Link href="/contact" onClick={closeMobileMenu} className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition-all">
                    Contact
                  </Link>

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

              {/* Mobile Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <CurrencySwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
