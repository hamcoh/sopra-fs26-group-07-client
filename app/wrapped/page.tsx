"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import {
    ArrowLeftOutlined, TrophyOutlined, ThunderboltOutlined,
    CheckCircleOutlined, FireOutlined, CodeOutlined,
    BarChartOutlined, AimOutlined, RocketOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { getApiDomain } from "@/utils/domain";
import styles from "@/styles/wrapped.module.css";

interface PlayerWrappedDTO {
    username: string;
    totalGamesPlayed: number;
    winCount: number;
    drawCount: number;
    playerSumPassedTestCases: number;
    playerSumTotalTestCases: number;
    totalProblemsSolvedFullyCorrect: number;
    percentileRank: number;
    favGameLanguage: string;
    favGameDifficulty: string;
    favGameMode: string;
}

function useCountUp(target: number, duration = 2000): number {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return count;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
    const count = useCountUp(value);
    return <>{count}{suffix}</>;
}

function formatEnum(value: string) {
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRankTier(topPercent: number): { label: string; sub: string } {
    if (topPercent <= 5)  return { label: "Legend",     sub: "You're among the absolute best." };
    if (topPercent <= 15) return { label: "Elite",       sub: "Only a handful of players rank higher." };
    if (topPercent <= 30) return { label: "Pro",         sub: "You're well ahead of most players." };
    if (topPercent <= 50) return { label: "Rising Star", sub: "Above the halfway mark – keep climbing." };
    return                       { label: "Contender",   sub: "Your journey is just getting started." };
}

export default function WrappedPage() {
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();
    const { token, userId, isLoading: authLoading } = useAuth();

    const [data, setData] = useState<PlayerWrappedDTO | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!token) {
            setTimeout(() => router.push("/"));
        }
    }, [authLoading, token]);

    useEffect(() => {
        if (authLoading || !token || !userId) return;

        fetch(`${getApiDomain()}/stats/gameplay-summary/${userId}`, {
            headers: { token },
        })
            .then((res) => {
                if (res.status === 404) { setIsEmpty(true); return null; }
                if (!res.ok) throw new Error("Failed to load stats");
                return res.json();
            })
            .then((json) => { if (json) setData(json); })
            .catch((err) => messageApi.error(err.message))
            .finally(() => setIsLoading(false));
    }, [authLoading, token, userId]);

    if (authLoading || isLoading) {
        return <div className={styles.pageBackground}>{contextHolder}</div>;
    }

    const winRate    = data ? Math.round((data.winCount / Math.max(data.totalGamesPlayed, 1)) * 100) : 0;
    const passRate   = data ? Math.round((data.playerSumPassedTestCases / Math.max(data.playerSumTotalTestCases, 1)) * 100) : 0;
    const topPercent = data ? Math.round(100 - data.percentileRank) : 0;
    const tier       = data ? getRankTier(topPercent) : null;
    const losses     = data ? Math.max(0, data.totalGamesPlayed - data.winCount - (data.drawCount ?? 0)) : 0;

    return (
        <>
            {contextHolder}
            <div className={styles.pageBackground}>
                <div className={styles.orb1} />
                <div className={styles.orb2} />
                <div className={styles.orb3} />

                <div className={styles.content}>
                    <button className={styles.backButton} onClick={() => router.push("/profile")}>
                        <ArrowLeftOutlined /> Back to profile
                    </button>

                    <div className={`${styles.header} ${styles.animFadeUp}`} style={{ animationDelay: "0.05s" }}>
                        <p className={styles.season}>All-time Stats</p>
                        <h1 className={styles.title}>
                            Your <span className={styles.gradient}>Codosseum</span> Stats
                        </h1>
                        {data && <p className={styles.subtitle}>@{data.username}</p>}
                    </div>

                    {isEmpty ? (
                        <div className={`${styles.emptyCard} ${styles.animFadeUp}`} style={{ animationDelay: "0.15s" }}>
                            <AimOutlined style={{ fontSize: 36, color: "#7B4FF0" }} />
                            <p className={styles.emptyTitle}>No code submissions yet</p>
                            <p className={styles.emptyDesc}>Jump into the arena and come back once you&apos;ve played some games!</p>
                            <button className={styles.ctaButton} onClick={() => router.push("/rooms")}>
                                Find a game
                            </button>
                        </div>
                    ) : data && tier && (
                        <>
                            <div className={`${styles.rankCard} ${styles.animFadeUp}`} style={{ animationDelay: "0.12s" }}>
                                <span className={styles.tierBadge}>{tier.label}</span>
                                <p className={styles.rankLabel}>You ranked in the top</p>
                                <p className={styles.rankNumber}>
                                    <AnimatedNumber value={topPercent} suffix="%" />
                                </p>
                                <p className={styles.rankSub}>of all Codosseum players</p>
                                <p className={styles.rankTierSub}>{tier.sub}</p>
                            </div>

                            <div className={`${styles.statGrid} ${styles.animFadeUp}`} style={{ animationDelay: "0.2s" }}>
                                <StatCard
                                    icon={<ThunderboltOutlined />}
                                    label="Games played"
                                    rawValue={data.totalGamesPlayed}
                                    sub={`${data.winCount}W · ${losses}L`}
                                    color="purple"
                                />
                                <StatCard
                                    icon={<TrophyOutlined />}
                                    label="Win rate"
                                    rawValue={winRate}
                                    suffix="%"
                                    sub={`${data.winCount} wins total`}
                                    color="blue"
                                />
                                <StatCard
                                    icon={<CheckCircleOutlined />}
                                    label="Test cases passed"
                                    rawValue={passRate}
                                    suffix="%"
                                    sub={`${data.playerSumPassedTestCases} of ${data.playerSumTotalTestCases}`}
                                    color="purple"
                                />
                                <StatCard
                                    icon={<FireOutlined />}
                                    label="Perfect solutions"
                                    rawValue={data.totalProblemsSolvedFullyCorrect}
                                    sub="all test cases passed"
                                    color="blue"
                                />
                            </div>

                            <div className={`${styles.favsCard} ${styles.animFadeUp}`} style={{ animationDelay: "0.28s" }}>
                                <p className={styles.favsTitle}>Your top choices</p>
                                <div className={styles.favsGrid}>
                                    <FavItem icon={<CodeOutlined />}     label="Language"   value={formatEnum(data.favGameLanguage)} />
                                    <FavItem icon={<BarChartOutlined />} label="Difficulty" value={formatEnum(data.favGameDifficulty)} />
                                    <FavItem icon={<RocketOutlined />}   label="Game mode"  value={formatEnum(data.favGameMode)} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ icon, label, rawValue, suffix = "", sub, color }: {
    icon: React.ReactNode;
    label: string;
    rawValue: number;
    suffix?: string;
    sub: string;
    color: "purple" | "blue";
}) {
    return (
        <div className={`${styles.statBox} ${color === "purple" ? styles.statPurple : styles.statBlue}`}>
            <div className={styles.statIcon}>{icon}</div>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>
                <AnimatedNumber value={rawValue} suffix={suffix} />
            </p>
            <p className={styles.statSub}>{sub}</p>
        </div>
    );
}

function FavItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className={styles.favItem}>
            <div className={styles.favIcon}>{icon}</div>
            <p className={styles.favLabel}>{label}</p>
            <p className={styles.favValue}>{value ?? "—"}</p>
        </div>
    );
}