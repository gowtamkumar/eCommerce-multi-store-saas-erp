'use client';

import { CheckCircle2, Plus, Truck } from 'lucide-react';
import Link from 'next/link';

export default function CommandCenter() {
    return (
        <div className="bg-brand-600 p-8 rounded-[40px] shadow-xl shadow-brand-200 flex flex-col justify-center">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter italic">Command Center</h3>
            <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/products/new" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group">
                    <Plus className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform mx-auto" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/80">New Item</p>
                </Link>
                <Link href="/admin/procurement/purchases/new" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group">
                    <Truck className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform mx-auto" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Purchase</p>
                </Link>
                <Link href="/admin/fulfillment" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group col-span-2">
                    <CheckCircle2 className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform mx-auto" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Fulfillment Hub</p>
                </Link>
            </div>
        </div>
    );
}
