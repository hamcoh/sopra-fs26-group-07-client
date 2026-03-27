"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import CodosseumLogo from "@/components/CodosseumLogo";
import { PlusOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";
import styles from "@/styles/menu.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import ProfileButton from "@/components/ProfileButton";

export default function MenuPage() {
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: username } = useLocalStorage<string>("username", "Player");

  useEffect(() => {
    if (token === "" ) return;
    if (!token) {
      router.push("/");
      alert("You must be logged in to access the menu.");
      return;
    }


  }, [router]);

  return (
    <div className={styles.pageBackground}>
        <ProfileButton />

      {/* Logo */}
      <div className={styles.logoArea}>
        <CodosseumLogo size={100} />
        <div className={styles.logoTexts}>
          <h1 className={styles.logoTitle}>Codosseum</h1>
          <p className={styles.logoSubtitle}>Choose your battle</p>
        </div>
      </div>

      {/* Greeting */}
      <p className={styles.greeting}>
        Hello, <span className={styles.username}>{username}</span>!
      </p>

      {/* Cards */}
      <div className={styles.cards}>

        <div className={styles.card} onClick={() => router.push("/create-session")}>
          <div className={`${styles.iconBox} ${styles.iconBlue}`}>
            <PlusOutlined style={{ fontSize: 28, color: "white" }} />
          </div>
          <h2 className={styles.cardTitle}>Create Session</h2>
          <p className={styles.cardDesc}>
            Start a new coding battle and invite others to join your arena
          </p>
        </div>

        <div className={styles.card} onClick={() => router.push("/join-session")}>
          <div className={`${styles.iconBox} ${styles.iconPink}`}>
            <TeamOutlined style={{ fontSize: 28, color: "white" }} />
          </div>
          <h2 className={styles.cardTitle}>Join Session</h2>
          <p className={styles.cardDesc}>
            Enter a session code and join an existing battle arena
          </p>
        </div>

        <div className={styles.card} onClick={() => router.push("/leaderboard")}>
          <div className={`${styles.iconBox} ${styles.iconOrange}`}>
            <TrophyOutlined style={{ fontSize: 28, color: "white" }} />
          </div>
          <h2 className={styles.cardTitle}>Leaderboard</h2>
          <p className={styles.cardDesc}>
            View top players and see where you rank in the arena
          </p>
        </div>

      </div>
    </div>
  );
}
