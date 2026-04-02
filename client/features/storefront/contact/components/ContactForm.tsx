'use client';

import { fetchAPI } from '@/services/api';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ContactFormProps {
    styles?: any;
}

export default function ContactForm({ styles }: ContactFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetchAPI('/leads', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (res.success) {
                setSuccess(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
                toast.success('Message sent successfully!');
            } else {
                toast.error('Failed to send message. Please try again.');
            }
        } catch (error) {
            toast.error('Error sending message.');
        } finally {
            setLoading(false);
        }
    };

    const resolvePx = (v: string | number | undefined) => {
        if (v === undefined || v === "" || v === null) return undefined;
        return typeof v === "number" ? `${v}px` : v;
    };

    const inputStyle: React.CSSProperties = {
        backgroundColor: styles?.inputBgColor || 'transparent',
        borderColor: styles?.inputBorderColor || 'rgba(255,255,255,0.1)',
        color: styles?.color || 'inherit',
    };

    const labelStyle: React.CSSProperties = {
        textAlign: styles?.labelAlign || 'left',
        display: 'block',
        width: '100%',
    };

    const buttonStyle: React.CSSProperties = {
        backgroundColor: styles?.buttonColor || styles?.backgroundColor || '#3b82f6',
        color: styles?.buttonTextColor || '#ffffff',
        borderColor: styles?.borderColor || 'transparent',
        borderWidth: resolvePx(styles?.borderWidth) || '0px',
        borderRadius: resolvePx(styles?.borderRadius) || '1.5rem',
        fontSize: resolvePx(styles?.fontSize),
        fontWeight: styles?.fontWeight || 800,
        letterSpacing: styles?.letterSpacing ? `${styles.letterSpacing}em` : undefined,
        textTransform: styles?.textTransform || 'uppercase',
        paddingTop: resolvePx(styles?.paddingTop),
        paddingBottom: resolvePx(styles?.paddingBottom),
        paddingLeft: resolvePx(styles?.paddingLeft),
        paddingRight: resolvePx(styles?.paddingRight),
        marginTop: resolvePx(styles?.marginTop),
        marginBottom: resolvePx(styles?.marginBottom),
    };

    const buttonWrapperStyle: React.CSSProperties = {
        textAlign: styles?.textAlign || 'center',
    };

    if (success) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Message Sent!</h3>
                <p className="text-green-500/70 mb-6 font-medium">Thank you for reaching out. We'll be in touch soon.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500" style={labelStyle}>Full Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={inputStyle}
                        className="w-full px-5 py-4 rounded-2xl border bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500" style={labelStyle}>Email Address</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={inputStyle}
                        className="w-full px-5 py-4 rounded-2xl border bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                        placeholder="john@example.com"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500" style={labelStyle}>Subject</label>
                <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={inputStyle}
                    className="w-full px-5 py-4 rounded-2xl border bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                    placeholder="How can we help you?"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500" style={labelStyle}>Message</label>
                <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={inputStyle}
                    className="w-full px-5 py-4 rounded-3xl border bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none placeholder:text-slate-500 font-medium"
                    placeholder="Tell us more about your inquiry..."
                />
            </div>
            <div style={buttonWrapperStyle}>
                <button
                    type="submit"
                    disabled={loading}
                    style={buttonStyle}
                    className="w-full sm:w-auto px-10 py-5 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-3 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
            </div>
        </form>
    );
}
