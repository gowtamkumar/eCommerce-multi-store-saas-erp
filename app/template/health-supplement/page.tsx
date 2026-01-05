import Template from '@/components/Template';
import { Activity, ArrowRight, Check, Shield, Star, Sun, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HealthSupplementHome() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white selection:bg-teal-500 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold transform -rotate-6">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Vital<span className="text-teal-500">Boost</span>
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#" className="hover:text-teal-500 transition-colors font-medium">Benefits</Link>
                <Link href="#" className="hover:text-teal-500 transition-colors font-medium">Science</Link>
                <Link href="#" className="hover:text-teal-500 transition-colors font-medium">Reviews</Link>
                <Template />
              </div>
            </div>
            <div>
              <button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-6 py-2.5 rounded-full font-bold transition-all hover:shadow-lg">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50/50 dark:bg-teal-900/10 skew-x-12 transform origin-top-right"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                New Formula 2.0
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Unlock Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                  Full Potential
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                Scientifically formulated to enhance focus, energy, and recovery. 100% natural ingredients, zero crash.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:-translate-y-1 transition-transform shadow-lg shadow-teal-500/30">
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 px-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700"></div>
                    ))}
                  </div>
                  <div className="text-sm font-medium">
                    <span className="font-bold">10k+</span> Happy Users
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                {[
                  { label: "Natural", value: "100%" },
                  { label: "Sugar", value: "0g" },
                  { label: "Focus", value: "24/7" }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-slate-500 font-medium uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual - Supplement Bottle */}
            <div className="relative h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-[3rem] -rotate-6 scale-90"></div>

              {/* CSS Art Bottle */}
              <div className="relative z-10 w-64 h-[420px] bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-between p-6 border border-slate-100 dark:border-slate-700 group hover:scale-105 transition-transform duration-500">
                {/* Cap */}
                <div className="w-full h-16 bg-slate-900 dark:bg-slate-700 rounded-2xl mb-4 shadow-md"></div>

                {/* Label */}
                <div className="flex-1 w-full bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full -ml-16 -mb-16"></div>

                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">VitalBoost</h3>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-6">Daily Complex</p>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-6"></div>

                  <div className="space-y-2 w-full text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between"><span>Vitamin B12</span> <span>100%</span></div>
                    <div className="flex justify-between"><span>Zinc</span> <span>50%</span></div>
                    <div className="flex justify-between"><span>Magnesium</span> <span>30%</span></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-1/4 -left-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl animate-bounce delay-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                    <Sun className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Morning Energy</span>
                </div>
              </div>
              <div className="absolute bottom-1/4 -right-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl animate-bounce delay-1000">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Immune Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Science Meets Nature</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We combine cutting-edge nutritional science with the purest natural ingredients.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Sustained Energy", desc: "No jitters, no crash. Just smooth, consistent energy throughout your day." },
              { icon: Shield, title: "Immune Defense", desc: "Fortified with Zinc, Vitamin C, and Elderberry for maximum protection." },
              { icon: Zap, title: "Mental Clarity", desc: "Nootropics to sharpen focus and improve cognitive performance." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-teal-500/50 transition-colors group">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-teal-500 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients / Science */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/40 via-slate-900 to-slate-900"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Ashwagandha", benefit: "Stress Relief" },
                  { name: "L-Theanine", benefit: "Focus" },
                  { name: "Rhodiola", benefit: "Endurance" },
                  { name: "B-Complex", benefit: "Energy" }
                ].map((ing, i) => (
                  <div key={i} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                    <div className="text-teal-400 font-bold mb-1">{ing.name}</div>
                    <div className="text-sm text-slate-400">{ing.benefit}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-teal-500 font-bold tracking-widest uppercase mb-4">Premium Ingredients</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">What's Inside Matters</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                We refuse to use fillers, artificial colors, or preservatives. Every ingredient is selected for its bioavailability and efficacy.
              </p>
              <ul className="space-y-4">
                {[
                  "Clinically Dosed Ingredients",
                  "Third-Party Tested",
                  "GMP Certified Facility",
                  "Vegan & Gluten-Free"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-teal-500" />
                    </div>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-teal-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Real Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "David K.", role: "Athlete", text: "I've tried every supplement out there. Nothing gives me clean energy like VitalBoost." },
              { name: "Sarah M.", role: "Entrepreneur", text: "My focus has improved dramatically. I can work deep hours without burning out." },
              { name: "James L.", role: "Developer", text: "No crash in the afternoon. It's exactly what I needed for my coding sessions." }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Level Up?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
            Join thousands of high performers who trust VitalBoost.
          </p>
          <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
            Get Started Today
          </button>
          <p className="mt-6 text-sm text-slate-500">30-Day Money Back Guarantee • Free Shipping</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center text-white font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-lg">VitalBoost</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 VitalBoost Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-teal-500 transition-colors">Privacy</Link>
            <Link href="#" className="text-slate-400 hover:text-teal-500 transition-colors">Terms</Link>
            <Link href="#" className="text-slate-400 hover:text-teal-500 transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
