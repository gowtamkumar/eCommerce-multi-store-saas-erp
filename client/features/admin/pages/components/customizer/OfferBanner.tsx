"use client";

import { Tag, Clock, Zap, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Countdown Hook ─────────────────────────────────────────────────────── */
function useCountdown(endDate?: string) {
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
    useEffect(() => {
        if (!endDate) return;
        const tick = () => {
            const diff = new Date(endDate).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
            setTimeLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endDate]);
    return timeLeft;
}

/* ─── Floating Particles ─────────────────────────────────────────────────── */
function Particles() {
    return (
        <>
            {Array.from({ length: 12 }).map((_, i) => (
                <span
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: `${(i * 831) % 100}%`,
                        top: `${(i * 613) % 100}%`,
                        width: `${4 + (i % 4) * 3}px`,
                        height: `${4 + (i % 4) * 3}px`,
                        background: `rgba(255,255,255,${0.06 + (i % 5) * 0.04})`,
                        animation: `offerFloat ${6 + (i % 6)}s ease-in-out infinite`,
                        animationDelay: `${(i * 0.7) % 5}s`,
                    }}
                />
            ))}
        </>
    );
}

/* ─── Countdown Unit ─────────────────────────────────────────────────────── */
function CountdownUnit({ value, label, accentColor }: { value: number; label: string; accentColor: string }) {
    return (
        <div className="flex flex-col items-center">
            <div
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg sm:rounded-xl font-black text-base sm:text-xl md:text-2xl backdrop-blur-md shadow-lg"
                style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1.5px solid rgba(255,255,255,0.18)",
                    color: "#fff",
                    boxShadow: `0 4px 20px ${accentColor}33`,
                }}
            >
                {String(value).padStart(2, "0")}
            </div>
            <span className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-white/60">{label}</span>
        </div>
    );
}

/* ─── Resolve a px/number style value ───────────────────────────────────── */
function resolvePx(v: string | number | undefined): string | undefined {
    if (v === undefined || v === "" || v === null) return undefined;
    return typeof v === "number" ? `${v}px` : v;
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function OfferBanner({ settings, styles }: { settings: any; styles: any }) {
    const sectionId = useRef(`ob-${Math.random().toString(36).slice(2, 7)}`).current;

    const {
        headline,
        subline,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        image,
        backgroundImage: settingsBg,
        layout = "left",
        endDate,
    } = settings || {};

    const backgroundImage = settingsBg || styles?.backgroundImage;
    const countdown = useCountdown(endDate);

    /* ── Style tokens ─────────────────────────────────────────── */
    const hasBg = Boolean(backgroundImage);
    const defaultGradient = "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4f46e5 60%, #7c3aed 100%)";
    const accentColor = styles?.buttonColor || "#a78bfa";
    const showCountdown = Boolean(endDate) && !countdown.expired;

    // ── Desktop padding (from styles.paddingTop, etc.) ───────────────────────
    const deskPT = resolvePx(styles?.paddingTop);
    const deskPB = resolvePx(styles?.paddingBottom);
    const deskPL = resolvePx(styles?.paddingLeft);
    const deskPR = resolvePx(styles?.paddingRight);

    // ── Mobile padding (from styles.mobilePaddingTop, etc.) ─────────────────
    // SectionRenderer stores responsive overrides as mobileXxx keys.
    const mobPT = resolvePx(styles?.mobilePaddingTop);
    const mobPB = resolvePx(styles?.mobilePaddingBottom);
    const mobPL = resolvePx(styles?.mobilePaddingLeft);
    const mobPR = resolvePx(styles?.mobilePaddingRight);

    // Text align
    const textAlignFlex =
        styles?.textAlign === "center" ? "items-center" :
            styles?.textAlign === "right" ? "items-end" : "items-start";
    const textAlignText =
        styles?.textAlign === "center" ? "text-center" :
            styles?.textAlign === "right" ? "text-right" : "text-left";
    const btnJustify =
        styles?.textAlign === "center" ? "justify-center" :
            styles?.textAlign === "right" ? "justify-end" : "justify-start";

    // Desktop layout direction
    const desktopFlexDir = layout === "right" ? "md:flex-row-reverse" : "md:flex-row";

    // Image card radius
    const cardRadiusClass =
        styles?.cardRadius === "small" ? "rounded-lg" :
            styles?.cardRadius === "large" ? "rounded-[2rem]" :
                styles?.cardRadius === "full" ? "rounded-full" :
                    styles?.cardRadius === "none" ? "rounded-none" : "rounded-2xl";

    // Build responsive CSS for this instance
    // Desktop styles go on the element directly; mobile overrides use a scoped @media rule.
    const desktopPaddingStyle: React.CSSProperties = {
        ...(deskPT ? { paddingTop: deskPT } : {}),
        ...(deskPB ? { paddingBottom: deskPB } : {}),
        ...(deskPL ? { paddingLeft: deskPL } : {}),
        ...(deskPR ? { paddingRight: deskPR } : {}),
    };

    // Inline scoped responsive styles so mobile padding can differ from desktop
    const hasAnyMobilePad = mobPT || mobPB || mobPL || mobPR;
    const hasAnyDesktopPad = deskPT || deskPB || deskPL || deskPR;

    return (
        <>
            <style>{`
                @keyframes offerFloat {
                    0%,100%{transform:translateY(0) scale(1);opacity:.5}
                    50%{transform:translateY(-16px) scale(1.12);opacity:1}
                }
                @keyframes offerShimmer {
                    0%{background-position:-200% center}
                    100%{background-position:200% center}
                }
                @keyframes offerPulse {
                    0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.5)}
                    50%{box-shadow:0 0 0 12px rgba(167,139,250,0)}
                }
                @keyframes offerBadge {
                    0%,100%{transform:scale(1) rotate(-1deg)}
                    50%{transform:scale(1.06) rotate(1deg)}
                }
                /* Scoped responsive padding for this banner instance */
                @media (max-width: 767px) {
                    #${sectionId}-inner {
                        ${mobPT ? `padding-top:${mobPT}!important;` : !hasAnyDesktopPad ? "padding-top:16px;" : ""}
                        ${mobPB ? `padding-bottom:${mobPB}!important;` : !hasAnyDesktopPad ? "padding-bottom:16px;" : ""}
                        ${mobPL ? `padding-left:${mobPL}!important;` : !hasAnyDesktopPad ? "padding-left:16px;" : ""}
                        ${mobPR ? `padding-right:${mobPR}!important;` : !hasAnyDesktopPad ? "padding-right:16px;" : ""}
                    }
                }
                @media (min-width: 768px) {
                    #${sectionId}-inner {
                        ${deskPT ? `padding-top:${deskPT}!important;` : "padding-top:40px;"}
                        ${deskPB ? `padding-bottom:${deskPB}!important;` : "padding-bottom:40px;"}
                        ${deskPL ? `padding-left:${deskPL}!important;` : "padding-left:48px;"}
                        ${deskPR ? `padding-right:${deskPR}!important;` : "padding-right:48px;"}
                    }
                }
            `}</style>

            {/* ── Outer shell ── */}
            <div
                className="w-full relative overflow-hidden"
                style={{
                    minHeight: resolvePx(styles?.minHeight) || resolvePx(styles?.height) || "180px",
                    height: resolvePx(styles?.height),
                    borderRadius: styles?.borderRadius || undefined,
                }}
            >
                {/* Background */}
                {hasBg ? (
                    <>
                        <div
                            className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                            style={{ backgroundImage: `url("${backgroundImage}")` }}
                        />
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: "linear-gradient(135deg, rgba(30,27,75,.85) 0%, rgba(79,70,229,.6) 100%)",
                                opacity: (styles?.overlayOpacity ?? 70) / 100,
                            }}
                        />
                    </>
                ) : (
                    <div
                        className="absolute inset-0 z-0"
                        style={{ background: styles?.backgroundColor || defaultGradient }}
                    />
                )}

                {/* Glow orbs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full z-0 blur-3xl opacity-40 pointer-events-none"
                    style={{ background: "rgba(124,58,237,.7)" }} />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full z-0 blur-3xl opacity-30 pointer-events-none"
                    style={{ background: "rgba(99,102,241,.8)" }} />

                {/* Particles */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <Particles />
                </div>

                {/* ── Inner content ──
                    Mobile: always flex-row (icon tiny on left, content on right)
                    Desktop: obey layout prop (left/right)
                    Padding: controlled via scoped @media CSS above
                */}
                <div
                    id={`${sectionId}-inner`}
                    className={`relative z-10 h-full flex flex-row ${desktopFlexDir} items-center gap-3 sm:gap-5 md:gap-8`}
                >
                    {/* ── Icon / Image ── */}
                    <div className="flex-shrink-0 self-center">
                        {image ? (
                            <div
                                className={`w-14 h-14 sm:w-20 sm:h-20 md:w-40 md:h-40 ${cardRadiusClass} overflow-hidden shadow-2xl`}
                                style={{
                                    border: "3px solid rgba(255,255,255,.22)",
                                    boxShadow: `0 8px 40px rgba(0,0,0,.5), 0 0 0 6px rgba(167,139,250,.12)`,
                                }}
                            >
                                <img src={image} alt="" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div
                                className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center"
                                style={{
                                    background: styles?.iconBgColor || "rgba(255,255,255,.12)",
                                    border: "1.5px solid rgba(255,255,255,.22)",
                                    animation: "offerPulse 3s ease-in-out infinite",
                                    boxShadow: `0 0 28px ${accentColor}55`,
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <Tag className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9" style={{ color: styles?.iconColor || "#ffffff" }} />
                            </div>
                        )}
                    </div>

                    {/* ── Text content ── */}
                    <div className={`flex-1 min-w-0 flex flex-col gap-1 sm:gap-2 md:gap-3 ${textAlignFlex}`}>

                        {/* Live badge — aligned left always on mobile, follows textAlign on desktop */}
                        {showCountdown && (
                            <div
                                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit"
                                style={{ background: "rgba(239,68,68,.9)", color: "#fff", animation: "offerBadge 2s ease-in-out infinite" }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />
                                <span className="hidden sm:inline">Limited Time Offer</span>
                                <span className="sm:hidden">Limited Offer</span>
                            </div>
                        )}

                        {/* Headline */}
                        <div className={`${textAlignText} min-w-0`}>
                            <h2
                                className="font-black uppercase tracking-tight leading-tight drop-shadow-xl"
                                style={{
                                    fontSize: styles?.fontSize || "clamp(0.95rem, 3.5vw, 3rem)",
                                    fontWeight: styles?.fontWeight || 900,
                                    color: styles?.headlineColor || styles?.color || undefined,
                                    // shimmer only when no custom color
                                    ...(!(styles?.headlineColor || styles?.color) ? {
                                        background: "linear-gradient(90deg,#fff 0%,#c4b5fd 40%,#fff 60%,#a78bfa 100%)",
                                        backgroundSize: "200% auto",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        animation: "offerShimmer 4s linear infinite",
                                    } : {}),
                                }}
                            >
                                {headline || "EXCLUSIVE OFFER"}
                            </h2>
                            {subline && (
                                <p
                                    className="mt-0.5 sm:mt-1 font-semibold uppercase tracking-wider text-[9px] sm:text-xs md:text-sm opacity-80 line-clamp-2"
                                    style={{ color: styles?.sublineColor || "rgba(255,255,255,.85)" }}
                                >
                                    {subline}
                                </p>
                            )}
                        </div>

                        {/* Countdown */}
                        {showCountdown && (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/60 shrink-0" />
                                <div className="flex items-end gap-1 sm:gap-1.5">
                                    {countdown.d > 0 && <CountdownUnit value={countdown.d} label="Days" accentColor={accentColor} />}
                                    <CountdownUnit value={countdown.h} label="Hrs" accentColor={accentColor} />
                                    <span className="text-white/40 text-sm sm:text-base md:text-xl font-black self-center pb-3 sm:pb-4">:</span>
                                    <CountdownUnit value={countdown.m} label="Min" accentColor={accentColor} />
                                    <span className="text-white/40 text-sm sm:text-base md:text-xl font-black self-center pb-3 sm:pb-4">:</span>
                                    <CountdownUnit value={countdown.s} label="Sec" accentColor={accentColor} />
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className={`flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 ${btnJustify}`}>
                            {buttonText ? (
                                <Link
                                    href={buttonLink || "#"}
                                    className="group relative inline-flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs md:text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                                    style={{
                                        background: styles?.buttonColor ? styles.buttonColor : "linear-gradient(135deg,#fff 0%,#e0d9ff 100%)",
                                        color: styles?.buttonTextColor || "#4f46e5",
                                        boxShadow: `0 4px 20px ${accentColor}55`,
                                    }}
                                >
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,.35) 50%,transparent 100%)" }} />
                                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    {buttonText}
                                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <Link
                                    href="#"
                                    className="group relative inline-flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs md:text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                                    style={{
                                        background: "linear-gradient(135deg,#fff 0%,#e0d9ff 100%)",
                                        color: "#4f46e5",
                                        boxShadow: `0 4px 20px ${accentColor}55`,
                                    }}
                                >
                                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Shop Now
                                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )}

                            {secondaryButtonText && (
                                <Link
                                    href={secondaryButtonLink || "#"}
                                    className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3 rounded-lg sm:rounded-xl font-black uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs md:text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                                    style={{
                                        background: "rgba(255,255,255,.08)",
                                        border: "1.5px solid rgba(255,255,255,.25)",
                                        color: "#fff",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    {secondaryButtonText}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Decorative sparkle — desktop only */}
                    <div className="hidden lg:flex items-center justify-center opacity-10 pointer-events-none select-none flex-shrink-0">
                        <Sparkles className="w-20 h-20" style={{ color: accentColor }} />
                    </div>
                </div>
            </div>
        </>
    );
}