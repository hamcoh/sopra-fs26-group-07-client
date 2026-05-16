"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  ThunderboltFilled,
  ThunderboltOutlined,
  CodeFilled,
  TrophyFilled,
  OrderedListOutlined,
} from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/createRoom.module.css";
import ProfileButton from "@/components/ProfileButton";
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
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

const SQLiteIcon = () => (
  <svg width="45" height="45" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    {/* cylinder body */}
    <rect x="5" y="22" width="90" height="75" rx="4" fill="#1a86d8"/>
    {/* cylinder bottom ellipse */}
    <ellipse cx="50" cy="97" rx="45" ry="12" fill="#1572b8"/>
    {/* cylinder top ellipse */}
    <ellipse cx="50" cy="22" rx="45" ry="12" fill="#4bb3f0"/>
    {/* SQL text */}
    <text x="50" y="72" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial, sans-serif">SQL</text>
  </svg>
);
const JavaIcon = () => (
    <svg
        width="60" height="60" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"></path><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"></path><path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"></path><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"></path><path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"></path>
    </svg>
);

export default function CreateRoomPage() {
  const router = useRouter();
  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");

  const [language, setLanguage] = useState("PYTHON");
  const [difficulty, setDifficulty] = useState("EASY");
  const [mode, setMode] = useState("SPRINT_ARCADE");
  const [numProblems, setNumProblems] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


  useEffect(() => {
    if (tokenLoading) return;

    if (!token) {
      messageApi.error("You must be logged in to create a room.", 4);
      setIsLoading(false);
      setTimeout(() => router.push("/"), 4000);
      return;
    }

    setIsLoading(false);
    setIsAuthorized(true);
  }, [token, tokenLoading, router, messageApi]);

  const handleCreateRoom = async () => {
    try {
      let userId = "";
      try {
        const raw = localStorage.getItem("userid");
        userId = raw ? JSON.parse(raw) : "";
      } catch {
        userId = localStorage.getItem("userid") ?? "";
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
          numOfProblems: numProblems,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      router.push(`/rooms/${data.roomId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    }
  };

  const isActuallyLoading = tokenLoading || isLoading;

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
              <div
                className={`${styles.optionCard} ${styles.blueHover} ${
                  language === "JAVA" ? styles.selectedBlue : ""
                }`}
                onClick={() => setLanguage("JAVA")}
              >
                <JavaIcon />
                <div>
                  <p className={styles.optionName}>Java</p>
                  <p className={styles.optionDesc}>Problems will have to be solved in Java</p>
                </div>
              </div>
              <div
                className={`${styles.optionCard} ${styles.blueHover} ${
                  language === "SQLITE" ? styles.selectedBlue : ""
                }`}
                onClick={() => setLanguage("SQLITE")}
              >
                <SQLiteIcon />
                <div>
                  <p className={styles.optionName}>SQLite</p>
                  <p className={styles.optionDesc}>Write SQL SELECT queries against provided tables</p>
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
              <div
                  className={`${styles.optionCard} ${styles.violetHover} ${
                      difficulty === "HARD" ? styles.selectedPurple : ""
                  }`}
                  onClick={() => setDifficulty("HARD")}
              >
                <span className={styles.dotRed} />
                <div>
                  <p className={styles.optionName}>Hard</p>
                  <p className={styles.optionDesc}>Harder difficulty</p>
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
                className={`${styles.optionCard} ${styles.orangeHover} ${mode === "SPRINT_ARCADE" ? styles.selectedOrange : ""
                  }`}
                onClick={() => setMode("SPRINT_ARCADE")}
              >
                <TrophyOutlined className={styles.gameModeIcon} />
                <div>
                  <p className={styles.optionName}>Sprint Arcade</p>
                  <p className={styles.optionDesc}>Race with coins, items, and sabotage</p>
                </div>
              </div>
              <div
                className={`${styles.optionCard} ${styles.orangeHover} ${mode === "SPRINT_CLASSIC" ? styles.selectedOrange : ""
                  }`}
                onClick={() => setMode("SPRINT_CLASSIC")}
              >
                <ThunderboltOutlined className={styles.gameModeIcon} />
                <div>
                  <p className={styles.optionName}>Sprint Classic</p>
                  <p className={styles.optionDesc}>Pure 1v1 coding race. No items, no distractions</p>
                </div>
              </div>
            </div>
          </section>

          <hr className={styles.divider} />

          {/* Number of Problems */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <OrderedListOutlined className={styles.iconBlue} />
              Number of Problems
            </h3>
            <div className={styles.sliderWrapper}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Problems per game</span>
                <span className={styles.sliderValue}>{numProblems}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={numProblems}
                onChange={(e) => setNumProblems(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderTicks}>
                <span>1</span>
                <span>5</span>
                <span>10</span>
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