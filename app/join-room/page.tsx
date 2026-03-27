"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/joinRoom.module.css";
import ProfileButton from "@/components/ProfileButton";
import { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function JoinRoomPage() {
  const router = useRouter();
  const { value: token } = useLocalStorage("token", "");


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
      <div className={styles.content}>
        <ProfileButton />

        <button className={styles.backButton} onClick={() => router.push("/menu")}>
          <ArrowLeftOutlined /> Back
        </button>

        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Join Room</h1>
            <p className={styles.logoSubtitle}>Enter the battle code</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Enter Session Code</h2>
          <p className={styles.cardDescription}>
            Ask your opponent for their session code to join their room
          </p>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Room Code</label>
            <input
              className={styles.codeInput}
              type="text"
              placeholder="ABC123"
              maxLength={6}
            />
            <p className={styles.inputHint}>Session codes are 6 characters long</p>
          </div>

          <button className={styles.joinButton}>
            Join Lobby <ArrowRightOutlined />
          </button>
        </div>

      </div>
    </div>
  );
}
