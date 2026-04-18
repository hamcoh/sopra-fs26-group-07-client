"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import { PlusOutlined, TeamOutlined, TrophyOutlined, SearchOutlined } from "@ant-design/icons";
import styles from "@/styles/menu.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import ProfileButton from "@/components/ProfileButton";
import { message } from "antd";

export default function MenuPage() {
  const router = useRouter();
  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
  const { value: username, loading: usernameLoading } = useLocalStorage("username", "Player");
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (tokenLoading || usernameLoading) return;

    if (!token) {
      messageApi.error("You must be logged in to look at the menu.", 4);
      setIsLoading(false);
      setTimeout(() => router.push("/"), 4000);
      return;
    }

    setIsLoading(false);
    setIsAuthorized(true);
  }, [token, tokenLoading, usernameLoading, router, messageApi]);

  const isActuallyLoading = tokenLoading || usernameLoading || isLoading;

  if (isActuallyLoading) {
    return <div className={styles.pageBackground}>{contextHolder}</div>;
  }

  if (!isAuthorized) {
    return <div className={styles.pageBackground}>{contextHolder}</div>;
  }

  return (
    <>
      {contextHolder}
      <div className={styles.pageBackground}>
        <ProfileButton />

        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Codosseum</h1>
            <p className={styles.logoSubtitle}>Choose your battle</p>
          </div>
        </div>

        <p className={styles.greeting}>
          Hello, <span className={styles.username}>{username}</span>!
        </p>

        <div className={styles.cards}>

          <div className={styles.card} onClick={() => router.push("/create-room")}>
            <div className={`${styles.iconBox} ${styles.iconBlue}`}>
              <PlusOutlined style={{ fontSize: 28, color: "white" }} />
            </div>
            <h2 className={styles.cardTitle}>Create Room</h2>
            <p className={styles.cardDesc}>
              Start a new coding battle and invite others to join your arena
            </p>
          </div>

          <div className={styles.card} onClick={() => router.push("/join-room")}>
            <div className={`${styles.iconBox} ${styles.iconPink}`}>
              <TeamOutlined style={{ fontSize: 28, color: "white" }} />
            </div>
            <h2 className={styles.cardTitle}>Join Room</h2>
            <p className={styles.cardDesc}>
              Enter a room code and join an existing battle arena
            </p>
          </div>

          <div className={styles.card} onClick={() => router.push("/rooms")}>
            <div className={`${styles.iconBox} ${styles.iconGreen}`}>
              <SearchOutlined style={{ fontSize: 28, color: "white" }} />
            </div>
            <h2 className={styles.cardTitle}>Browse Rooms</h2>
            <p className={styles.cardDesc}>
              Browse all open rooms and jump into an existing battle
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
    </>
  );
}
