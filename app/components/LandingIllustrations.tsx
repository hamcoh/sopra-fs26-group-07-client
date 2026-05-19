"use client";
import { useEffect, useRef } from "react";
import React from "react";
import MatrixCanvas from "@/components/MatrixCanvas";

/* ─── Design tokens (mirrored from page.tsx) ─── */
const C = {
  bg:    "#EEF1F6",
  dark:  "#1A1A2E",
  blue:  "#4361EE",
  pink:  "#EC4899",
  muted: "#6B7280",
};

/* ─── Scroll-reveal (self-contained) ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  style,
  className = "",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`cod-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOW-TO-PLAY ILLUSTRATIONS
══════════════════════════════════════════════ */

function IllustrationRegister() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <rect x="20" y="10" width="240" height="160" rx="14" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="20" y="10" width="240" height="36" rx="14" fill="#4361EE"/>
      <rect x="20" y="32" width="240" height="14" fill="#4361EE"/>
      <text x="36" y="33" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="white">Create Account</text>
      <circle cx="140" cy="82" r="22" fill="#EEF1F6"/>
      <circle cx="140" cy="75" r="10" fill="#CBD5E1"/>
      <ellipse cx="140" cy="96" rx="16" ry="9" fill="#CBD5E1"/>
      <rect x="44" y="112" width="192" height="16" rx="6" fill="#F1F5F9"/>
      <text x="52" y="124" fontFamily="Inter,sans-serif" fontSize="8" fill="#94A3B8">Username</text>
      <rect x="44" y="134" width="192" height="16" rx="6" fill="#F1F5F9"/>
      <text x="52" y="146" fontFamily="Inter,sans-serif" fontSize="8" fill="#94A3B8">Password</text>
      <rect x="80" y="156" width="120" height="8" rx="4" fill="#4361EE" fillOpacity="0.15"/>
    </svg>
  );
}

function IllustrationCreateRoom() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <rect x="20" y="10" width="240" height="160" rx="14" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="20" y="10" width="240" height="36" rx="14" fill="#4361EE"/>
      <rect x="20" y="32" width="240" height="14" fill="#4361EE"/>
      <text x="36" y="33" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="white">New Room</text>
      <text x="36" y="68" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="600" fill="#6B7280">DIFFICULTY</text>
      <rect x="36" y="74" width="90" height="22" rx="6" fill="#22c55e"/>
      <text x="81" y="89" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">Easy</text>
      <rect x="134" y="74" width="90" height="22" rx="6" fill="#F1F5F9"/>
      <text x="179" y="89" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#6B7280" textAnchor="middle">Hard</text>
      <text x="36" y="116" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="600" fill="#6B7280">LANGUAGE</text>
      <rect x="36" y="122" width="105" height="22" rx="6" fill="#4361EE"/>
      <text x="88" y="137" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">Python</text>
      <rect x="149" y="122" width="75" height="22" rx="6" fill="#F1F5F9"/>
      <text x="186" y="137" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#6B7280" textAnchor="middle">Java</text>
      <rect x="60" y="152" width="160" height="22" rx="8" fill="#4361EE"/>
      <text x="140" y="167" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="700" fill="white" textAnchor="middle">+ Create Room</text>
    </svg>
  );
}

function IllustrationJoinRoom() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <rect x="20" y="10" width="240" height="160" rx="14" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="20" y="10" width="240" height="36" rx="14" fill="#4361EE"/>
      <rect x="20" y="32" width="240" height="14" fill="#4361EE"/>
      <text x="36" y="33" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="white">Open Rooms</text>
      {[
        { name: "Room #1337", diff: "Easy", diffColor: "#22c55e", lang: "Python", y: 58 },
        { name: "Room #0042", diff: "Hard", diffColor: "#EC4899", lang: "Java",   y: 98 },
        { name: "Room #0099", diff: "Easy", diffColor: "#22c55e", lang: "Java",   y: 138 },
      ].map(r => (
        <g key={r.name}>
          <rect x="32" y={r.y} width="216" height="30" rx="8" fill="#F8FAFC" stroke="#E5E7EB" strokeWidth="1"/>
          <text x="46" y={r.y + 19} fontFamily="Inter,sans-serif" fontSize="9" fontWeight="700" fill="#1A1A2E">{r.name}</text>
          <rect x="120" y={r.y + 7} width="38" height="14" rx="4" fill={r.diffColor} fillOpacity="0.15"/>
          <text x="139" y={r.y + 18} fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill={r.diffColor} textAnchor="middle">{r.diff}</text>
          <text x="172" y={r.y + 19} fontFamily="Inter,sans-serif" fontSize="8" fill="#94A3B8">{r.lang}</text>
          <rect x="210" y={r.y + 8} width="30" height="14" rx="4" fill="#4361EE"/>
          <text x="225" y={r.y + 19} fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#fff" textAnchor="middle">Join</text>
        </g>
      ))}
    </svg>
  );
}

function IllustrationLobby() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <defs>
        <clipPath id="clip-you"><circle cx="90" cy="88" r="28"/></clipPath>
        <clipPath id="clip-opp"><circle cx="190" cy="88" r="28"/></clipPath>
      </defs>
      <rect x="20" y="10" width="240" height="160" rx="14" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="20" y="10" width="240" height="36" rx="14" fill="#1A1A2E"/>
      <rect x="20" y="32" width="240" height="14" fill="#1A1A2E"/>
      <text x="36" y="33" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="white">Room</text>
      <circle cx="90" cy="88" r="28" fill="#EEF1F6"/>
      <image href="/avatar1.png" x="62" y="60" width="56" height="56" clipPath="url(#clip-you)"/>
      <circle cx="90" cy="88" r="28" fill="none" stroke="#4361EE" strokeWidth="2"/>
      <text x="90" y="128" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="700" fill="#1A1A2E" textAnchor="middle">You</text>
      <rect x="60" y="134" width="60" height="14" rx="5" fill="#22c55e"/>
      <text x="90" y="145" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#fff" textAnchor="middle">✓ Ready</text>
      <text x="140" y="96" fontFamily="Inter,sans-serif" fontSize="16" fontWeight="800" fill="#4361EE" textAnchor="middle" opacity="0.4">VS</text>
      <circle cx="190" cy="88" r="28" fill="#EEF1F6"/>
      <image href="/avatar2.png" x="162" y="60" width="56" height="56" clipPath="url(#clip-opp)"/>
      <circle cx="190" cy="88" r="28" fill="none" stroke="#EC4899" strokeWidth="2"/>
      <text x="190" y="128" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="700" fill="#1A1A2E" textAnchor="middle">Opponent</text>
      <rect x="160" y="134" width="60" height="14" rx="5" fill="#F1F5F9" stroke="#E5E7EB" strokeWidth="1"/>
      <text x="190" y="145" fontFamily="Inter,sans-serif" fontSize="7" fill="#94A3B8" textAnchor="middle">Waiting…</text>
    </svg>
  );
}

function IllustrationBattle() {
  return (
    <svg viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <defs>
        <clipPath id="ib-c1"><circle cx="28" cy="28" r="18"/></clipPath>
        <clipPath id="ib-c2"><circle cx="532" cy="28" r="18"/></clipPath>
      </defs>
      <rect width="560" height="340" rx="16" fill="#eef1f6"/>
      <rect x="8" y="8" width="228" height="56" rx="10" fill="#f0f7ff" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="28" cy="28" r="18" fill="#dbeafe"/>
      <image href="/avatar1.png" x="10" y="10" width="36" height="36" clipPath="url(#ib-c1)"/>
      <text x="52" y="25" fontFamily="Inter,sans-serif" fontSize="9" fill="#6b7280">You</text>
      <text x="52" y="40" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#1a1a2e">Spartacus_42</text>
      <rect x="244" y="8" width="72" height="56" rx="10" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <text x="280" y="42" fontFamily="JetBrains Mono,monospace" fontSize="15" fontWeight="700" fill="#1a1a2e" textAnchor="middle">04:32</text>
      <rect x="324" y="8" width="228" height="56" rx="10" fill="#fff5f5" stroke="#ef4444" strokeWidth="2"/>
      <circle cx="532" cy="28" r="18" fill="#fee2e2"/>
      <image href="/avatar2.png" x="514" y="10" width="36" height="36" clipPath="url(#ib-c2)"/>
      <text x="338" y="25" fontFamily="Inter,sans-serif" fontSize="9" fill="#6b7280">Opponent</text>
      <text x="338" y="40" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#1a1a2e">NeptuneCodes</text>
      <rect x="8" y="72" width="182" height="260" rx="10" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
      <text x="20" y="92" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="700" fill="#1a1a2e">Two Sum</text>
      <rect x="20" y="98" width="36" height="12" rx="4" fill="#22c55e" fillOpacity="0.2"/>
      <text x="38" y="108" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#22c55e" textAnchor="middle">Easy</text>
      <rect x="62" y="98" width="40" height="12" rx="4" fill="#4361EE" fillOpacity="0.15"/>
      <text x="82" y="108" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#4361EE" textAnchor="middle">Python</text>
      <line x1="8" y1="116" x2="190" y2="116" stroke="#f0f0f0" strokeWidth="1"/>
      <text x="20" y="130" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="700" fill="#374151">Description</text>
      <text x="20" y="145" fontFamily="Inter,sans-serif" fontSize="7" fill="#6b7280">Given an array of integers</text>
      <text x="20" y="158" fontFamily="Inter,sans-serif" fontSize="7" fill="#6b7280">nums and an integer target,</text>
      <text x="20" y="171" fontFamily="Inter,sans-serif" fontSize="7" fill="#6b7280">return indices of the two</text>
      <text x="20" y="184" fontFamily="Inter,sans-serif" fontSize="7" fill="#6b7280">numbers that add up to target.</text>
      <text x="20" y="202" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="700" fill="#374151">Input Format</text>
      <rect x="20" y="208" width="158" height="30" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      <text x="28" y="220" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4b5563">nums = [2, 7, 11, 15]</text>
      <text x="28" y="232" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4b5563">target = 9</text>
      <text x="20" y="252" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="700" fill="#374151">Output Format</text>
      <rect x="20" y="258" width="158" height="18" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      <text x="28" y="270" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4b5563">Return [0, 1]</text>
      <rect x="198" y="72" width="177" height="260" rx="10" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="198" y="72" width="177" height="28" rx="10" fill="#f8fafc"/>
      <rect x="198" y="86" width="177" height="14" fill="#f8fafc"/>
      <text x="210" y="90" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="600" fill="#374151">Code Editor</text>
      <text x="362" y="90" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4361EE" textAnchor="end">Python</text>
      <line x1="198" y1="100" x2="375" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
      {[1,2,3,4,5,6,7,8].map(n => (
        <text key={n} x="210" y={108 + n * 15} fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#a1a1a1" textAnchor="middle">{n}</text>
      ))}
      {[
        { x: 220, segs: [{ w: 28, c: "#7C3AED" }, { w: 6, c: "t" }, { w: 44, c: "#4361EE" }, { w: 4, c: "t" }, { w: 30, c: "rgba(255,255,255,0.35)" }] },
        { x: 228, segs: [{ w: 30, c: "#6b7280" }, { w: 4, c: "t" }, { w: 22, c: "#2563eb" }] },
        { x: 228, segs: [{ w: 18, c: "#7C3AED" }, { w: 4, c: "t" }, { w: 36, c: "rgba(255,255,255,0.35)" }] },
        { x: 236, segs: [{ w: 24, c: "rgba(255,255,255,0.2)" }, { w: 4, c: "t" }, { w: 18, c: "#EC4899" }] },
        { x: 236, segs: [{ w: 14, c: "#7C3AED" }, { w: 4, c: "t" }, { w: 28, c: "rgba(255,255,255,0.2)" }] },
        { x: 244, segs: [{ w: 44, c: "rgba(255,255,255,0.2)" }] },
        { x: 236, segs: [{ w: 22, c: "rgba(255,255,255,0.2)" }, { w: 4, c: "t" }, { w: 16, c: "#4361EE" }] },
        { x: 228, segs: [{ w: 24, c: "rgba(255,255,255,0.15)" }] },
      ].map((row, ri) => {
        let cx = row.x;
        return row.segs.map((seg, si) => {
          const el = seg.c === "t" ? null : <rect key={`${ri}-${si}`} x={cx} y={106 + ri * 15} width={seg.w} height="6" rx="2" fill={seg.c}/>;
          cx += seg.w;
          return el;
        });
      })}
      <line x1="198" y1="296" x2="375" y2="296" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="208" y="302" width="48" height="16" rx="5" fill="#475569"/>
      <text x="232" y="314" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#fff" textAnchor="middle">Run</text>
      <rect x="262" y="302" width="56" height="16" rx="5" fill="#4361EE"/>
      <text x="290" y="314" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#fff" textAnchor="middle">Submit</text>
      <rect x="208" y="322" width="160" height="14" rx="4" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1"/>
      <circle cx="218" cy="329" r="4" fill="#22c55e"/>
      <text x="226" y="333" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#16a34a">Passed 4/4 — 198ms ✓</text>
      <rect x="383" y="72" width="177" height="260" rx="10" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="383" y="72" width="177" height="28" rx="10" fill="#f8fafc"/>
      <rect x="383" y="86" width="177" height="14" fill="#f8fafc"/>
      <text x="395" y="90" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="600" fill="#374151">Code Editor</text>
      <text x="552" y="90" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#3b82f6" textAnchor="end">Python</text>
      <line x1="383" y1="100" x2="560" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
      {[1,2,3,4,5,6,7,8].map(n => (
        <text key={n} x="395" y={108 + n * 15} fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#a1a1a1" textAnchor="middle">{n}</text>
      ))}
      {[
        { x: 405, segs: [{ w: 30, c: "#7C3AED" }, { w: 4, c: "t" }, { w: 20, c: "#4361EE" }, { w: 4, c: "t" }, { w: 36, c: "rgba(255,255,255,0.35)" }] },
        { x: 413, segs: [{ w: 60, c: "rgba(255,255,255,0.2)" }] },
        { x: 413, segs: [{ w: 16, c: "#7C3AED" }, { w: 4, c: "t" }, { w: 40, c: "rgba(255,255,255,0.35)" }] },
        { x: 421, segs: [{ w: 18, c: "rgba(255,255,255,0.2)" }, { w: 4, c: "t" }, { w: 22, c: "#4361EE" }] },
        { x: 421, segs: [{ w: 14, c: "#7C3AED" }, { w: 4, c: "t" }, { w: 36, c: "rgba(255,255,255,0.2)" }] },
        { x: 429, segs: [{ w: 50, c: "rgba(255,255,255,0.15)" }] },
        { x: 421, segs: [{ w: 28, c: "rgba(255,255,255,0.15)" }] },
        { x: 413, segs: [{ w: 16, c: "rgba(255,255,255,0.15)" }] },
      ].map((row, ri) => {
        let cx = row.x;
        return row.segs.map((seg, si) => {
          const el = seg.c === "t" ? null : <rect key={`${ri}-${si}`} x={cx} y={106 + ri * 15} width={seg.w} height="6" rx="2" fill={seg.c}/>;
          cx += seg.w;
          return el;
        });
      })}
      <line x1="383" y1="296" x2="560" y2="296" stroke="#e5e7eb" strokeWidth="1"/>
      <rect x="393" y="302" width="48" height="16" rx="5" fill="#475569"/>
      <text x="417" y="314" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#fff" textAnchor="middle">Run</text>
      <rect x="447" y="302" width="56" height="16" rx="5" fill="#4361EE"/>
      <text x="475" y="314" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#fff" textAnchor="middle">Submit</text>
      <rect x="393" y="322" width="160" height="14" rx="4" fill="#fef2f2" stroke="#ef4444" strokeWidth="1"/>
      <circle cx="403" cy="329" r="4" fill="#ef4444"/>
      <text x="411" y="333" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#ef4444">2/4 failed ❌ test 3</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   HOW TO PLAY
══════════════════════════════════════════════ */

const hiwSteps = [
  { num: "01", title: "Create an Account",  accent: C.blue, desc: "Sign up in seconds. Pick a username, set a password, and you're in. No credit card needed.",                                        Illustration: IllustrationRegister   },
  { num: "02", title: "Create a Room",      accent: C.pink, desc: "Choose a difficulty level and your preferred language, then open a room for others to join.",                                       Illustration: IllustrationCreateRoom },
  { num: "03", title: "Join a Room",        accent: C.blue, desc: "Browse open rooms, pick one that matches your skill level, and hit Join to enter the lobby.",                                       Illustration: IllustrationJoinRoom   },
  { num: "04", title: "Wait in the Lobby",  accent: C.pink, desc: "Both players land in the lobby. Ready up and wait for your opponent — the duel starts when both are set.",                         Illustration: IllustrationLobby      },
  { num: "05", title: "Battle Begins!",     accent: C.blue, desc: "A coding challenge drops for both of you simultaneously. Write the fastest, most elegant solution to win.",                        Illustration: IllustrationBattle     },
];

export function HowToPlay() {
  return (
    <section id="section-howtoplay" style={{ background: C.bg, padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.3em", color: C.blue, textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>The Rules of Combat</span>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: C.dark, letterSpacing: "-0.02em" }}>How To Play</h2>
          <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.6, maxWidth: 480, margin: "0.8rem auto 0" }}>From zero to gladiator in five steps.</p>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {hiwSteps.map((step, i) => {
            const isEven = i % 2 === 0;
            const TextBlock = (
              <div style={{ padding: "2rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", fontWeight: 700, color: step.accent, letterSpacing: "0.15em", display: "block", marginBottom: "0.5rem" }}>{step.num}</span>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: C.dark, marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>{step.title}</div>
                <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            );
            const ImageBlock = (
              <div style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 4px 24px rgba(26,26,46,0.07)", width: "100%", maxWidth: 280 }}>
                  <step.Illustration />
                </div>
              </div>
            );
            return (
              <Reveal key={step.num} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <div style={{ flex: 1 }}>{isEven ? TextBlock : ImageBlock}</div>
                  <div style={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    {i > 0 && <div style={{ width: 2, height: 48, background: `linear-gradient(to bottom, ${hiwSteps[i - 1].accent}50, ${step.accent}80)` }} />}
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: step.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 6px ${step.accent}20, 0 4px 16px ${step.accent}40`, flexShrink: 0, zIndex: 1 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: 800, color: "#fff" }}>{step.num}</span>
                    </div>
                    {i < hiwSteps.length - 1 && <div style={{ width: 2, height: 48, background: `linear-gradient(to bottom, ${step.accent}80, ${hiwSteps[i + 1].accent}50)` }} />}
                  </div>
                  <div style={{ flex: 1 }}>{isEven ? ImageBlock : TextBlock}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   WITNESS THE COMBAT — live battle demo
══════════════════════════════════════════════ */

function CodeLine({ children }: { children: React.ReactNode }) {
  return <div style={{ lineHeight: 1.85 }}>{children}</div>;
}

export function DemoSection() {
  return (
    <section id="section-features" style={{ background: C.dark, padding: "8rem 2rem 9rem", position: "relative" }}>

      {/* Top diagonal */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: "none", zIndex: 1 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: "100%", height: 80, display: "block" }}>
          <polygon points="0,0 1440,0 1440,80" fill={C.bg} />
        </svg>
      </div>

      {/* Bottom diagonal */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: "none", zIndex: 1 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: "100%", height: 80, display: "block" }}>
          <polygon points="0,0 0,80 1440,80" fill={C.bg} />
        </svg>
      </div>

      <MatrixCanvas opacity={0.09} />

      <div style={{ position: "absolute", top: "20%", left: "5%", width: 520, height: 520, background: "radial-gradient(circle, rgba(67,97,238,.13) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "15%", right: "4%", width: 380, height: 380, background: "radial-gradient(circle, rgba(236,72,153,.08) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(67,97,238,.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 2 }}>

        <Reveal style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.3em", color: C.blue, textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>
            Live Battle Preview
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "0.9rem" }}>
            Witness the{" "}
            <span style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Combat
            </span>
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,.42)", maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
            Two gladiators, one problem —{" "}
            <em style={{ color: "rgba(67,97,238,.9)", fontStyle: "normal", fontWeight: 600 }}>Two Sum</em>
            . Who submits first?
          </p>
        </Reveal>

        <Reveal>
          {/* Wrapper so gladiator can be positioned relative to the card */}
          <div style={{ position: "relative" }}>

            {/* Glowing card */}
            <div style={{
              position: "relative",
              borderRadius: 20,
              padding: 3,
              background: "linear-gradient(135deg, rgba(67,97,238,.5), rgba(236,72,153,.3), rgba(67,97,238,.4))",
              boxShadow: "0 0 60px rgba(67,97,238,.25), 0 20px 60px rgba(0,0,0,.4)",
            }}>
              <div style={{ background: "#eef1f6", borderRadius: 17, overflow: "hidden" }}>
                <div className="demo-grid" style={{ display: "flex", alignItems: "stretch", gap: 0, minHeight: 484 }}>

                  {/* ── YOUR SCREEN ── */}
                  <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>
                    <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "5px 12px", display: "flex", alignItems: "center", gap: 7 }}>
                      <img src="/avatar1.png" alt="You" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a1a2e" }}>Spartacus_42</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "1px 7px", borderRadius: 5, marginLeft: "auto", border: "1px solid #dbeafe" }}>You</span>
                    </div>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.3fr", minHeight: 0 }}>
                      <div style={{ background: "#fff", borderRight: "1px solid #f0f0f0", padding: "0.7rem 0.9rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Two Sum</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#22c55e", background: "#dcfce7", padding: "1px 7px", borderRadius: 8 }}>Easy</span>
                            <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "1px 6px", borderRadius: 5, border: "1px solid #dbeafe" }}>Python</span>
                          </div>
                        </div>
                        <hr style={{ border: "none", borderTop: "1.5px solid #f0f0f0" }} />
                        <div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>Description</div>
                          <p style={{ fontSize: "0.67rem", color: "#6b7280", lineHeight: 1.55, margin: 0 }}>Given array <code style={{ color: "#3b82f6", background: "#eff6ff", padding: "0 2px", borderRadius: 3 }}>nums</code> and integer <code style={{ color: "#3b82f6", background: "#eff6ff", padding: "0 2px", borderRadius: 3 }}>target</code>, return indices of two numbers adding up to target.</p>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>Input</div>
                          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "0.4rem 0.65rem" }}>
                            <pre style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.62rem", color: "#4b5563", margin: 0 }}>{"nums = [2,7,11,15]\ntarget = 9"}</pre>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>Output</div>
                          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "0.4rem 0.65rem" }}>
                            <pre style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.62rem", color: "#4b5563", margin: 0 }}>Return [0, 1]</pre>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "0.55rem 0.9rem", borderBottom: "2px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a1a2e" }}>Code Editor</span>
                          <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "1px 6px", borderRadius: 5, border: "1px solid #dbeafe" }}>PYTHON</span>
                        </div>
                        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                          <div style={{ minWidth: 28, borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "flex-end", paddingTop: 5, userSelect: "none" }}>
                            {[1,2,3,4,5,6,7,8].map(n => (
                              <div key={n} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#a1a1a1", lineHeight: "1.8", paddingRight: 4 }}>{n}</div>
                            ))}
                          </div>
                          <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", lineHeight: 1.8, margin: 0, padding: "5px 0.7rem", whiteSpace: "pre-wrap", color: "#374151", flex: 1 }}>
                            <CodeLine><span style={{ color: "#6d28d9" }}>{"def"}</span>{" "}<span style={{ color: "#2563eb" }}>{"two_sum"}</span>{"(nums, target):"}</CodeLine>
                            <CodeLine>{"    seen = {}"}</CodeLine>
                            <CodeLine>{"    "}<span style={{ color: "#6d28d9" }}>{"for"}</span>{" i, n "}<span style={{ color: "#6d28d9" }}>{"in"}</span>{" "}<span style={{ color: "#2563eb" }}>{"enumerate"}</span>{"(nums):"}</CodeLine>
                            <CodeLine>{"        diff = target - n"}</CodeLine>
                            <CodeLine>{"        "}<span style={{ color: "#6d28d9" }}>{"if"}</span>{" diff "}<span style={{ color: "#6d28d9" }}>{"in"}</span>{" seen:"}</CodeLine>
                            <CodeLine>{"            "}<span style={{ color: "#6d28d9" }}>{"return"}</span>{" [seen[diff], i]"}</CodeLine>
                            <CodeLine>{"        seen[n] = i"}</CodeLine>
                            <CodeLine>{"    "}<span style={{ color: "#6d28d9" }}>{"return"}</span>{" []"}</CodeLine>
                          </pre>
                        </div>
                        <div style={{ padding: "7px 10px", background: "#f8fafc", borderTop: "1.5px solid #e2e8f0", display: "flex", gap: 7 }}>
                          <button disabled style={{ background: "#475569", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", height: 28, fontSize: "0.68rem", fontWeight: 700, cursor: "default" }}>▶ Run</button>
                          <button disabled style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", height: 28, fontSize: "0.68rem", fontWeight: 700, cursor: "default" }}>Submit ↗</button>
                        </div>
                        <div style={{ padding: "0.5rem 0.9rem", borderTop: "1.5px solid #e2e8f0" }}>
                          <div style={{ background: "#f0fdf4", border: "1px solid #16a34a", borderRadius: 6, padding: "0.4rem 0.65rem", display: "flex", gap: 5, alignItems: "center" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#16a34a" }}>4/4 passed ✅</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── VS DIVIDER ── */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 56, background: "#eef1f6", zIndex: 2 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 1.5, height: 60, background: "linear-gradient(to bottom, transparent, #d1d5db)" }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.08em" }}>VS</span>
                      <div style={{ width: 1.5, height: 60, background: "linear-gradient(to bottom, #d1d5db, transparent)" }} />
                    </div>
                  </div>

                  {/* ── OPPONENT SCREEN ── */}
                  <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>
                    <div style={{ background: "#fff5f5", borderBottom: "1px solid #fee2e2", padding: "5px 12px", display: "flex", alignItems: "center", gap: 7 }}>
                      <img src="/avatar2.png" alt="Opponent" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a1a2e" }}>NeptuneCodes</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#ef4444", background: "#fef2f2", padding: "1px 7px", borderRadius: 5, marginLeft: "auto", border: "1px solid #fecaca" }}>Opponent</span>
                    </div>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.3fr", minHeight: 0 }}>
                      <div style={{ background: "#fff", borderRight: "1px solid #f0f0f0", padding: "0.7rem 0.9rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Two Sum</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#22c55e", background: "#dcfce7", padding: "1px 7px", borderRadius: 8 }}>Easy</span>
                            <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "1px 6px", borderRadius: 5, border: "1px solid #dbeafe" }}>Python</span>
                          </div>
                        </div>
                        <hr style={{ border: "none", borderTop: "1.5px solid #f0f0f0" }} />
                        <div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>Description</div>
                          <p style={{ fontSize: "0.67rem", color: "#6b7280", lineHeight: 1.55, margin: 0 }}>Given array <code style={{ color: "#3b82f6", background: "#eff6ff", padding: "0 2px", borderRadius: 3 }}>nums</code> and integer <code style={{ color: "#3b82f6", background: "#eff6ff", padding: "0 2px", borderRadius: 3 }}>target</code>, return indices of two numbers adding up to target.</p>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>Input</div>
                          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "0.4rem 0.65rem" }}>
                            <pre style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.62rem", color: "#4b5563", margin: 0 }}>{"nums = [2,7,11,15]\ntarget = 9"}</pre>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>Output</div>
                          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "0.4rem 0.65rem" }}>
                            <pre style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.62rem", color: "#4b5563", margin: 0 }}>Return [0, 1]</pre>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "0.55rem 0.9rem", borderBottom: "2px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a1a2e" }}>Code Editor</span>
                          <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "1px 6px", borderRadius: 5, border: "1px solid #dbeafe" }}>PYTHON</span>
                        </div>
                        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                          <div style={{ minWidth: 28, borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "flex-end", paddingTop: 5, userSelect: "none" }}>
                            {[1,2,3,4,5,6,7,8].map(n => (
                              <div key={n} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#a1a1a1", lineHeight: "1.8", paddingRight: 4 }}>{n}</div>
                            ))}
                          </div>
                          <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", lineHeight: 1.8, margin: 0, padding: "5px 0.7rem", whiteSpace: "pre-wrap", color: "#374151", flex: 1 }}>
                            <CodeLine><span style={{ color: "#6d28d9" }}>{"def"}</span>{" "}<span style={{ color: "#2563eb" }}>{"two_sum"}</span>{"(nums, target):"}</CodeLine>
                            <CodeLine>{"    left, right = 0, len(nums)-1"}</CodeLine>
                            <CodeLine>{"    "}<span style={{ color: "#6d28d9" }}>{"while"}</span>{" left < right:"}</CodeLine>
                            <CodeLine>{"        s = nums[left] + nums[right]"}</CodeLine>
                            <CodeLine>{"        "}<span style={{ color: "#6d28d9" }}>{"if"}</span>{" s == target:"}</CodeLine>
                            <CodeLine>{"            "}<span style={{ color: "#6d28d9" }}>{"return"}</span>{" [left, right]"}</CodeLine>
                            <CodeLine>{"        elif s < target: left += 1"}</CodeLine>
                            <CodeLine>{"        else: right -= 1"}</CodeLine>
                          </pre>
                        </div>
                        <div style={{ padding: "7px 10px", background: "#f8fafc", borderTop: "1.5px solid #e2e8f0", display: "flex", gap: 7 }}>
                          <button disabled style={{ background: "#475569", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", height: 28, fontSize: "0.68rem", fontWeight: 700, cursor: "default" }}>▶ Run</button>
                          <button disabled style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", height: 28, fontSize: "0.68rem", fontWeight: 700, cursor: "default" }}>Submit ↗</button>
                        </div>
                        <div style={{ padding: "0.5rem 0.9rem", borderTop: "1.5px solid #e2e8f0" }}>
                          <div style={{ background: "#fef2f2", border: "1px solid #ef4444", borderRadius: 6, padding: "0.4rem 0.65rem", display: "flex", gap: 5, alignItems: "center" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#ef4444" }}>2/4 passed ❌ test 3</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Gladiator2 — ~1/3 of body overlaps the right side of the screen */}
            <img
  src="/gladiator2.png"
  alt=""
  className="demo-gladiator"
  style={{
    position: "absolute",
    right: -300,
    bottom: -24,
    height: 520,
    width: "auto",
    zIndex: 10,
    pointerEvents: "none",
    filter: "drop-shadow(-12px 0 30px rgba(67,97,238,.45)) drop-shadow(0 20px 44px rgba(0,0,0,.7))",
    animation: "floating 5s ease-in-out infinite",
  }}
/>

          </div>
        </Reveal>
      </div>
    </section>
  );
}