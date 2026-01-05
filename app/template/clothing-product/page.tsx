import Template from '@/components/Template';
import { ChevronDown, Heart, Menu, Minus, Plus, Share2, ShoppingBag, Star } from 'lucide-react';
import Link from 'next/link';

export default function ClothingProductPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-serif selection:bg-[#1A1A1A] selection:text-white">
      {/* Navbar - Minimalist */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-[#1A1A1A]/5">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button className="p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="#" className="text-xl tracking-widest uppercase font-light">
              Atelier
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-12 text-xs tracking-[0.2em] uppercase font-medium">
            <Link href="#" className="hover:text-[#1A1A1A]/60 transition-colors">New In</Link>
            <Link href="#" className="hover:text-[#1A1A1A]/60 transition-colors">Ready to Wear</Link>
            <Link href="#" className="hover:text-[#1A1A1A]/60 transition-colors">Accessories</Link>
            <Link href="#" className="hover:text-[#1A1A1A]/60 transition-colors">Editorial</Link>
            <Template />
          </div>
          <div className="flex items-center gap-6">
            <button className="text-xs tracking-widest uppercase hover:underline">Search</button>
            <button className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1A1A1A] rounded-full"></span>
            </button>
          </div>
        </div>
      </nav>


      <div className="pt-20 lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Product Gallery (Scrollable on mobile, sticky/full height on desktop) */}
        <div className="lg:w-3/5 h-full overflow-y-auto scrollbar-hide bg-[#F5F2EB]">
          <div className="grid grid-cols-1 gap-1 p-1">
            {/* Main Image */}
            <div className="relative aspect-[4/5] w-full bg-[#EAE7E0] overflow-hidden group cursor-zoom-in">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
              <div className="absolute bottom-6 left-6 text-xs tracking-widest uppercase text-white/80">Figure 01. Front View</div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div className="relative aspect-[3/4] bg-[#EAE7E0] overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529139574466-a302d20525a9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
              </div>
              <div className="relative aspect-[3/4] bg-[#EAE7E0] overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/10 backdrop-blur-[2px]">
                  <span className="text-white text-xs tracking-widest uppercase border border-white px-4 py-2">View Texture</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-square bg-[#EAE7E0] overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
              <div className="absolute bottom-6 left-6 text-xs tracking-widest uppercase text-white/80">Figure 04. Styling</div>
            </div>
          </div>
        </div>

        {/* Right: Product Details (Scrollable) */}
        <div className="lg:w-2/5 h-full overflow-y-auto bg-[#FDFBF7] px-6 py-12 lg:px-16 lg:py-20 flex flex-col">
          <div className="mb-auto">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A]/60">Collection 2024</span>
              <div className="flex gap-4">
                <button className="hover:text-[#1A1A1A]/60 transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="hover:text-[#1A1A1A]/60 transition-colors"><Heart className="w-4 h-4" /></button>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-light mb-4 tracking-tight">The Structured Wool Coat</h1>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-xl">$895.00</span>
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-[#1A1A1A]" />
                <Star className="w-3 h-3 fill-[#1A1A1A]" />
                <Star className="w-3 h-3 fill-[#1A1A1A]" />
                <Star className="w-3 h-3 fill-[#1A1A1A]" />
                <Star className="w-3 h-3 fill-[#1A1A1A]" />
                <span className="ml-1 text-[#1A1A1A]/60">(12 Reviews)</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#1A1A1A]/80 mb-10 max-w-md">
              Crafted from Italian virgin wool, this oversized coat features dropped shoulders, wide notch lapels, and a double-breasted closure. A timeless silhouette reimagined for the modern wardrobe.
            </p>

            {/* Color Selection */}
            <div className="mb-8">
              <span className="text-xs tracking-widest uppercase block mb-4">Color — Charcoal</span>
              <div className="flex gap-3">
                <button className="w-8 h-8 rounded-full bg-[#2A2A2A] ring-2 ring-offset-2 ring-[#1A1A1A] ring-offset-[#FDFBF7]"></button>
                <button className="w-8 h-8 rounded-full bg-[#8C8C8C] hover:ring-2 hover:ring-offset-2 hover:ring-[#1A1A1A]/20 hover:ring-offset-[#FDFBF7] transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-[#D4C5B0] hover:ring-2 hover:ring-offset-2 hover:ring-[#1A1A1A]/20 hover:ring-offset-[#FDFBF7] transition-all"></button>
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
              <div className="flex justify-between mb-4">
                <span className="text-xs tracking-widest uppercase">Size</span>
                <button className="text-xs tracking-widest uppercase underline decoration-[#1A1A1A]/30 underline-offset-4">Size Guide</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button key={size} className={`h-12 border ${size === 'M' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#1A1A1A]/20 hover:border-[#1A1A1A]'} text-xs font-medium transition-colors`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <div className="flex items-center border border-[#1A1A1A]/20 h-14 px-4 w-32 justify-between">
                <button className="hover:text-[#1A1A1A]/60"><Minus className="w-4 h-4" /></button>
                <span className="text-sm font-medium">1</span>
                <button className="hover:text-[#1A1A1A]/60"><Plus className="w-4 h-4" /></button>
              </div>
              <button className="flex-1 bg-[#1A1A1A] text-white h-14 text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#1A1A1A]/90 transition-colors">
                Add to Bag
              </button>
            </div>

            {/* Accordion Details */}
            <div className="border-t border-[#1A1A1A]/10">
              {[
                { title: "Composition & Care", content: "100% Virgin Wool. Lining: 100% Viscose. Dry clean only." },
                { title: "Shipping & Returns", content: "Free standard shipping on orders over $300. Returns accepted within 14 days." },
                { title: "Sustainability", content: "Sourced from responsible farms in Tuscany. Manufactured in a zero-waste facility." }
              ].map((item, i) => (
                <div key={i} className="border-b border-[#1A1A1A]/10">
                  <button className="w-full py-6 flex justify-between items-center text-left group">
                    <span className="text-xs tracking-widest uppercase group-hover:text-[#1A1A1A]/60 transition-colors">{item.title}</span>
                    <ChevronDown className="w-4 h-4 text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-[#1A1A1A]/10">
            <h3 className="text-xs tracking-widest uppercase mb-6">Complete the Look</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2].map((i) => (
                <div key={i} className="min-w-[140px] cursor-pointer group">
                  <div className="aspect-[3/4] bg-[#EAE7E0] mb-3 overflow-hidden">
                    <div className="w-full h-full bg-neutral-200 group-hover:scale-105 transition-transform duration-500"></div>
                  </div>
                  <div className="text-xs font-medium">Pleated Trousers</div>
                  <div className="text-xs text-[#1A1A1A]/60">$325.00</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
