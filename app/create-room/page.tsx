"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  ThunderboltFilled,
  CodeFilled,
  TrophyFilled,
} from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/createRoom.module.css";
import ProfileButton from "@/components/ProfileButton";
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState } from "react";
import {getApiDomain} from "@/utils/domain";
import {message} from "antd";

const PythonIcon = () => (
  <svg width="45" height="45" viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="pyBlue" x1="12%" y1="12%" x2="79%" y2="78%">
        <stop offset="0" stopColor="#387EB8" />
        <stop offset="1" stopColor="#366994" />
      </linearGradient>
      <linearGradient id="pyYellow" x1="19%" y1="20%" x2="90%" y2="88%">
        <stop offset="0" stopColor="#FFE052" />
        <stop offset="1" stopColor="#FFC331" />
      </linearGradient>
    </defs>
    <path fill="url(#pyBlue)" d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z"/>
    <path fill="url(#pyYellow)" d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z"/>
  </svg>
);

export default function CreateRoomPage() {
  const router = useRouter();
  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
  const [language, setLanguage] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [mode, setMode] = useState("");
  const { value: userId, loading: userIdLoading } = useLocalStorage<string>("userid", "");
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (tokenLoading || userIdLoading) return;

    if (!token) {
      messageApi.error("You must be logged in to create a room.",4);
      setIsLoading(false);
      setTimeout(() => router.push("/"), 4000);
      return;
    }

    setIsLoading(false);
    setIsAuthorized(true);

  }, [token, tokenLoading, userIdLoading, router, messageApi]);

  const handleCreateRoom = async () => {
    try {
      if (!language || !difficulty || !mode) {
        messageApi.error("Please select all options.",4);
        return;
      }

      const res = await fetch(`${getApiDomain()}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "userId": String(userId),
        },
        body: JSON.stringify({
          gameDifficulty: difficulty,
          gameLanguage: language,
          gameMode: mode,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      if (!res.ok) {
        throw new Error(data.message|| "Failed to create a room");
      }

      router.push(`/room/${data.roomId}`);
    } catch (err) {
      if (err instanceof Error) {
        messageApi.error(err.message);
      } else {
        messageApi.error("An unknown error occurred");
      }
    }
  };

  // Loading-Page
  const isActuallyLoading = tokenLoading || userIdLoading || isLoading;

  if (isActuallyLoading) {
    return (
        <div className={styles.pageBackground}>
          {contextHolder}
        </div>
    );
  }

  // Not-Authorized-Page
  if (!isAuthorized) {
    return (
        <div className={styles.pageBackground}>
          {contextHolder}
        </div>
    );
  }

  return (
  <>
    {contextHolder}
    <div className={styles.pageBackground}>
      <div className={styles.content}>
        <ProfileButton />
        <div className={styles.topRow}>
          <button className={styles.backButton} onClick={() => router.push("/menu")}>
            <ArrowLeftOutlined /> Back
          </button>
          <div className={styles.logoArea}>
            <CodosseumLogo size={100} />
            <div className={styles.logoTexts}>
              <h1 className={styles.logoTitle}>Create Room</h1>
              <p className={styles.logoSubtitle}>Configure your battle arena</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>

          {/* Programming Language */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <CodeFilled className={styles.iconBlue} />
              Programming Language
            </h3>
            <div className={styles.optionsRow}>
              <div
                className={`${styles.optionCard} ${styles.blueHover} ${
                  language === "PYTHON" ? styles.selectedBlue : ""
                }`}
                onClick={() => setLanguage("PYTHON")}
              >
                <PythonIcon />
                <div>
                  <p className={styles.optionName}>Python</p>
                  <p className={styles.optionDesc}>Problems will have to be solved in Python</p>
                </div>
              </div>
            </div>
          </section>

          <hr className={styles.divider} />

          {/* Difficulty */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <TrophyFilled className={styles.iconPurple} />
              Difficulty
            </h3>
            <div className={styles.optionsRow}>
              <div
                className={`${styles.optionCard} ${styles.violetHover} ${
                  difficulty === "EASY" ? styles.selectedPurple : ""
                }`}
                onClick={() => setDifficulty("EASY")}
              >
                <span className={styles.dotGreen} />
                <div>
                  <p className={styles.optionName}>Easy</p>
                  <p className={styles.optionDesc}>Difficulty level of the Info1 course</p>
                </div>
              </div>
            </div>
          </section>

          <hr className={styles.divider} />

          {/* Game Mode */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <ThunderboltFilled className={styles.iconOrange} />
              Game Mode
            </h3>
            <div className={styles.optionsRow}>
              <div
                className={`${styles.optionCard} ${styles.orangeHover} ${
                  mode === "RACE" ? styles.selectedOrange : ""
                }`}
                onClick={() => setMode("RACE")}
              >
                <TrophyOutlined className={styles.gameModeIcon} />
                <div>
                  <p className={styles.optionName}>Race</p>
                  <p className={styles.optionDesc}>First to solve the problem wins the round</p>
                </div>
              </div>
            </div>
          </section>

          <hr className={styles.divider} />

          <button className={styles.createButton} onClick={handleCreateRoom}>
            Create Room
          </button>

        </div>
      </div>
    </div>
    </>
  );
}
