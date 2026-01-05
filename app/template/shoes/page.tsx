import { Activity, ArrowRight, ChevronRight, Menu, Play, ShoppingBag, Wind, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ShoesPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center skew-x-[-12deg]">
              <Zap className="w-6 h-6 text-black fill-current" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter uppercase">
              Velocity<span className="text-cyan-500">X</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
            <Link href="#" className="hover:text-cyan-500 transition-colors">Men</Link>
            <Link href="#" className="hover:text-cyan-500 transition-colors">Women</Link>
            <Link href="#" className="hover:text-cyan-500 transition-colors">New Arrivals</Link>
            <Link href="#" className="hover:text-cyan-500 transition-colors">Sale</Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="hover:text-cyan-500 transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </button>
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Just Dropped
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
              Defy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Gravity</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md mb-10 font-medium leading-relaxed">
              Engineered for explosive speed and limitless energy return. The all-new Velocity X1 redefines what's possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-cyan-500 text-black px-8 py-4 font-black uppercase tracking-wider hover:bg-cyan-400 transition-colors skew-x-[-12deg] group">
                <span className="inline-block skew-x-[12deg] flex items-center gap-2">
                  Shop Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button className="border border-white/20 bg-white/5 px-8 py-4 font-bold uppercase tracking-wider hover:bg-white/10 transition-colors skew-x-[-12deg] backdrop-blur-sm">
                <span className="inline-block skew-x-[12deg]">Watch Film</span>
              </button>
            </div>
          </div>

          {/* Hero Shoe Visual */}
          <div className="relative h-[500px] md:h-[700px] flex items-center justify-center">
            {/* Circular Text Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-[spin_30s_linear_infinite]">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <defs>
                  <path id="circle2" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                </defs>
                <text fontSize="8" fill="white" fontWeight="bold" letterSpacing="2">
                  <textPath xlinkHref="#circle2">
                    MAXIMUM PERFORMANCE • ULTIMATE COMFORT • VELOCITY X •
                  </textPath>
                </text>
              </svg>
            </div>

            {/* The Shoe (CSS Art / Placeholder) */}
            <div className="relative w-full max-w-[500px] aspect-[16/9] animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl rounded-full transform rotate-12 scale-75"></div>
              {/* Shoe Shape Placeholder */}
              <div className="relative z-10 w-full h-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-[3rem] rounded-tl-[5rem] rounded-br-[4rem] border border-white/10 shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-700 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                {/* Swoosh/Logo */}
                <div className="absolute w-[120%] h-32 bg-cyan-500/80 blur-3xl -rotate-45 translate-y-20 group-hover:translate-y-0 transition-transform duration-700"></div>
                <div className="relative z-20 text-9xl font-black italic text-white/5 select-none">VX</div>

                {/* Shoe Details (Abstract) */}
                <div className="absolute bottom-8 right-12 flex gap-2">
                  <div className="w-12 h-2 bg-cyan-500 rounded-full"></div>
                  <div className="w-4 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <div className="absolute top-12 left-12 w-24 h-24 border-2 border-white/10 rounded-full flex items-center justify-center">
                  <div className="text-xs font-bold text-cyan-400">AIR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="py-24 bg-neutral-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Wind, title: "Ultra-Lightweight", desc: "180g of pure speed. Flyknit upper adapts to your foot for a second-skin feel." },
              { icon: Zap, title: "Energy Return", desc: "React foam technology delivers 15% more energy return with every stride." },
              { icon: Activity, title: "Adaptive Traction", desc: "Data-driven outsole pattern grips the ground in wet and dry conditions." }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-cyan-500/50 transition-colors group">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 text-cyan-500 group-hover:scale-110 transition-transform border border-white/10">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase / Colorways */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Choose Your <br /> <span className="text-cyan-500">Vibe</span></h2>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><ChevronRight className="w-6 h-6 rotate-180" /></button>
            <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><ChevronRight className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="flex gap-8 px-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
          {[
            { name: "Neon Cyber", color: "bg-cyan-500", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop" },
            { name: "Stealth Black", color: "bg-neutral-800", img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2080&auto=format&fit=crop" },
            { name: "Electric Purple", color: "bg-purple-600", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop" },
            { name: "Arctic White", color: "bg-white", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop" }
          ].map((shoe, i) => (
            <div key={i} className="min-w-[300px] md:min-w-[400px] snap-center group cursor-pointer">
              <div className="relative aspect-[4/3] bg-neutral-900 rounded-3xl overflow-hidden mb-6 border border-white/5">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${shoe.img})` }}></div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase border border-white/10">
                  New
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wide mb-1">{shoe.name}</h3>
                  <p className="text-gray-500 text-sm font-mono">Running / Lifestyle</p>
                </div>
                <div className={`w-6 h-6 rounded-full ${shoe.color} ring-2 ring-offset-2 ring-offset-black ring-transparent group-hover:ring-white/50 transition-all`}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video / Action Section */}
      <section className="relative py-32 bg-neutral-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518005052357-e9847508d571?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <button className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 hover:scale-110 transition-transform shadow-[0_0_40px_rgba(6,182,212,0.5)]">
            <Play className="w-8 h-8 text-black fill-current ml-1" />
          </button>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            Unleash <br /> The Speed
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            See how our elite athletes are breaking records with Velocity X technology.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center skew-x-[-12deg]">
                  <Zap className="w-5 h-5 text-black fill-current" />
                </div>
                <span className="text-xl font-black italic tracking-tighter uppercase">
                  Velocity<span className="text-cyan-500">X</span>
                </span>
              </div>
              <p className="text-gray-500 max-w-sm">
                Pushing the boundaries of athletic performance through innovation and design.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-6 text-white">Products</h4>
              <ul className="space-y-4 text-gray-500">
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Running</Link></li>
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Training</Link></li>
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Lifestyle</Link></li>
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Custom</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-6 text-white">Support</h4>
              <ul className="space-y-4 text-gray-500">
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Order Status</Link></li>
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Size Guide</Link></li>
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Returns</Link></li>
                <li><Link href="#" className="hover:text-cyan-500 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-600 text-sm font-bold uppercase">
              © 2024 VelocityX Sports.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-600 hover:text-white transition-colors">Instagram</Link>
              <Link href="#" className="text-gray-600 hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="text-gray-600 hover:text-white transition-colors">YouTube</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
