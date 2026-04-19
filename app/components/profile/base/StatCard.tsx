import React from "react";
import styles from "@/styles/profile.module.css";

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    iconClass: string;
}

export default function StatCard({ icon, title, value, iconClass }: StatCardProps) {
    return (
        <div className={styles.statBox}>
            <div className={styles.statTop}>
                <div className={iconClass}>{icon}</div>
                <div className={styles.statTitle}>{title}</div>
            </div>
            <div className={styles.statValue}>{value}</div>
        </div>
    );
}

