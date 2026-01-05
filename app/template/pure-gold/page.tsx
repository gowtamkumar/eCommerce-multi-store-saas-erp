import Template from '@/components/Template';
import { ArrowRight, CheckCircle, Droplet, Heart, Leaf, Star } from 'lucide-react';
import Link from 'next/link';

export default function TemplateHome() {
  return (
    <main className="min-h-screen bg-amber-50 dark:bg-stone-950 font-sans text-stone-800 dark:text-amber-50 selection:bg-amber-500 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-stone-900/80 border-b border-amber-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-amber-50 tracking-tight">
                Pure<span className="text-amber-600">Gold</span>
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">Our Harvest</Link>
                <Link href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">Process</Link>
                <Link href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">Recipes</Link>
                <Template />
              </div>
            </div>
            <div>
              <button className="bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-amber-900/10 hover:shadow-amber-900/20">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-yellow-200/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-medium text-sm mb-8 border border-amber-200 dark:border-amber-800">
                <Leaf className="w-4 h-4" />
                100% Organic Cold Pressed
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 leading-[1.1] text-stone-900 dark:text-amber-50">
                Nature's Liquid <br />
                <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                  Gold
                </span>
              </h1>
              <p className="text-xl text-stone-600 dark:text-stone-300 mb-10 leading-relaxed max-w-lg">
                Experience the purest form of nourishment. Sourced from ancient groves, cold-pressed to preserve every drop of vitality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-amber-600/20">
                  Taste the Difference <ArrowRight className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-50 px-8 py-4 rounded-full font-bold text-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  View Collection
                </button>
              </div>
            </div>

            {/* Hero Visual - Abstract Oil Bottle/Drop */}
            <div className="relative h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-stone-800 dark:to-stone-900 rounded-[3rem] rotate-3"></div>
              <div className="relative z-10 w-64 h-[400px] bg-gradient-to-b from-amber-300 to-yellow-600 rounded-full rounded-t-none opacity-90 blur-sm absolute top-10 transform scale-y-110 mix-blend-multiply dark:mix-blend-normal"></div>

              {/* CSS Art for Bottle */}
              <div className="relative z-20 w-48 h-[380px] bg-gradient-to-br from-amber-400/80 to-yellow-600/90 backdrop-blur-sm rounded-[2rem] border border-white/30 shadow-2xl flex flex-col items-center justify-end overflow-hidden group hover:scale-105 transition-transform duration-500">
                {/* Liquid inside */}
                <div className="absolute bottom-0 left-0 right-0 bg-amber-500 h-3/4 w-full transition-all duration-1000 group-hover:h-[80%]">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-amber-400 rounded-[50%] -mt-2"></div>
                  {/* Bubbles */}
                  <div className="absolute bottom-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100"></div>
                  <div className="absolute bottom-20 right-12 w-3 h-3 bg-white/30 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute bottom-32 left-16 w-1 h-1 bg-white/50 rounded-full animate-bounce delay-700"></div>
                </div>

                {/* Label */}
                <div className="absolute top-1/3 w-32 h-40 bg-stone-50 shadow-lg flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-xs font-serif text-stone-500 uppercase tracking-widest mb-1">Premium</div>
                  <div className="font-serif text-2xl font-bold text-stone-900">Virgin</div>
                  <div className="w-8 h-0.5 bg-amber-500 my-2"></div>
                  <div className="text-[10px] text-stone-400">EST. 1924</div>
                </div>

                {/* Reflection */}
                <div className="absolute top-4 right-4 w-4 h-32 bg-white/20 rounded-full blur-[2px]"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 right-10 bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-xl animate-pulse">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-stone-900 dark:text-white">5.0 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-stone-900 dark:text-amber-50">Purity in Every Drop</h2>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              We believe in minimal processing to retain the maximum nutritional value and flavor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: "100% Organic", desc: "Certified organic farms with zero pesticides or harmful chemicals." },
              { icon: Droplet, title: "Cold Pressed", desc: "Extracted at low temperatures to preserve antioxidants and nutrients." },
              { icon: Heart, title: "Heart Healthy", desc: "Rich in monounsaturated fats and Omega-3 for a healthy lifestyle." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-amber-50 dark:bg-stone-800/50 border border-amber-100 dark:border-stone-700 hover:border-amber-400/50 transition-colors group">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-inner">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 text-stone-900 dark:text-amber-50">{feature.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase / Ingredients */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=2518&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-amber-500 font-bold tracking-widest uppercase mb-4">Our Process</div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">From Grove to Bottle</h2>
              <p className="text-stone-300 text-lg mb-8 leading-relaxed">
                Our olives are hand-picked at the peak of ripeness and pressed within 4 hours of harvest. This dedication to speed ensures the lowest acidity and the freshest taste possible.
              </p>
              <ul className="space-y-4">
                {[
                  "Single Origin Sourcing",
                  "First Cold Press Extraction",
                  "Unfiltered for Maximum Flavor",
                  "Sustainable Farming Practices"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-amber-500" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full border border-white/10 p-8 animate-[spin_60s_linear_infinite]">
                <div className="w-full h-full rounded-full border border-white/20 p-8">
                  <div className="w-full h-full rounded-full border border-white/30 bg-stone-800/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-amber-500 mb-2">24h</div>
                      <div className="text-sm uppercase tracking-widest text-stone-400">Harvest to Bottle</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating ingredients */}
              <div className="absolute top-0 right-0 bg-stone-800 p-4 rounded-xl border border-stone-700 shadow-xl">
                <div className="font-bold text-amber-400">Acidity</div>
                <div className="text-2xl font-bold">0.2%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-amber-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-16 text-center text-stone-900 dark:text-amber-50">Loved by Chefs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Elena R.", role: "Head Chef", text: "The depth of flavor is incredible. It transforms my simple salads into gourmet dishes." },
              { name: "Marco P.", role: "Food Critic", text: "I've tasted oils from all over the Mediterranean, and this is truly top-tier liquid gold." },
              { name: "Sarah J.", role: "Home Cook", text: "Finally, an oil that tastes like real olives. My family can't get enough of it." }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-lg border border-amber-100 dark:border-stone-800">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 dark:text-stone-300 mb-6 italic font-serif text-lg">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-stone-500">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 dark:text-amber-50">{t.name}</div>
                    <div className="text-sm text-stone-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Droplet className="w-6 h-6 text-amber-500 fill-current" />
                <span className="font-serif text-2xl font-bold text-white">
                  Pure<span className="text-amber-600">Gold</span>
                </span>
              </div>
              <p className="max-w-xs leading-relaxed">
                Bringing the finest cold-pressed organic oils from our groves to your table. Pure, simple, and healthy.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Shop</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Extra Virgin</Link></li>
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Infused Oils</Link></li>
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Gift Sets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Our Story</Link></li>
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Sustainability</Link></li>
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
            <div>
              © 2024 PureGold Oils. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-amber-500 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
