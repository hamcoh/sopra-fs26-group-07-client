"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/game.module.css";
import resultStyles from "@/styles/results.module.css";
import { TrophyOutlined } from "@ant-design/icons";
import { GameEndDTO, PlayerGameSummaryDTO } from "../_types";

interface GameOverScreenProps {
  storedUsername: string;
  myScore: number;
  opponent: { username: string; score: number } | null;
  gameEndData: GameEndDTO | null;
  gameSummary: PlayerGameSummaryDTO | null;
  gameSessionId: string | string[];
}

export default function GameOverScreen({
  storedUsername,
  myScore,
  opponent,
  gameEndData,
  gameSummary,
  gameSessionId,
}: GameOverScreenProps) {
  const router = useRouter();
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());

  const toggleSolution = (id: string) => {
    setExpandedSolutions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const solvedCorrectly = gameSummary?.problemResults?.solvedCorrectly ?? [];
  const notSolved = gameSummary?.problemResults?.notSolvedFullyCorrectly ?? [];

  return (
    <div className={resultStyles.pageBackground}>
      <div className={styles.topRow}>
        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Codosseum</h1>
            <p className={styles.logoSubtitle}>Game Results</p>
          </div>
        </div>
        <div className={resultStyles.headerButtons} style={{ display: "flex", gap: "12px", flexShrink: 0, whiteSpace: "nowrap" }}>
          <button className={resultStyles.secondaryButton} onClick={() => router.push("/menu")} style={{ minWidth: "fit-content" }}>
            Back to Menu
          </button>
          <button className={resultStyles.primaryButton} onClick={() => router.push("/leaderboard")} style={{ minWidth: "fit-content" }}>
            View Leaderboard
          </button>
        </div>
      </div>

      <div className={resultStyles.resultsContent}>
        <div className={resultStyles.victoryBanner}>
          <TrophyOutlined className={resultStyles.trophyIcon} style={{ fontSize: "48px", marginBottom: "10px" }} />
          <h1 className={resultStyles.victoryTitle}>
            {myScore > (opponent?.score ?? 0) ? "Victory!" : myScore === opponent?.score ? "It's a Tie!" : "Defeat!"}
          </h1>
          <p>
            {myScore > (opponent?.score ?? 0)
              ? `${storedUsername} wins the battle!`
              : myScore === opponent?.score
              ? "Great minds think alike!"
              : `${opponent?.username} takes the win!`}
          </p>
          <span className={resultStyles.sessionText}>Session {gameSessionId}</span>
        </div>

        <div className={resultStyles.playerScoreBox} style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <div className={`${resultStyles.playerCard} ${myScore >= (opponent?.score ?? 0) ? resultStyles.winnerCard : ""}`}>
            <div className={resultStyles.cardHeader}>
              <strong>{storedUsername} (You)</strong>
              {myScore >= (opponent?.score ?? 0) && <TrophyOutlined style={{ color: "#eab308", fontSize: "24px" }} />}
            </div>
            <div className={resultStyles.pointsText}>
              {myScore} <span className={resultStyles.pointsLabel}>points</span>
            </div>
          </div>
          <div className={`${resultStyles.playerCard} ${opponent && opponent.score >= myScore ? resultStyles.winnerCard : ""}`}>
            <div className={resultStyles.cardHeader}>
              <strong>{opponent ? opponent.username : "Opponent"}</strong>
              {opponent && opponent.score >= myScore && <TrophyOutlined style={{ color: "#eab308", fontSize: "24px" }} />}
            </div>
            <div className={resultStyles.pointsText}>
              {opponent ? opponent.score : 0} <span className={resultStyles.pointsLabel}>points</span>
            </div>
          </div>
        </div>

        {/* SAMPLE SOLUTIONS */}
        {gameEndData?.gameSessionSampleSolutions &&
          Object.keys(gameEndData.gameSessionSampleSolutions).length > 0 && (
          <div className={resultStyles.problemsSection}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 20px 0" }}>
              Sample Solutions
            </h2>
            {Object.entries(gameEndData.gameSessionSampleSolutions).map(([problemId, solution], index) => {
              const isExpanded = expandedSolutions.has(problemId);
              const pid = Number(problemId);
              const isSolved = solvedCorrectly.includes(pid);
              const isIncorrect = !isSolved && notSolved.includes(pid);
              const borderColor = isSolved ? "#16a34a" : isIncorrect ? "#dc2626" : "#d1d5db";
              const bgColor = isSolved ? "#f0fdf4" : isIncorrect ? "#fef2f2" : "#f9fafb";
              const badge = isSolved
                ? <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "2px 10px", borderRadius: 6 }}>✓ Correct</span>
                : isIncorrect
                ? <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", background: "#fee2e2", padding: "2px 10px", borderRadius: 6 }}>✗ Incorrect</span>
                : <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 10px", borderRadius: 6 }}>— Not solved</span>;

              return (
                <div
                  key={problemId}
                  className={resultStyles.problemItem}
                  style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px", cursor: "default", border: `2px solid ${borderColor}`, background: bgColor }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className={resultStyles.problemIndex}>{index + 1}</div>
                      <strong style={{ fontSize: "15px", color: "#1a1a2e" }}>{solution.problemTitle}</strong>
                      {badge}
                    </div>
                    <button className={resultStyles.solutionToggleBtn} onClick={() => toggleSolution(problemId)}>
                      {isExpanded ? "Hide Solution" : "Show Solution"}
                    </button>
                  </div>
                  {isExpanded && (
                    <pre className={resultStyles.solutionCode} style={{ width: "100%", margin: 0, overflowX: "auto", boxSizing: "border-box" }}>
                      {solution.problemSampleSolution}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}