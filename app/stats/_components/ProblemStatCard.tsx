"use client";

import styles from "@/styles/stats.module.css";
import { GameStatsDTO } from "../_types";

interface ProblemStatCardProps {
    problem: GameStatsDTO;
    rank: number;
    accentColor: "orange" | "blue";
}

function getRankBadgeClass(rank: number, accentColor: "orange" | "blue"): string {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return accentColor === "orange" ? styles.rankOrange : styles.rankBlue;
}

export default function ProblemStatCard({ problem, rank, accentColor }: ProblemStatCardProps) {
    const totalRate = Math.round(problem.totalSuccessRate ?? 0);
    const playerRate = problem.playerSuccessRate !== null ? Math.round(problem.playerSuccessRate) : null;
    const hasPlayed = playerRate !== null;

    const accentClass = accentColor === "orange" ? styles.accentOrange : styles.accentBlue;
    const rankBadgeClass = getRankBadgeClass(rank, accentColor);
    const barClass = accentColor === "orange" ? styles.barOrange : styles.barBlue;

    return (
        <div className={`${styles.card} ${accentClass}`}>
            <div className={styles.cardHeader}>
                <span className={`${styles.rankBadge} ${rankBadgeClass}`}>
                    #{rank}
                </span>
                <span className={styles.languageBadge}>{problem.gameLanguage}</span>
            </div>

            <h3 className={styles.cardTitle}>{problem.title}</h3>
            <p className={styles.cardDescription}>{problem.description}</p>

            <div className={styles.statsSection}>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Overall success rate</span>
                    <span className={styles.statValue}>{totalRate}%</span>
                </div>
                <div className={styles.progressTrack}>
                    <div
                        className={`${styles.progressBar} ${barClass}`}
                        style={{ width: `${totalRate}%` }}
                    />
                </div>

                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Global tests passed</span>
                    <span className={styles.statValue}>
            {problem.sumPassedTestCases} / {problem.sumTotalTestCases}
        </span>
                </div>

                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Total submissions</span>
                    <span className={styles.statValue}>
            {problem.totalSubmissionCount.toLocaleString()}
        </span>
                </div>

            </div>

            <div className={styles.divider} />

            <div className={styles.personalSection}>
                <span className={styles.personalLabel}>Your stats</span>
                {hasPlayed ? (
                    <>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Your success rate</span>
                            <span className={`${styles.statValue} ${styles.playerValue}`}>
                                {playerRate}%
                            </span>
                        </div>
                        <div className={styles.progressTrackPlayer}>
                            <div
                                className={`${styles.progressBar} ${styles.barPlayer}`}
                                style={{ width: `${playerRate}%` }}
                            />
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Tests passed</span>
                            <span className={styles.statValue}>
                                {problem.playerSumPassedTestCases} / {problem.playerSumTotalTestCases}
                            </span>
                        </div>
                    </>
                ) : (
                    <span className={styles.notPlayed}>You haven&apos;t played this one yet</span>
                )}
            </div>
        </div>
    );
}