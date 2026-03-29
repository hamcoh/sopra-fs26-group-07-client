"use client";

import { useRouter } from "next/navigation";
import {
    ArrowLeftOutlined,
    TrophyOutlined,
    RiseOutlined,
    CalendarOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/profile.module.css";
import React, { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState } from "react";
import {getApiDomain} from "@/utils/domain";
import { useParams } from "next/navigation";
import ProfileButton from "@/components/ProfileButton";

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams();
    const {value: token} = useLocalStorage("token", "");
    const userId = params.id as string;
    const [username, setUsername] = useState("");
    const [joinedDate, setJoinedDate] = useState("");
    const [stats, setStats] = useState({
        winCount: 0,
        winRatePercentage: 0,
        totalGamesPlayed: 0,
        totalPoints: 0,
    });
    useEffect(() => {
        if (!token || !userId) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`${getApiDomain()}/users/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token: token,
                    },
                });

                const data = await res.json();
                setUsername(data.username);
                const date = new Date(data.creationDate);
                const formatted = date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                });
                setJoinedDate(formatted);
                setStats({
                    winCount: data.winCount ?? 0,
                    winRatePercentage: data.winRatePercentage ?? 0,
                    totalGamesPlayed: data.totalGamesPlayed ?? 0,
                    totalPoints: data.totalPoints ?? 0,
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
    }, [token, userId]);
    const losses = Math.max(0, stats.totalGamesPlayed - stats.winCount);

    return (
        <div className={styles.pageBackground}>
            <div className={styles.content}>
                <ProfileButton />

                <button className={styles.backButton} onClick={() => router.push("/menu")}>
                    <ArrowLeftOutlined /> Back to Menu
                </button>

                <div className={styles.logoArea2}>
                    <CodosseumLogo size={100} />
                    <div className={styles.logoTexts}>
                        <h1 className={styles.logoTitle}>Profile</h1>
                        <p className={styles.logoSubtitle}>Gladiator stats</p>
                    </div>
                </div>

                {/* Account Title, White Circle and creationDate info */}
                <div className={styles.profile}>
                    <div className={styles.avatarCircle}>
              <span className={styles.avatarLetter}>
                {(username || "???").charAt(0).toUpperCase()}
              </span>
                    </div>
                    <div className={styles.profileText}>
              <span className={styles.usernameText}>
                {username || "???"}
              </span>
                        <div className={styles.titledescr}>
                            <CalendarOutlined/>
                            <span>
                    Joined {joinedDate || "???"}
                  </span>
                        </div>
                    </div>
                </div>

                {/* Player Statistics */}
                <div className={styles.statsRow}>

                    {/* Statbox 1 Total Points */}
                    <div className={styles.statBox}>
                        <div className={styles.statTop}>
                            <div className={styles.icon4}>
                                <TrophyOutlined/>
                            </div>
                            <div className={styles.statTitle}>Points</div>
                        </div>
                        <div className={styles.statValue}>
                            {stats.totalPoints}
                        </div>
                    </div>

                    {/* Statbox 2 Games Played */}
                    <div className={styles.statBox}>
                        <div className={styles.statTop}>
                            <div className={styles.icon}>
                                <PlayCircleOutlined/>
                            </div>
                            <div className={styles.statTitle}>Games Played</div>
                        </div>
                        <div className={styles.statValue}>
                            {stats.totalGamesPlayed}
                        </div>
                    </div>

                    {/* Statbox 3 Win Ratio */}
                    <div className={styles.statBox}>
                        <div className={styles.statTop}>
                            <div className={styles.icon5}>
                                <RiseOutlined/>
                            </div>
                            <div className={styles.statTitle}>Win Ratio</div>
                        </div>
                        <div className={styles.statValue}>
                            {stats.winRatePercentage}%
                        </div>
                    </div>

                    {/* Statbox 4 Record */}
                    <div className={styles.statBox}>
                        <div className={styles.statTop}>
                            <div className={styles.icon2}>
                                <TrophyOutlined/>
                            </div>
                            <div className={styles.statTitle}>Record</div>
                        </div>
                        <div className={styles.statValue}>
                            {stats.winCount}W - {losses}L
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
