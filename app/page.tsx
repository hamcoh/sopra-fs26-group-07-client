"use client";
import "@/styles/landing.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HowToPlay , DemoSection} from "@/components/LandingIllustrations";
import { getApiDomain } from "@/utils/domain";
import { TeamOutlined, CodeOutlined, GlobalOutlined, ThunderboltOutlined } from "@ant-design/icons";
import MatrixCanvas from "@/components/MatrixCanvas";
import useLocalStorage from "@/hooks/useLocalStorage";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import { useAuth } from "@/hooks/useAuth";

/* ─── Design tokens ─── */
const C = {
  bg:    "#EEF1F6",
  dark:  "#1A1A2E",
  blue:  "#4361EE",
  pink:  "#EC4899",
  muted: "#6B7280",
  border:"#D1D5DB",
};

/* ══════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════ */
function useReveal(direction: "up" | "left" | "right" = "up") {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cls =
      direction === "left"  ? "cod-reveal-left"  :
      direction === "right" ? "cod-reveal-right" :
                              "cod-reveal";
    el.classList.add(cls);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [direction]);
  return ref;
}

function Reveal({
  children, style, direction = "up", delay = 0,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  direction?: "up" | "left" | "right";
  delay?: number;
}) {
  const ref = useReveal(direction);
  return (
    <div ref={ref} style={{ ...style, transitionDelay: delay ? `${delay}s` : undefined }}>
      {children}
    </div>
  );
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function ApiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M8.293 6.293L2.586 12l5.707 5.707 1.414-1.414L5.414 12l4.293-4.293zm7.414 0l-1.414 1.414L18.586 12l-4.293 4.293 1.414 1.414L21.414 12zM11.998 3l-1.943.554L8.5 21l1.943-.554z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════
   NAV
══════════════════════════════════════════════ */
function Nav() {
  const router   = useRouter();
  const scrollY  = useScrollY();
  const onLight  = scrollY > (typeof window !== "undefined" ? window.innerHeight * 0.85 : 900);
  const scrolled = scrollY > 60;
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const { value: token }    = useLocalStorage("token", "");
  const { value: avatarId } = useLocalStorage("avatarId", "1");
  const { handleLogOut }    = useAuth();
  const isLoggedIn = !!token;

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showDropdown]);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 3rem", height: 80,
      background: scrolled ? (onLight ? "rgba(255,255,255,.97)" : "rgba(26,26,46,.92)") : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? (onLight ? "1px solid rgba(67,97,238,.15)" : "1px solid rgba(255,255,255,.08)") : "none",
      transition: "background .35s, border-color .35s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="codosseum_icon.svg" alt="Logo" width={60} height={60} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: onLight && scrolled ? C.dark : "#fff", lineHeight: 1, transition: "color .35s" }}>Codosseum</div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: onLight && scrolled ? C.muted : "rgba(255,255,255,.45)", transition: "color .35s" }}>1v1 Coding Battle</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
        {[["How To Play","section-howtoplay"],["Features","section-features"],["About Us","section-about"]].map(([label, id]) => (
          <button key={label} className={onLight && scrolled ? "nav-link-light" : "nav-link-dark"} onClick={() => scrollTo(id)}>{label}</button>
        ))}
        <div style={{ width: 1, height: 22, background: onLight && scrolled ? C.border : "rgba(255,255,255,.2)" }} />

        {isLoggedIn ? (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              aria-label="Account menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
            >
              <CodosseumAvatar id={Number(avatarId) || 1} backgroundColor="transparent" />
            </button>

            {showDropdown && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                background: "#fff", borderRadius: 14, padding: 6,
                boxShadow: "0 8px 32px rgba(0,0,0,.18)",
                border: "1px solid rgba(67,97,238,.1)",
                minWidth: 160, zIndex: 400,
              }}>
                {([
                  { label: "⚔️  Menu",   path: "/menu" },
                  { label: "👤  Profile", path: "/profile" },
                ] as { label: string; path: string }[]).map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => { router.push(path); setShowDropdown(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "9px 14px", borderRadius: 9, fontSize: "0.85rem", fontWeight: 600, color: C.dark, fontFamily: "'Inter', sans-serif", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >{label}</button>
                ))}
                <div style={{ height: 1, background: "#e5e7eb", margin: "4px 6px" }} />
                <button
                  onClick={() => { setShowDropdown(false); handleLogOut(); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "9px 14px", borderRadius: 9, fontSize: "0.85rem", fontWeight: 600, color: "#dc2626", fontFamily: "'Inter', sans-serif", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >🚪  Log Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => router.push("/login")} className="btn-login">Login</button>
            <button onClick={() => router.push("/register")} className="btn-primary" style={{ fontSize: ".78rem", padding: ".5rem 1.2rem", borderRadius: 10 }}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
const HERO_SPARKLES = [
  { left: "8%",  top: "18%", sz: 5, delay: "0s",   dur: "2.4s" },
  { left: "18%", top: "72%", sz: 4, delay: ".6s",  dur: "2.0s" },
  { left: "88%", top: "14%", sz: 6, delay: "1.2s", dur: "2.6s" },
  { left: "92%", top: "65%", sz: 4, delay: ".3s",  dur: "2.1s" },
  { left: "5%",  top: "48%", sz: 7, delay: ".9s",  dur: "2.8s" },
  { left: "95%", top: "38%", sz: 5, delay: "1.5s", dur: "2.3s" },
  { left: "55%", top: "8%",  sz: 4, delay: ".4s",  dur: "1.9s" },
  { left: "48%", top: "90%", sz: 6, delay: "1.1s", dur: "2.5s" },
];

function Hero() {
  const router  = useRouter();
  const scrollY = useScrollY();

  return (
    <section style={{ background: C.dark, minHeight: "100vh", display: "flex", alignItems: "center", padding: "8rem 4rem 4rem", overflow: "hidden", position: "relative" }}>
      <MatrixCanvas opacity={0.2} />
      <div style={{ position: "absolute", top: -200, right: -100, width: 700, height: 700, background: "radial-gradient(circle, rgba(67,97,238,.18) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(236,72,153,.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

      <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center", position: "relative", zIndex: 2 }}>
        {/* Left */}
        <div>
          <div className="h1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(67,97,238,.12)", border: "1px solid rgba(67,97,238,.35)", borderRadius: 50, padding: "6px 18px", marginBottom: "1.6rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.pink, boxShadow: `0 0 10px ${C.pink}`, animation: "pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".2em", color: "rgba(67,97,238,.9)", textTransform: "uppercase" }}>&lt;/&gt; The Coding Arena &lt;/&gt;</span>
          </div>
          <div className="h2" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1, marginBottom: "1.4rem", whiteSpace: "nowrap" }}>
            <span style={{ color: "#fff" }}>COD</span><span className="grad">OSSEUM</span>
          </div>
          <p className="h3" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".85rem", color: "rgba(255,255,255,.4)", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Code · Fight · Conquer</p>
          <p className="h4" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,.55)", lineHeight: 1.75, maxWidth: 460, marginBottom: "2.4rem" }}>
            Two gladiators. One challenge. The fastest, most elegant code wins. Compete in real-time 1v1 duels, climb the ranks, and etch your name into the arena&apos;s history.
          </p>
          <div className="h5" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <button className="btn-hero" style={{ fontSize: "1rem", padding: "1.05rem 2.6rem" }} onClick={() => router.push("/register")}>Enter the Arena ⚔️</button>
            <button className="btn-outline-light" onClick={() => document.getElementById("section-howtoplay")?.scrollIntoView({ behavior: "smooth" })}>How To Play</button>
          </div>
          <div className="h6" style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
            {[["⚔️","1v1 Duels"],["🏆","Ranked"],["⚡","Real-Time"],["🌍","Global"]].map(([icon, label]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 50, padding: ".35rem 1rem", fontSize: ".76rem", fontWeight: 600, color: "rgba(255,255,255,.7)", backdropFilter: "blur(4px)" }}>{icon} {label}</span>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="hero-img-col" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          {HERO_SPARKLES.map((s, i) => (
            <div key={i} style={{ position: "absolute", left: s.left, top: s.top, width: s.sz, height: s.sz, borderRadius: "50%", background: "#fff", zIndex: 3, animation: `sparkle ${s.dur} ${s.delay} ease-in-out infinite` }} />
          ))}
          <div style={{ position: "relative", width: 560, height: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: 540, height: 540, borderRadius: "50%", border: "1px solid rgba(67,97,238,.15)", animation: "rotateCW 40s linear infinite" }}>
              {[0,90,180,270].map(deg => <div key={deg} style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: C.blue, boxShadow: `0 0 10px ${C.blue}`, top: "50%", left: "50%", transform: `rotate(${deg}deg) translateX(270px) translateY(-50%)` }} />)}
            </div>
            <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", border: "1.5px solid rgba(236,72,153,.18)", animation: "rotateCCW 28s linear infinite" }}>
              {[45,135,225,315].map(deg => <div key={deg} style={{ position: "absolute", width: 5, height: 5, borderRadius: "50%", background: C.pink, boxShadow: `0 0 8px ${C.pink}`, top: "50%", left: "50%", transform: `rotate(${deg}deg) translateX(210px) translateY(-50%)` }} />)}
            </div>
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(67,97,238,.1)", animation: "rotateCW 18s linear infinite" }} />
            <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(67,97,238,.28) 0%, rgba(236,72,153,.12) 50%, transparent 70%)", filter: "blur(20px)", zIndex: 1 }} />
            <img
              src="/gladiators.png"
              alt="Codosseum Gladiators"
              style={{ width: "150%", maxWidth: 800, height: "auto", position: "relative", zIndex: 2, transform: `translateY(${-scrollY * 0.04}px)`, animation: "glow 3.5s ease-in-out infinite, floating 4.5s ease-in-out infinite", filter: "drop-shadow(0 0 32px rgba(67,97,238,.6)) drop-shadow(0 32px 64px rgba(0,0,0,.5))" }}
            />
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem", zIndex: 3 }}>
        <div className="scroll-line" />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".55rem", letterSpacing: ".3em", color: "rgba(255,255,255,.3)", textTransform: "uppercase" }}>Scroll</span>
      </div>

 
    </section>
  );
}

/* ══════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════ */
interface LandingStats {
  amountUsers: number;
  amountProblems: number;
  amountTestCases: number;
  amountLanguages: number;
}

  function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [started, setStarted] = useState(false);
    const [count, setCount] = useState(0);
  
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setStarted(true), obs.disconnect();
      }, { threshold: 0.4 });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
  
    useEffect(() => {
      if (!started) return;
      let current = 0;
      const steps = 60, increment = to / steps;
      const timer = setInterval(() => {
        current += increment;
        current >= to ? (setCount(to), clearInterval(timer)) : setCount(Math.round(current));
      }, 40);
      return () => clearInterval(timer);
    }, [started, to]);
  
    return <span ref={ref}>{count}{suffix}</span>;
  }

  function StatsBar() {
    const [liveStats, setLiveStats] = useState<LandingStats | null>(null);

    useEffect(() => {
      fetch(`${getApiDomain()}/stats/landing-page`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
        .then((data: LandingStats | null) => { if (data) setLiveStats(data); });
    }, []);

    const STATS = [
      { val: liveStats?.amountUsers    ?? 0, suffix: "",   icon: <TeamOutlined />,        label: "Gladiators" },
      { val: liveStats?.amountProblems ?? 0, suffix: "",   icon: <CodeOutlined />,        label: "Problems" },
      { val: liveStats?.amountLanguages ?? 0, suffix: "",  icon: <GlobalOutlined />,      label: "Languages" },
      { val: 99,                              suffix: "ms", icon: <ThunderboltOutlined />, label: "Avg Judge Time" },
    ];

    return (
      <section className="dot-grid-bg" style={{ background: C.bg, padding: "4rem 2rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", right: "4%", transform: "translateY(-50%)", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, rgba(67,97,238,.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "2%", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, rgba(236,72,153,.05) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".3em", color: C.blue, textTransform: "uppercase", display: "block", marginBottom: ".6rem" }}>
              By The Numbers
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: C.dark, letterSpacing: "-.02em" }}>
              The Arena in Numbers
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }}>
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="stat-card">
                  <div className="stat-card-bar" style={{ background: i % 2 === 0 ? `linear-gradient(90deg, ${C.blue}, ${C.pink})` : `linear-gradient(90deg, ${C.pink}, ${C.blue})` }} />
                  <span className="stat-icon">{s.icon}</span>
                  <span className="stat-value"><CountUp to={s.val} suffix={s.suffix} /></span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

/* ══════════════════════════════════════════════
   LANGUAGES
══════════════════════════════════════════════ */
function PythonIcon({ size = 46 }: { size?: number }) {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <rect width="64" height="64" rx="18" fill="rgba(55,118,171,.12)" />
        <path d="M31.7 12c-8.2 0-7.7 3.6-7.7 3.6v3.7h7.9v1.1H20.8S15 19.7 15 28.2c0 8.4 5.1 8.1 5.1 8.1h3v-4.2s-.2-5.1 5-5.1h7.8s4.4.1 4.4-4.3v-7.1S41 12 31.7 12Zm-4.4 3.1a2 2 0 1 1 0 4.1 2 2 0 0 1 0-4.1Z" fill="#3776AB" />
        <path d="M32.3 52c8.2 0 7.7-3.6 7.7-3.6v-3.7h-7.9v-1.1h11.1S49 44.3 49 35.8c0-8.4-5.1-8.1-5.1-8.1h-3v4.2s.2 5.1-5 5.1h-7.8s-4.4-.1-4.4 4.3v7.1S23 52 32.3 52Zm4.4-3.1a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1Z" fill="#FFD43B" />
      </svg>
    );
  }
  
  function JavaIcon({ size = 46 }: { size?: number }) {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <rect width="64" height="64" rx="18" fill="rgba(237,117,0,.12)" />
        <path d="M29.5 39.8s-2.1 1.2 1.5 1.6c4.4.5 6.6.4 11.4-.5 0 0 1.3.8 3.1 1.5-11 4.7-24.9-.3-16-2.6Z" fill="#5382A1" />
        <path d="M28.2 33.8s-2.4 1.8 1.3 2.2c4.8.5 8.6.6 15.2-.8 0 0 .9.9 2.4 1.4-13.5 3.9-28.5.3-18.9-2.8Z" fill="#5382A1" />
        <path d="M39.7 23.6c2.7 3.1-.7 5.9-.7 5.9s6.9-3.6 3.7-8.1c-3-4.2-5.3-6.3 7-13.5 0 0-19.4 4.8-10 15.7Z" fill="#E76F00" />
        <path d="M54.2 44.2s1.6 1.3-1.8 2.3c-6.5 2-27.1 2.6-32.8.1-2.1-.9 1.8-2.2 3-2.4 1.3-.3 2-.3 2-.3-2.3-1.6-15 3.2-6.4 4.6 23.4 3.8 42.6-1.7 36-4.3Z" fill="#5382A1" />
        <path d="M30.5 27.6s-10.6 2.5-3.8 3.4c2.9.4 8.7.3 14.1-.1 4.4-.4 8.8-1.2 8.8-1.2s-1.5.7-2.7 1.4c-10.8 2.8-31.7 1.5-25.7-1.4 5.1-2.5 9.3-2.1 9.3-2.1Z" fill="#5382A1" />
        <path d="M49.6 37.6c11-5.7 5.9-11.2 2.4-10.4-.9.2-1.3.4-1.3.4s.3-.5 1-.7c7-2.5 12.4 7.3-2.3 11.2 0 0 .1-.3.2-.5Z" fill="#5382A1" />
        <path d="M42.7 4.1s6.1 6.1-5.8 15.4c-9.5 7.5-2.2 11.8 0 16.7-5.6-5.1-9.7-9.6-7-13.8 4.1-6.2 15.3-9.2 12.8-18.3Z" fill="#E76F00" />
      </svg>
    );
  }
  
  function SQLiteIcon({ size = 46 }: { size?: number }) {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <rect width="64" height="64" rx="18" fill="rgba(0,59,87,.12)" />
        <ellipse cx="32" cy="18" rx="16" ry="7" fill="#003B57" opacity=".95" />
        <path d="M16 18v22c0 3.9 7.2 7 16 7s16-3.1 16-7V18c0 3.9-7.2 7-16 7s-16-3.1-16-7Z" fill="#0B5F85" />
        <path d="M16 28c0 3.9 7.2 7 16 7s16-3.1 16-7" fill="none" stroke="#BFE8FF" strokeWidth="2" opacity=".45" />
        <path d="M16 38c0 3.9 7.2 7 16 7s16-3.1 16-7" fill="none" stroke="#BFE8FF" strokeWidth="2" opacity=".45" />
        <path d="M42 13c-3.5 7.5-6.3 16-7.8 25.8 4.2-7.6 8.9-14.3 14.3-19.8-2.1-.6-4.1-2.5-6.5-6Z" fill="#FFFFFF" opacity=".92" />
      </svg>
    );
  }


  const LANGS = [
    { name:"Python", live:true, Icon:PythonIcon },
    { name:"Java",   live:true, Icon:JavaIcon },
    { name:"SQLite", live:true, Icon:SQLiteIcon },
  ];

  function Languages() {
    return (
      <section id="section-languages" className="dot-grid-bg" style={{ background: C.bg, padding: "6rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Slow orbital rings as decoration */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(67,97,238,.07)", animation: "rotateCW 60s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 520, height: 520, borderRadius: "50%", border: "1px solid rgba(236,72,153,.055)", animation: "rotateCCW 42s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", right: "7%", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, rgba(67,97,238,.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, rgba(236,72,153,.055) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Reveal>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".3em", color: C.blue, textTransform: "uppercase", display: "block", marginBottom: ".6rem" }}>Choose Your Weapon</span>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: C.dark, letterSpacing: "-.02em", marginBottom: ".6rem" }}>Supported Languages</h2>
            <p style={{ fontSize: ".92rem", color: C.muted, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 2.5rem" }}>Three battle-ready languages. More coming to the arena soon.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
              {LANGS.map((l, i) => (
                <Reveal key={l.name} delay={i * 0.1}>
                  <div className="language-card">
                    <l.Icon size={56} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18 }}>
                      {l.live && <span className="language-live-dot" />}
                      <span className="language-name">{l.name}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

/* ══════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════ */
const TEAM = [
  { name: "@menthoos",        role: "Frontend",               src: "/avatar1.png", github: "https://github.com/menthoos" },
  { name: "@aldigi27", role: "Backend & Database",     src: "/avatar2.png", github: "https://github.com/aldigi27" },
  { name: "@hamcoh",   role: "Backend",                src: "/avatar3.png", github: "https://github.com/hamcoh" },
  { name: "@clstein",     role: "Frontend",               src: "/avatar4.png", github: "https://github.com/clstein" },
  { name: "@supermqx",  role: "Backend & Judge Engine", src: "/avatar5.png", github: "https://github.com/supermqx" },
];

function AboutSection() {
  return (
    <section id="section-about" className="dot-grid-bg" style={{ background: C.bg, paddingTop: "2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 280, background: `radial-gradient(ellipse, rgba(67,97,238,.07) 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 8rem", position: "relative", zIndex: 1 }}>
        <Reveal style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".3em", color: C.blue, textTransform: "uppercase", display: "block", marginBottom: ".6rem" }}>The Gladiators Behind the Arena</span>
          <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: C.dark, letterSpacing: "-.02em", marginBottom: "1rem" }}>
            About <span className="grad">Us</span>
          </h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(67,97,238,.07)", border: "1px solid rgba(67,97,238,.18)", borderRadius: 50, padding: "6px 20px", marginBottom: "1.5rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".72rem", color: C.blue, letterSpacing: ".15em" }}>Group #07</span>
          </div>
          <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.75, maxWidth: 620, margin: "0 auto" }}>
            We are a team of passionate developers who built Codosseum as part of our university project. Our goal: make competitive programming fun, fast, and accessible to everyone.
          </p>
        </Reveal>
        <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1.25rem" }}>
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="card-light">
                <img src={m.src} alt={m.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", margin: "0 auto 1rem", display: "block", boxShadow: "0 8px 24px rgba(67,97,238,.15)", border: "2px solid rgba(67,97,238,.2)" }} />
                <a
  href={m.github}
  target="_blank"
  rel="noopener noreferrer"
  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".9rem", fontWeight: 700, color: C.dark, marginBottom: ".3rem", textDecoration: "none", transition: "color .2s" }}
  onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
  onMouseLeave={e => (e.currentTarget.style.color = C.dark)}
>
  <GithubIcon size={13} />
  {m.name}
</a>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".58rem", color: C.blue, letterSpacing: ".08em", textTransform: "uppercase" }}>{m.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}



/* ══════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ background: C.dark, borderTop: "1px solid rgba(67,97,238,.15)", padding: "4rem 3rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }}>
        
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="codosseum_icon.svg" alt="Logo" width={44} height={44} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>Codosseum</span>
      </div>
      <div style={{ display: "flex", gap: "1.75rem" }}>
        {[
          { label:"Client Repo", url:"https://github.com/hamcoh/sopra-fs26-group-07-client", Icon:GithubIcon },
          { label:"API",         url:"https://judge0.com/",                                   Icon:ApiIcon    },
          { label:"Server Repo", url:"https://github.com/hamcoh/sopra-fs26-group-07-server", Icon:GithubIcon },
        ].map(({ label, url, Icon }) => (
          <button key={label} className="footer-link" onClick={() => globalThis.open(url, "_blank", "noopener,noreferrer")}>
            <Icon size={20} />{label}
          </button>
        ))}
      </div>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".62rem", letterSpacing: ".1em", color: "rgba(255,255,255,.2)" }}>© 2026 Codosseum</span>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="cod-page">
      <Nav />
      <Hero />
      <StatsBar />
      <HowToPlay />
      <DemoSection />
      <Languages />
      <AboutSection />
      <Footer />
    </div>
  );
}