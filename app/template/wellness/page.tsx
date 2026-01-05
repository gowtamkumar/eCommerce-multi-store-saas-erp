import Template from '@/components/Template';
import { ArrowRight, Droplets, Flower2, Heart, Leaf, Menu, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WellnessPage() {
  return (
    <main className="min-h-screen bg-[#F0F4F1] text-[#2C3E36] font-sans selection:bg-[#8FA89B] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F0F4F1]/80 backdrop-blur-md border-b border-[#2C3E36]/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#D4E0D9] rounded-full flex items-center justify-center text-[#2C3E36]">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-2xl font-light tracking-wide uppercase">
              Seren<span className="font-semibold">ity</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium tracking-widest uppercase text-[#2C3E36]/70">
            <Link href="#" className="hover:text-[#2C3E36] transition-colors">Shop</Link>
            <Link href="#" className="hover:text-[#2C3E36] transition-colors">Rituals</Link>
            <Link href="#" className="hover:text-[#2C3E36] transition-colors">About</Link>
            <Link href="#" className="hover:text-[#2C3E36] transition-colors">Journal</Link>
            <Template />
          </div>

          <div className="flex items-center gap-6">
            <button className="hover:text-[#2C3E36]/70 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        {/* Soft Background Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2EBE6] rounded-full blur-[80px] -translate-y-1/4 translate-x-1/4 opacity-70 animate-pulse duration-[5000ms]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D8E2DC] rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 opacity-70 animate-pulse duration-[7000ms]"></div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <span className="inline-block text-[#5D7A6C] font-medium tracking-[0.2em] uppercase mb-6 text-sm">
              Holistic Wellness
            </span>
            <h1 className="text-5xl md:text-7xl font-light leading-[1.1] mb-8 text-[#1A2621]">
              Find Your <br />
              <span className="font-serif italic text-[#3A5248]">Inner Balance</span>
            </h1>
            <p className="text-lg text-[#2C3E36]/70 max-w-md mb-10 leading-relaxed font-light">
              Curated essentials for mindfulness, body care, and creating a sanctuary in your daily life.
            </p>
            <div className="flex gap-6">
              <button className="bg-[#2C3E36] text-white px-8 py-4 rounded-full font-medium tracking-wide hover:bg-[#1A2621] transition-all hover:shadow-lg hover:shadow-[#2C3E36]/20 flex items-center gap-2 group">
                Shop Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full font-medium tracking-wide border border-[#2C3E36]/20 hover:bg-[#2C3E36]/5 transition-colors text-[#2C3E36]">
                Our Story
              </button>
            </div>
          </div>

          <div className="order-1 md:order-2 relative h-[500px] md:h-[600px]">
            {/* Main Visual - Rounded Arch Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-md h-full rounded-t-[200px] overflow-hidden shadow-2xl shadow-[#2C3E36]/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center hover:scale-105 transition-transform duration-[2s]"></div>

                {/* Floating Product Card */}
                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg max-w-[200px] animate-float">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-[#F0F4F1] rounded-lg bg-[url('https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#2C3E36]">Calm Oil</div>
                      <div className="text-xs text-[#2C3E36]/60">$48.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-10 right-10 w-32 h-32 border border-[#2C3E36]/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute -z-10 bottom-20 left-0 w-24 h-24 bg-[#D4E0D9] rounded-full blur-xl opacity-60"></div>
          </div>
        </div>
      </section>

      {/* Philosophy / Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-light mb-6 text-[#1A2621]">
              Rooted in Nature, <br />
              <span className="font-serif italic text-[#3A5248]">Backed by Science</span>
            </h2>
            <p className="text-[#2C3E36]/70">
              We believe in the power of natural ingredients to restore balance and vitality to your life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Leaf, title: "100% Organic", desc: "Sourced from certified organic farms committed to regenerative agriculture." },
              { icon: Droplets, title: "Pure Extraction", desc: "Cold-pressed and steam distilled to preserve potent active compounds." },
              { icon: Heart, title: "Mindful Living", desc: "Products designed to create moments of pause and reflection in your day." }
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 mx-auto bg-[#F0F4F1] rounded-full flex items-center justify-center mb-6 text-[#5D7A6C] group-hover:bg-[#E2EBE6] transition-colors duration-500">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium tracking-wide mb-3 text-[#2C3E36]">{feature.title}</h3>
                <p className="text-[#2C3E36]/60 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-24 bg-[#F0F4F1] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
          <h2 className="text-3xl md:text-4xl font-light text-[#1A2621]">Daily Rituals</h2>
          <Link href="#" className="text-sm font-medium tracking-widest uppercase border-b border-[#2C3E36] pb-1 hover:text-[#5D7A6C] hover:border-[#5D7A6C] transition-colors">
            View All
          </Link>
        </div>

        <div className="flex gap-8 px-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
          {[
            { name: "Restorative Night Cream", price: "$65", img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1974&auto=format&fit=crop" },
            { name: "Balancing Facial Oil", price: "$48", img: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2670&auto=format&fit=crop" },
            { name: "Purifying Clay Mask", price: "$42", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop" },
            { name: "Hydrating Mist", price: "$35", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1974&auto=format&fit=crop" }
          ].map((product, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px] snap-center group cursor-pointer">
              <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden mb-6 shadow-sm group-hover:shadow-md transition-all duration-500">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${product.img})` }}></div>
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2C3E36] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md hover:bg-[#2C3E36] hover:text-white">
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-medium text-[#2C3E36] mb-1">{product.name}</h3>
              <p className="text-[#5D7A6C] font-medium">{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mood / Video Section */}
      <section className="relative py-32 bg-[#2C3E36] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Flower2 className="w-12 h-12 mx-auto mb-8 text-[#D4E0D9] animate-spin-slow" />
          <h2 className="text-4xl md:text-6xl font-light mb-8 leading-tight">
            "Wellness is not a luxury, <br />
            <span className="font-serif italic text-[#D4E0D9]">it's a necessity."</span>
          </h2>
          <button className="bg-[#F0F4F1] text-[#2C3E36] px-10 py-4 rounded-full font-medium tracking-wide hover:bg-white transition-colors">
            Explore Our Philosophy
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A2621] text-[#D4E0D9] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#2C3E36] rounded-full flex items-center justify-center text-[#D4E0D9]">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-xl font-light tracking-wide uppercase text-white">
                  Seren<span className="font-semibold">ity</span>
                </span>
              </div>
              <p className="text-[#D4E0D9]/60 max-w-sm font-light leading-relaxed">
                Creating conscious products for a balanced life. Join our community of mindful living.
              </p>
            </div>
            <div>
              <h4 className="font-medium uppercase tracking-widest text-white mb-6 text-xs">Shop</h4>
              <ul className="space-y-4 text-[#D4E0D9]/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Skincare</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Body</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Home Fragrance</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Sets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium uppercase tracking-widest text-white mb-6 text-xs">Support</h4>
              <ul className="space-y-4 text-[#D4E0D9]/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Shipping</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#D4E0D9]/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[#D4E0D9]/40 text-xs font-medium uppercase tracking-widest">
              © 2024 Serenity Wellness.
            </div>
            <div className="flex gap-6 text-[#D4E0D9]/60">
              <Link href="#" className="hover:text-white transition-colors text-sm">Instagram</Link>
              <Link href="#" className="hover:text-white transition-colors text-sm">Pinterest</Link>
              <Link href="#" className="hover:text-white transition-colors text-sm">TikTok</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
