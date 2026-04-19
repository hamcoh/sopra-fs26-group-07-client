import React from "react";
import StatCard from "../base/StatCard";
import styles from "@/styles/profile.module.css";
import { TrophyOutlined, PlayCircleOutlined, RiseOutlined } from "@ant-design/icons";

interface StatGroupProps {
    stats: {
        totalPoints: number;
        totalGamesPlayed: number;
        winRatePercentage: number;
        winCount: number;
    };
    losses: number;
}

export default function StatGroup({ stats, losses }: StatGroupProps) {
    const statConfig = [
        { label: "Points", val: stats.totalPoints, icon: <TrophyOutlined />, cls: styles.icon4 },
        { label: "Games Played", val: stats.totalGamesPlayed, icon: <PlayCircleOutlined />, cls: styles.icon },
        { label: "Win Ratio", val: `${stats.winRatePercentage}%`, icon: <RiseOutlined />, cls: styles.icon5 },
        { label: "Record", val: `${stats.winCount}W - ${losses}L`, icon: <TrophyOutlined />, cls: styles.icon2 },
    ];

    return (
        <div className={styles.statsRow}>
            {statConfig.map((s, i) => (
                <StatCard
                    key={i}
                    title={s.label}
                    value={s.val}
                    icon={s.icon}
                    iconClass={s.cls}
                />
            ))}
        </div>
    );
}