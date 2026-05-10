"use client";

import styles from "@/styles/game.module.css";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Problem } from "../_types";

interface ProblemPanelProps {
  problem: Problem | null;
  language: string;
  timeLeft: number | null;
}

const difficultyColor: Record<string, string> = {
  EASY: "#16a34a",
  HARD: "#dc2626",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProblemPanel({ problem, language, timeLeft }: ProblemPanelProps) {
  const timerColor =
      timeLeft !== null && timeLeft <= 60 ? "#dc2626"
          : timeLeft !== null && timeLeft <= 300 ? "#d97706"
              : undefined;

  return (
    <div className={styles.card}>
      {problem ? (
        <>
          <section className={styles.section}>
            <div className={styles.problemHeader}>
              <h3 className={styles.problemTitle}>{problem.title}</h3>
              <div className={styles.badgeRow}>
                {problem.difficulty && (
                    <span className={styles.languageIndicator} style={{ color: difficultyColor[problem.difficulty] ?? "#6b7280", borderColor: difficultyColor[problem.difficulty] ?? "#6b7280" }}>
                    {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                    </span>
                    )}
                <span className={styles.languageIndicator}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </span>
                <span
                    className={styles.timerBadge}
                    style={timerColor ? { color: timerColor, borderColor: timerColor } : undefined}
                >
                  <ClockCircleOutlined />
                  {timeLeft !== null ? formatTime(timeLeft) : "15:00"}
                </span>
              </div>
            </div>
          </section>

          <hr className={styles.divider} />

          <div className={styles.scrollableContent}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.problemDescription}>{problem.description}</p>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Input Format</h3>
              <div className={styles.exampleCard}>
                <p className={styles.exampleText}>{problem.inputFormat}</p>
              </div>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Output Format</h3>
              <div className={styles.exampleCard}>
                <p className={styles.exampleText}>{problem.outputFormat}</p>
              </div>
            </section>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Constraints</h3>
              <div className={styles.exampleCard}>
                <p className={styles.exampleText}>{problem.constraints}</p>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <p style={{ color: "#6b7280" }}>Loading problem...</p>
        </div>
      )}
    </div>
  );
}