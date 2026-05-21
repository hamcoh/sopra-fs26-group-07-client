"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import useLocalStorage from "@/hooks/useLocalStorage";
import styles from "@/styles/game.module.css";
import resultStyles from "@/styles/results.module.css";
import { GameEndDTO, PlayerGameSummaryDTO } from "../_types";

const SPARKLE_POSITIONS = [
  { left: "4%",  top: "18%", size: 7,  delay: "0.0s" },
  { left: "11%", top: "62%", size: 5,  delay: "0.5s" },
  { left: "19%", top: "28%", size: 8,  delay: "0.9s" },
  { left: "28%", top: "72%", size: 4,  delay: "0.3s" },
  { left: "37%", top: "14%", size: 6,  delay: "1.2s" },
  { left: "47%", top: "52%", size: 5,  delay: "0.7s" },
  { left: "56%", top: "22%", size: 9,  delay: "1.5s" },
  { left: "64%", top: "78%", size: 4,  delay: "0.2s" },
  { left: "72%", top: "38%", size: 6,  delay: "1.0s" },
  { left: "80%", top: "66%", size: 7,  delay: "0.4s" },
  { left: "89%", top: "24%", size: 5,  delay: "1.3s" },
  { left: "95%", top: "58%", size: 4,  delay: "0.8s" },
];

interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winRate: number;
}

interface GameOverScreenProps {
  storedUsername: string;
  myScore: number;
  opponent: { username: string; score: number } | null;
  gameEndData: GameEndDTO | null;
  gameSummary: PlayerGameSummaryDTO | null;
  gameSessionId: string | string[];
  storedAvatarId: number;
  opponentAvatarId: number;
}

export default function GameOverScreen({
  storedUsername,
  myScore,
  opponent,
  gameEndData,
  gameSummary,
  gameSessionId,
  storedAvatarId,
  opponentAvatarId,
}: GameOverScreenProps) {
  const router = useRouter();
  const { value: userId } = useLocalStorage("userid", "");
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());

  const myUserIdNum = userId ? Number(userId) : null;

  const myPlayerScore = gameEndData?.playerScores?.find(p => p.userId === myUserIdNum);
  const opponentPlayerScore = gameEndData?.playerScores?.find(p => p.userId !== myUserIdNum);

  const myStats: UserStats | null = myPlayerScore ? {
    wins: myPlayerScore.winCount,
    draws: myPlayerScore.drawCount,
    gamesPlayed: myPlayerScore.totalGamesPlayed,
    losses: myPlayerScore.totalGamesPlayed - myPlayerScore.winCount - myPlayerScore.drawCount,
    winRate: Math.round(myPlayerScore.winRatePercentage),
  } : null;

  const opponentStats: UserStats | null = opponentPlayerScore ? {
    wins: opponentPlayerScore.winCount,
    draws: opponentPlayerScore.drawCount,
    gamesPlayed: opponentPlayerScore.totalGamesPlayed,
    losses: opponentPlayerScore.totalGamesPlayed - opponentPlayerScore.winCount - opponentPlayerScore.drawCount,
    winRate: Math.round(opponentPlayerScore.winRatePercentage),
  } : null;

  const toggleSolution = (id: string) => {
    setExpandedSolutions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const solvedCorrectly  = gameSummary?.problemResults?.solvedCorrectly ?? [];
  const solvedPartially  = gameSummary?.problemResults?.solvedPartiallyCorrectly ?? [];
  const solvedWrong      = gameSummary?.problemResults?.solvedWrong ?? [];

  const isWin  = myScore > (opponent?.score ?? 0);
  const isDraw = myScore === (opponent?.score ?? 0);

  const caesarSrc = isWin ? "/caesar_win.png" : isDraw ? "/caesar_draw.png" : "/caesar_lose.png";

  const heroGradient = isWin
    ? "linear-gradient(135deg, #d97706 0%, #b45309 55%, #78350f 100%)"
    : isDraw
    ? "linear-gradient(135deg, #4361ee 0%, #6366f1 55%, #4338ca 100%)"
    : "linear-gradient(135deg, #dc2626 0%, #b91c1c 55%, #7f1d1d 100%)";

  const myAvatarColor  = isWin ? "#d97706" : isDraw ? "#6366f1" : "#dc2626";
  const oppAvatarColor = !isWin && !isDraw ? "#d97706" : isDraw ? "#6366f1" : "#dc2626";
  const myScoreColor   = isWin ? "#d97706" : isDraw ? "#6366f1" : "#dc2626";
  const oppScoreColor  = !isWin && !isDraw ? "#d97706" : isDraw ? "#6366f1" : "#dc2626";

  const renderStats = (stats: UserStats | null) => (
    <div className={resultStyles.statsGrid}>
      {[
        { label: "Win Rate", value: stats ? `${stats.winRate}%` : "—" },
        { label: "Wins",     value: stats != null ? stats.wins     : "—" },
        { label: "Losses",   value: stats != null ? stats.losses   : "—" },
        { label: "Draw",   value: stats != null ? stats.draws   : "—" },
        { label: "Games",    value: stats != null ? stats.gamesPlayed : "—" },
      ].map(({ label, value }) => (
        <div key={label} className={resultStyles.statItem}>
          <div className={resultStyles.statValue}>{String(value)}</div>
          <div className={resultStyles.statLabel}>{label}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${resultStyles.pageBackground} ${isWin ? resultStyles.winBg : isDraw ? resultStyles.drawBg : resultStyles.loseBg}`}>

      {/* HEADER */}
      <div className={styles.topRow}>
        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Codosseum</h1>
            <p className={styles.logoSubtitle}>Game Results</p>
          </div>
        </div>
        <div className={resultStyles.headerButtons}>
          <button className={resultStyles.secondaryButton} onClick={() => {
              localStorage.removeItem(`gameResult_${gameSessionId}`);
              router.push("/menu");
          }}>
            Back to Menu
          </button>
          <button className={resultStyles.primaryButton} onClick={() => {
            localStorage.removeItem(`gameResult_${gameSessionId}`);
            router.push("/leaderboard");
            }}>
            View Leaderboard
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className={resultStyles.resultsContent}>

        {/* HERO BANNER */}
        <div className={resultStyles.heroWrapper}>
          <div className={resultStyles.heroBanner} style={{ background: heroGradient }}>
            <div className={resultStyles.heroCircle1} />
            <div className={resultStyles.heroCircle2} />

            {isWin && SPARKLE_POSITIONS.map((s, i) => (
              <div
                key={i}
                className={resultStyles.sparkle}
                style={{ left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, animationDelay: s.delay }}
              />
            ))}

            <div className={resultStyles.heroBannerLeft}>
              <div className={resultStyles.outcomePill}>
                {isWin ? "🏆 Victory" : isDraw ? "🤝 Draw" : "💀 Defeat"}
              </div>
              <h1 className={resultStyles.outcomeText}>
                {isWin ? "VICTORY!" : isDraw ? "DRAW!" : "DEFEAT!"}
              </h1>
              <p className={resultStyles.outcomeSubtext}>
                {isWin
                  ? `${storedUsername} conquers the arena!`
                  : isDraw
                  ? "Two gladiators, equal might!"
                  : `${opponent?.username ?? "Opponent"} claims the glory!`}
              </p>
              <span className={resultStyles.sessionBadge}>Session #{gameSessionId}</span>
            </div>
          </div>

          <img
            src={caesarSrc}
            alt={isWin ? "Caesar victorious" : isDraw ? "Caesar neutral" : "Caesar defeated"}
            className={resultStyles.caesarHero}
          />
        </div>

        {/* PLAYER DUEL ROW */}
        <div className={resultStyles.duelRow}>

          {/* My card */}
          <div className={`${resultStyles.duelCard} ${isWin ? resultStyles.cardWin : isDraw ? resultStyles.cardDraw : resultStyles.cardLose}`}>
            {isWin && <span className={resultStyles.crownEmoji}>👑</span>}
            <div className={resultStyles.avatarWrapper}>
              <CodosseumAvatar id={storedAvatarId} size={80} backgroundColor={myAvatarColor} />
            </div>
            <div className={resultStyles.nameRow}>
              <div className={resultStyles.playerName}>{storedUsername}</div>
              <div className={resultStyles.youBadge}>YOU</div>
            </div>
            <div className={resultStyles.playerScore} style={{ color: myScoreColor }}>{myScore}</div>
            <div className={resultStyles.playerPts}>pts this game</div>
            {renderStats(myStats)}
          </div>

          {/* VS separator */}
          <div className={resultStyles.vsColumn}>
            <div className={resultStyles.vsDividerLine} />
            <span className={resultStyles.vsText}>VS</span>
            <div className={resultStyles.vsDividerLine} />
          </div>

          {/* Opponent card */}
          <div className={`${resultStyles.duelCard} ${!isWin && !isDraw ? resultStyles.cardWin : isDraw ? resultStyles.cardDraw : resultStyles.cardLose}`}>
            {!isWin && !isDraw && <span className={resultStyles.crownEmoji}>👑</span>}
            <div className={resultStyles.avatarWrapper}>
              <CodosseumAvatar id={opponentAvatarId} size={80} backgroundColor={oppAvatarColor} />
            </div>
            <div className={resultStyles.playerName}>{opponent?.username ?? "Opponent"}</div>
            <div className={resultStyles.playerScore} style={{ color: oppScoreColor }}>{opponent?.score ?? 0}</div>
            <div className={resultStyles.playerPts}>pts this game</div>
            {renderStats(opponentStats)}
          </div>

        </div>

        {/* SAMPLE SOLUTIONS */}
        {gameEndData?.gameSessionSampleSolutions &&
          gameEndData.gameSessionSampleSolutions.length > 0 && (
          <div className={resultStyles.problemsSection}>
            <h2 className={resultStyles.solutionsTitle}>📋 Sample Solutions</h2>
            {gameEndData.gameSessionSampleSolutions.map((solution, index) => {
              const pid        = solution.problemId;
              const problemKey = String(pid);

              const isExpanded   = expandedSolutions.has(problemKey);
              const isCorrect    = solvedCorrectly.includes(pid);
              const isPartial    = !isCorrect && solvedPartially.includes(pid);
              const isIncorrect  = !isCorrect && !isPartial && solvedWrong.includes(pid);
              // isNotSolved = never submitted — not in any backend array

              const borderColor  = isCorrect ? "#16a34a" : isPartial ? "#d97706" : isIncorrect ? "#dc2626" : "#d1d5db";
              const bgColor      = isCorrect ? "#f0fdf4" : isPartial ? "#fffbeb" : isIncorrect ? "#fef2f2" : "#f9fafb";
              const badge        = isCorrect
                ? <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "2px 10px", borderRadius: 6 }}>✓ Correct</span>
                : isPartial
                ? <span style={{ fontSize: 13, fontWeight: 600, color: "#d97706", background: "#fef9c3", padding: "2px 10px", borderRadius: 6 }}>◑ Partial</span>
                : isIncorrect
                ? <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", background: "#fee2e2", padding: "2px 10px", borderRadius: 6 }}>✗ Incorrect</span>
                : <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 10px", borderRadius: 6 }}>— Not solved</span>;

              return (
                <div
                  key={problemKey}
                  className={resultStyles.problemItem}
                  style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px", cursor: "default", border: `2px solid ${borderColor}`, background: bgColor }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className={resultStyles.problemIndex}>{index + 1}</div>
                      <strong style={{ fontSize: "15px", color: "#1a1a2e" }}>{solution.problemTitle}</strong>
                      {badge}
                    </div>
                    <button className={resultStyles.solutionToggleBtn} onClick={() => toggleSolution(problemKey)}>
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