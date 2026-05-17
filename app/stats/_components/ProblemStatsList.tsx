"use client";

import { ReactNode } from "react";
import { Spin } from "antd";
import { GameStatsDTO } from "../_types";
import ProblemStatCard from "./ProblemStatCard";
import styles from "@/styles/stats.module.css";

interface ProblemStatsListProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    data: GameStatsDTO[];
    loading: boolean;
    error: string | null;
    accentColor: "orange" | "blue";
}

export default function ProblemStatsList({
                                             title,
                                             subtitle,
                                             icon,
                                             data,
                                             loading,
                                             error,
                                             accentColor,
                                         }: ProblemStatsListProps) {
    if (loading) {
        return (
            <div className={styles.centerState}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.centerState}>
                <p className={styles.errorText}>Could not load problems: {error}</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.centerState}>
                <p className={styles.emptyText}>No problems found yet. Play some games first!</p>
            </div>
        );
    }

    const iconClass = accentColor === "orange" ? styles.iconOrange : styles.iconBlue;

    return (
        <div className={styles.listWrapper}>
            <div className={styles.listHeader}>
                <div className={`${styles.iconBox} ${iconClass}`}>{icon}</div>
                <div>
                    <h2 className={styles.listTitle}>{title}</h2>
                    <p className={styles.listSubtitle}>
                        Top {data.length} problems {accentColor === "orange" ? "ranked by difficulty score" : "ranked by total play count"}
                    </p>
                </div>
            </div>

            <div className={styles.grid}>
                {data.map((problem, index) => (
                    <ProblemStatCard
                        key={problem.problemId ?? index}
                        problem={problem}
                        rank={index + 1}
                        accentColor={accentColor}
                    />
                ))}
            </div>
        </div>
    );
}