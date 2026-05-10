"use client";

import {useEffect, useRef, useState} from "react";
import { useParams } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/game.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useGameWebSocket } from "./_hooks/useGameWebSocket";
import { useGameTimer } from "./_hooks/useGameTimer";
import { useScoreAnimation } from "./_hooks/useScoreAnimation";
import GameOverScreen from "./_components/GameOverScreen";
import ScoreBox from "./_components/ScoreBox";
import ProblemPanel from "./_components/ProblemPanel";
import CodeEditorPanel from "./_components/CodeEditorPanel";
import ItemShop from "./_components/ItemShop";
import { ExecutionResult, GameRoundData, Problem } from "./_types";

const GAME_DURATION_MS = 15 * 60 * 1000;

const pythonStarter = `def solve(x):
    # Write your solution here
    return None`;

const javaStarter = `public class Main {
    public static void main(String[] args) {
    }
}`;

const EFFECT_DISPLAY: Record<string, { label: string; emoji: string }> = {
  SQUID_INK_SABOTAGE: { label: "Squid Ink", emoji: "🦑" },
  JITTER_SABOTAGE:    { label: "Earthquake", emoji: "⚡" },
  ROTATE_SABOTAGE:    { label: "Flip Screen", emoji: "🌀" },
};

export default function GamePage() {
  const { value: userId } = useLocalStorage("userid", "");
  const { value: token } = useLocalStorage("token", "");
  const { value: storedUsername } = useLocalStorage("username", "Player One");
  const { value: storedAvatarId } = useLocalStorage("avatarId", "1");
  const params = useParams();
  const gameSessionId = params.gameSessionId as string;

  const [language, setLanguage] = useState("python");
  const [playerSessionId, setPlayerSessionId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Record<string, { username: string; score: number }>>({});
  const [playerAvatarId, setPlayerAvatarId] = useState<number>(1);
  const [opponentAvatarId, setOpponentAvatarId] = useState<number>(2);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentRound, setCurrentRound] = useState(1);

  //For The Skip Button, can be removed if not needed!
  const [skipState, setSkipState] = useState({
    used: 0,
    max: null as number | null,
  });
  const [isSkipping, setIsSkipping] = useState(false);

  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [showSubmitToast, setShowSubmitToast] = useState(false);
  const [code, setCode] = useState(pythonStarter);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [submitResult, setSubmitResult] = useState<ExecutionResult | null>(null);
  const [coinBalance, setCoinBalance] = useState<number>(0);

  const me = players[String(userId)];
  const allPlayers = Object.entries(players);
  const opponentEntry = userId ? allPlayers.find(([id]) => id !== String(userId)) : null;
  const opponent = opponentEntry ? opponentEntry[1] : null;
  const myScore = me?.score ?? 0;
  const lastScoreRef = useRef<number>(0);

  const { isGameOver, gameEndData, gameSummary, activeEffects, sabotageNotification } = useGameWebSocket(
    gameSessionId, token, userId, playerSessionId, setPlayers,
  );
  const timeLeft = useGameTimer(gameEndTime);
  const myAnimation = useScoreAnimation(myScore);
  const opponentAnimation = useScoreAnimation(opponent?.score ?? 0);

  const fetchCoinBalance = async () => {
    if (!userId || !token) return;
    try {
      const res = await fetch(`${getApiDomain()}/users/${userId}`, { headers: { token } });
      const data = await res.json();
      if (data.coins !== undefined) setCoinBalance(data.coins);
    } catch (err) {
      console.error("Failed to fetch coin balance:", err);
    }
  };

  useEffect(() => {
    fetchCoinBalance();
  }, [userId, token]);

  // Load problem data from localStorage (saved by lobby page on game-start WS)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("gameRoundData");
    if (!stored) return;
    try {
      const data: GameRoundData = JSON.parse(stored);
      setPlayerSessionId(data.playerSessionId);
      const initialPlayers: Record<string, { username: string; score: number }> = {
        [String(data.playerId)]: { username: storedUsername, score: data.currentScore ?? 0 },
      };
      if (data.opponentName) initialPlayers["opponent"] = { username: data.opponentName, score: 0 };
      setPlayers(initialPlayers);

      setSkipState({
        used: data.numOfSkippedProblems ?? 0,
        max: data.maxSkips ?? null,
      });
      const lang = (data.gameLanguage ?? "python").toLowerCase();
      setLanguage(lang);
      setCode(lang === "java" ? javaStarter : pythonStarter);
      setProblem({
        id: data.problemId,
        title: data.title ?? "Unknown Problem",
        description: data.description ?? "",
        inputFormat: data.inputFormat ?? "",
        outputFormat: data.outputFormat ?? "",
        constraints: data.constraints ?? "",
      });
      setPlayerAvatarId(data.playerAvatarId ?? 1);
      setOpponentAvatarId(data.opponentAvatarId ?? 2);
      setGameEndTime(data.endsAt ? new Date(data.endsAt).getTime() : Date.now() + GAME_DURATION_MS);
    } catch (e) {
      console.error("Failed to parse game data from localStorage", e);
    }
  }, [gameSessionId, storedUsername]);

  // RUN BUTTON LOGIC
  const handleRun = async () => {
    if (!token || isRunning || !problem || playerSessionId == null) return;
    setIsRunning(true);
    setRunResult({ message: "Running code against sample cases...", status: "info" });
    try {
      const response = await fetch(`${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ playerSessionId, sourceCode: code }),
      });
      const result = await response.json();
      if (!response.ok) {
        setRunResult({
          message: response.status === 429
            ? "Too many requests. Please wait a moment before trying again."
            : `Error: ${result.message ?? "Run failed"}`,
          status: "error",
        });
        return;
      }
      setRunResult({
        status: result.passedTestCases === result.totalTestCases ? "success" : "error",
        testCases: result.testCases,
        summary: `${result.passedTestCases}/${result.totalTestCases} tests passed`,
      });
    } catch (error) {
      console.error("Run error:", error);
      setRunResult({ message: "Connection error during execution.", status: "error" });
    } finally {
      setIsRunning(false);
    }
  };

  // ONLY FOR THE SKIP BUTTON, CAN BE REMOVED IF NOT NEEDED
  const handleSkip = async () => {
    if (!token || !gameSessionId || !problem || !playerSessionId || isSkipping) return;

    setIsSkipping(true);

    try {
      const res = await fetch(
          `${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/skips`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token: token,
            },
            body: JSON.stringify({ playerSessionId }),
          }
      );

      if (res.status === 204) return;

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Skip failed");
      }

      const nextRound = await res.json();

      setSkipState((prev) => ({
        ...prev,
        used: nextRound.numOfSkippedProblems,
      }));

      setProblem({
        id: nextRound.problemId,
        title: nextRound.title,
        description: nextRound.description,
        inputFormat: nextRound.inputFormat,
        outputFormat: nextRound.outputFormat,
        constraints: nextRound.constraints,
      });

      setCurrentRound((prev) => prev + 1);

      setCode(language === "java" ? javaStarter : pythonStarter);

    } catch (err) {
      console.error("Skip error:", err);
    } finally {
      setIsSkipping(false);
    }
  };

  const refreshGameState = async () => {
    if (!problem || playerSessionId == null) return;
    try {
      const response = await fetch(
        `${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/submission-result?playerSessionId=${playerSessionId}`,
        { headers: { token } }
      );
      if (response.status === 200) {
        const updatedGameRound = await response.json();
        console.log("CURRENT:", problem?.id);
        console.log("FROM API:", updatedGameRound.problem?.id);
        setProblem({
          id: updatedGameRound.problemId,
          title: updatedGameRound.title,
          description: updatedGameRound.description,
          inputFormat: updatedGameRound.inputFormat,
          outputFormat: updatedGameRound.outputFormat,
          constraints: updatedGameRound.constraints,
        });
        setSubmitResult(null);
        setRunResult(null);
        setCurrentRound(prev => prev + 1);
        setPlayers(prev => {
          const newScore = updatedGameRound.currentScore;
          if (newScore > lastScoreRef.current) {
            const audio = new Audio("/sounds/PointsSoundEffect.mp3");
            audio.volume = 0.6;
            audio.play().catch(console.error);
          }
          lastScoreRef.current = newScore;
          return {
            ...prev,
            [String(userId)]: { ...prev[String(userId)], score: newScore },
          };
        });
        const lang = (updatedGameRound.gameLanguage ?? language).toLowerCase();
        setCode(lang === "java" ? javaStarter : pythonStarter);
        await fetchCoinBalance();
      } else if (response.status === 204) {
        console.log("Game over or no new content.");
      }
    } catch (error) {
      console.error("Failed to sync game state:", error);
    }
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!token || isSubmitting || !problem || playerSessionId == null) return;
    setIsSubmitting(true);
    setSubmitResult({ message: "Submitting your solution...", status: "info" });
    try {
      const response = await fetch(
        `${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({ playerSessionId, sourceCode: code }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setSubmitResult({ message: `Error: ${result.message ?? "Submission failed"}`, status: "error" });
        return;
      }
      setShowSubmitToast(true);
      setTimeout(() => setShowSubmitToast(false), 3000);
      await refreshGameState();
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitResult({ message: "Connection error during submission.", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // BUY ITEM
  const handleBuyItem = async (itemId: string, enumValue: string): Promise<boolean> => {
    if (!token || playerSessionId == null) return false;
    try {
      const response = await fetch(`${getApiDomain()}/games/${gameSessionId}/sabotage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ playerSessionId, item: enumValue }),
      });
      if (!response.ok) {
        if (response.status === 409) console.warn("Opponent is already sabotaged");
        if (response.status === 400) console.warn("Not enough coins");
        return false;
      }
      setCoinBalance(prev => prev - 5);
      return true;
    } catch (error) {
      console.error("Failed to purchase sabotage:", error);
      return false;
    }
  };

  // GAME OVER screen
  if (isGameOver) {
    return (
      <GameOverScreen
        storedUsername={storedUsername}
        myScore={myScore}
        opponent={opponent}
        gameEndData={gameEndData}
        gameSummary={gameSummary}
        gameSessionId={gameSessionId}
      />
    );
  }

  return (
    <div className={styles.pageBackground}>

      {/* SUBMIT TOAST */}
      {showSubmitToast && (
        <div style={{
          position: "fixed", top: "100px", right: "24px", zIndex: 9999,
          display: "flex", alignItems: "center", gap: "10px",
          background: "#fff", border: "1.5px solid #16a34a",
          borderRadius: "10px", padding: "12px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        }}>
          <CheckCircleOutlined style={{ color: "#16a34a", fontSize: "20px" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>Solution submitted!</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Moving to the next problem...</div>
          </div>
        </div>
      )}

      {/* SABOTAGE NOTIFICATION */}
      {sabotageNotification && (() => {
        const effect = EFFECT_DISPLAY[sabotageNotification];
        return (
          <div style={{
            position: "fixed", top: "100px", left: "24px", zIndex: 9999,
            display: "flex", alignItems: "center", gap: "10px",
            background: "#fff", border: "1.5px solid #7c3aed",
            borderRadius: "10px", padding: "12px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          }}>
            <span style={{ fontSize: "20px" }}>{effect?.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#7c3aed" }}>
                {opponent?.username ?? "Opponent"} used {effect?.label}!
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Effect active for 10 seconds</div>
            </div>
          </div>
        );
      })()}

      {/* HEADER */}
      <div className={styles.topRow}>
        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Codosseum</h1>
            <p className={styles.logoSubtitle}>1v1 Coding Battle</p>
          </div>
        </div>

        <div className={styles.statsWrapper}>
          <div className={styles.sessionArea}>
            <p className={styles.sessionLabel}>Session</p>
            <h2 className={styles.sessionValue}>{gameSessionId}</h2>
          </div>

          <div className={styles.verticalDivider} />

          <div className={styles.sessionArea}>
            <p className={styles.sessionLabel}>Round</p>
            <h2 className={`${styles.sessionValue} ${styles.blueValue}`}>{currentRound}</h2>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "flex-end", width: "100%", paddingRight: "30px" }}>
            <ScoreBox
              isMe={true}
              storedUsername={storedUsername}
              storedAvatarId={Number(storedAvatarId)}
              opponentAvatarId={opponentAvatarId}
              opponentUsername={opponent?.username ?? null}
              myScore={myScore}
              opponentScore={opponent?.score ?? 0}
              flash={myAnimation.flash}
              particles={myAnimation.particles}
            />
            <span style={{ fontWeight: "bold", color: "#94a3b8" }}>VS</span>
            <ScoreBox
              isMe={false}
              storedUsername={storedUsername}
              storedAvatarId={Number(storedAvatarId)}
              opponentAvatarId={opponentAvatarId}
              opponentUsername={opponent?.username ?? null}
              myScore={myScore}
              opponentScore={opponent?.score ?? 0}
              flash={opponentAnimation.flash}
              particles={opponentAnimation.particles}
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`${styles.content} ${activeEffects.has("jitter") ? styles.jitterActive : ""} ${activeEffects.has("rotate") ? styles.rotateActive : ""}`}
      >
        {activeEffects.has("ink") && <div className={styles.inkOverlay} />}

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, minWidth: 0 }}>
          <ProblemPanel problem={problem} language={language} timeLeft={timeLeft} />
          <ItemShop coinBalance={coinBalance} onBuyItem={handleBuyItem} />
        </div>

        <CodeEditorPanel
          code={code}
          setCode={setCode}
          language={language}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          onRun={handleRun}
          onSubmit={handleSubmit}
          runResult={runResult}
          submitResult={submitResult}
        />
      </div>
    </div>
  );
}