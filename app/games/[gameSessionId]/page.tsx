"use client";

import { useRouter, useParams } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/game.module.css";
import resultStyles from "@/styles/results.module.css";
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import {
  SendOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Avatar } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import CodosseumAvatar from "@/components/CodosseumAvatar";

interface GameRoundData {
  gameSessionId: number;
  playerSessionId: number;
  playerId: number;
  currentScore: number;
  numOfSkippedProblems: number;
  problemId: number;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  gameLanguage: string;

  opponentName?: string;
  playerAvatarId?: number;
  opponentAvatarId?: number;

  endsAt?: string;
  serverTime?: string;
}

interface RunTestCase {
  testCaseId: number;
  expectedOutput: string;
  actualOutput: string;
  result: "PASS" | "FAIL";
  errorMessage: string | null;
}

interface ExecutionResult {
  message?: string;
  status: "success" | "error" | "info";
  testCases?: RunTestCase[];
  summary?: string;
}

interface GameSessionSampleSolutionsDTO {
  problemTitle: string;
  problemSampleSolution: string;
}

interface PlayerScoreDTO {
  playerSessionId: number;
  userId: number;
  username: string;
  score: number;
}

interface GameEndDTO {
  gameSessionId: number;
  gameStatus: string;
  gameEndReason: string;
  winnerPlayerId: number;
  playerScores: PlayerScoreDTO[];
  gameSessionSampleSolutions: Record<string, GameSessionSampleSolutionsDTO>;
}

interface PlayerGameSummaryDTO {
  playerSessionId: number;
  playerId: number;
  problemResults: {
    solvedCorrectly: number[];
    notSolvedFullyCorrectly: number[];
  };
}

const GAME_DURATION_MS = 15 * 60 * 1000;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GamePage() {
  const router = useRouter();
  const { value: userId } = useLocalStorage("userid", "");
  const { value: token } = useLocalStorage("token", "");
  const { value: storedUsername } = useLocalStorage("username", "Player One");
  const { gameSessionId } = useParams();

  const [language, setLanguage] = useState("python");
  const [playerSessionId, setPlayerSessionId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Record<string, { username: string; score: number }>>({});

  const me = players[String(userId)];
  const allPlayers = Object.entries(players);
  const { value: storedAvatarId } = useLocalStorage("avatarId", "1");

  const opponentEntry = userId
      ? allPlayers.find((entry): entry is [string, { username: string; score: number }] => {
        const [id] = entry;
        return id !== String(userId);
      })
      : null;
  const opponent = opponentEntry ? opponentEntry[1] : null;

  const myScore = me?.score ?? 0;

  const [playerAvatarId, setPlayerAvatarId] = useState<number>(1);
  const [opponentAvatarId, setOpponentAvatarId] = useState<number>(2);

  const [problem, setProblem] = useState<{
    id: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
  } | null>(null);

  const [currentRound, setCurrentRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameEndData, setGameEndData] = useState<GameEndDTO | null>(null);
  const [gameSummary, setGameSummary] = useState<PlayerGameSummaryDTO | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());

  // Timer
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Submit toast
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  const pythonStarter = `def solve(x):
    # Write your solution here
    return None`;

  const javaStarter = `public class Main {
    public static void main(String[] args) {
    }
}`;

  const [code, setCode] = useState(pythonStarter);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [submitResult, setSubmitResult] = useState<ExecutionResult | null>(null);

  const toggleSolution = (id: string) => {
    setExpandedSolutions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Load problem data from localStorage (saved by lobby page on game-start WS)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("gameRoundData");
    if (!stored) return;
    try {
      const data: GameRoundData = JSON.parse(stored);
      setPlayerSessionId(data.playerSessionId);
      const initialPlayers: Record<string, { username: string; score: number }> = {
        [String(data.playerId)]: {
          username: storedUsername,
          score: data.currentScore ?? 0
        }
      };
      if (data.opponentName) {
        initialPlayers["opponent"] = {
          username: data.opponentName,
          score: 0
        };
      }
      setPlayers(initialPlayers);
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

      // Set up game end time from backend endsAt, or fall back to 15min from now
      if (data.endsAt) {
        setGameEndTime(new Date(data.endsAt).getTime());
      } else {
        setGameEndTime(Date.now() + GAME_DURATION_MS);
      }
    } catch (e) {
      console.error("Failed to parse game data from localStorage", e);
    }
  }, [gameSessionId, storedUsername]);

  // Countdown tick — runs independently of problem changes
  useEffect(() => {
    if (gameEndTime === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((gameEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [gameEndTime]);

  useEffect(() => {
    if (typeof window === "undefined" || !token || !gameSessionId || !userId || userId === "") return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      connectHeaders: { token: token },
      onConnect: () => {
        console.log("Connected to Game WebSockets as user:", userId);

        client.subscribe(
          `/topic/game/${gameSessionId}/points-update`,
          (message: IMessage) => {
            const data = JSON.parse(message.body);
            const incomingSessionId = Number(data.playerSessionId);

            if (incomingSessionId === playerSessionId) {
              setPlayers(prev => ({
                ...prev,
                [String(userId)]: {
                  ...prev[String(userId)],
                  score: data.currentScore,
                },
              }));
            } else {
              setPlayers(prev => {
                const entry = Object.entries(prev).find(([id]) => id !== String(userId));
                const opponentId = entry ? entry[0] : "opponent";
                return {
                  ...prev,
                  [opponentId]: {
                    ...prev[opponentId],
                    score: data.currentScore,
                  },
                };
              });
            }
          }
        );

        client.subscribe(`/topic/game/${gameSessionId}/end`, (message: IMessage) => {
          const endData: GameEndDTO = JSON.parse(message.body);
          setGameEndData(endData);
          setIsGameOver(true);
          localStorage.removeItem("gameRoundData");
          localStorage.removeItem("roomLanguage");
        });

        client.subscribe(`/user/queue/game-summary`, (message: IMessage) => {
          const summary: PlayerGameSummaryDTO = JSON.parse(message.body);
          setGameSummary(summary);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [token, gameSessionId, userId]);

  // RUN BUTTON LOGIC
  const handleRun = async () => {
    if (!token || isRunning || !problem || playerSessionId == null) return;

    setIsRunning(true);
    setRunResult({ message: "Running code against sample cases...", status: "info" });

    try {
      const response = await fetch(`${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
        },
        body: JSON.stringify({
          "playerSessionId": playerSessionId,
          "sourceCode": code
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setRunResult({
          message: `Error: ${result.message ?? "Run failed"}`,
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
      setRunResult({
        message: "Connection error during execution.",
        status: "error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const refreshGameState = async () => {
    if (!problem || playerSessionId == null) return;

    try {
      const response = await fetch(
          `${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/submission-result?playerSessionId=${playerSessionId}`, {
            headers: { token: token }
          }
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
        setCurrentRound((prev) => prev + 1);
        setPlayers(prev => ({
          ...prev,
          [String(userId)]: {
            ...prev[String(userId)],
            score: updatedGameRound.currentScore
          }
        }));
        const lang = (updatedGameRound.gameLanguage ?? language).toLowerCase();
        setCode(lang === "java" ? javaStarter : pythonStarter);
      } else if (response.status === 204) {
        setIsGameOver(true);
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
            headers: {
              "Content-Type": "application/json",
              token: token,
            },
            body: JSON.stringify({
              playerSessionId: playerSessionId,
              sourceCode: code,
            }),
          }
      );

      const result = await response.json();

      if (!response.ok) {
        setSubmitResult({
          message: `Error: ${result.message ?? "Submission failed"}`,
          status: "error",
        });
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

  // GAME OVER screen
  if (isGameOver) {
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

            <div className={resultStyles.headerButtons} style={{
              display: "flex",
              gap: "12px",
              flexShrink: 0,
              whiteSpace: "nowrap"
            }}>
              <button
                  className={resultStyles.secondaryButton}
                  onClick={() => router.push("/menu")}
                  style={{ minWidth: "fit-content" }}
              >
                Back to Menu
              </button>
              <button
                  className={resultStyles.primaryButton}
                  onClick={() => router.push("/leaderboard")}
                  style={{ minWidth: "fit-content" }}
              >
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

            <div
                className={resultStyles.playerScoreBox}
                style={{ display: "flex", gap: "20px", justifyContent: "center" }}
            >
              <div className={`${resultStyles.playerCard} ${myScore >= (opponent?.score ?? 0) ? resultStyles.winnerCard : ""}`}>
                <div className={resultStyles.cardHeader}>
                  <strong>{storedUsername} (You)</strong>
                  {myScore >= (opponent?.score ?? 0) && (
                      <TrophyOutlined style={{ color: "#eab308", fontSize: "24px" }} />
                  )}
                </div>
                <div className={resultStyles.pointsText}>
                  {myScore} <span className={resultStyles.pointsLabel}>points</span>
                </div>
              </div>

              <div className={`${resultStyles.playerCard} ${opponent ? (opponent.score >= myScore ? resultStyles.winnerCard : "") : ""}`}>
                <div className={resultStyles.cardHeader}>
                  <strong>{opponent ? opponent.username : "Opponent"}</strong>
                  {opponent && opponent.score >= myScore && (
                      <TrophyOutlined style={{ color: "#eab308", fontSize: "24px" }} />
                  )}
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
                  const isSolved    = solvedCorrectly.includes(pid);
                  const isIncorrect = !isSolved && notSolved.includes(pid);

                  const borderColor = isSolved ? "#16a34a" : isIncorrect ? "#dc2626" : "#d1d5db";
                  const bgColor     = isSolved ? "#f0fdf4"  : isIncorrect ? "#fef2f2"  : "#f9fafb";
                  const badge = isSolved
                    ? <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "2px 10px", borderRadius: 6 }}>✓ Correct</span>
                    : isIncorrect
                    ? <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", background: "#fee2e2", padding: "2px 10px", borderRadius: 6 }}>✗ Incorrect</span>
                    : <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 10px", borderRadius: 6 }}>— Not solved</span>;

                  return (
                    <div
                      key={problemId}
                      className={resultStyles.problemItem}
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "12px",
                        cursor: "default",
                        border: `2px solid ${borderColor}`,
                        background: bgColor,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className={resultStyles.problemIndex}>{index + 1}</div>
                          <strong style={{ fontSize: "15px", color: "#1a1a2e" }}>{solution.problemTitle}</strong>
                          {badge}
                        </div>
                        <button
                          className={resultStyles.solutionToggleBtn}
                          onClick={() => toggleSolution(problemId)}
                        >
                          {isExpanded ? "Hide Solution" : "Show Solution"}
                        </button>
                      </div>
                      {isExpanded && (
                        <pre
                          className={resultStyles.solutionCode}
                          style={{ width: "100%", margin: 0, overflowX: "auto", boxSizing: "border-box" }}
                        >
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

  const currentResult = runResult ?? submitResult;
  const testCases = (currentResult && "testCases" in currentResult) ? currentResult.testCases : null;

  // Timer colour: red under 60s, orange under 5min, default otherwise
  const timerColor =
    timeLeft !== null && timeLeft <= 60
      ? "#dc2626"
      : timeLeft !== null && timeLeft <= 300
      ? "#d97706"
      : undefined;

  return (
      <div className={styles.pageBackground}>

        {/* SUBMIT TOAST */}
        {showSubmitToast && (
          <div style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#fff",
            border: "1.5px solid #16a34a",
            borderRadius: "10px",
            padding: "12px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          }}>
            <CheckCircleOutlined style={{ color: "#16a34a", fontSize: "20px" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>Solution submitted!</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Moving to the next problem...</div>
            </div>
          </div>
        )}

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

            <div style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
              paddingRight: "30px"
            }}>
              <div className={`${styles.nameBox} ${styles.nameBoxYou}`} style={{ display: "flex", alignItems: "center" }}>
                <CodosseumAvatar id={Number(storedAvatarId)} />
                <div className={styles.sessionArea}>
                  <p className={styles.sessionLabel}>You</p>
                  <h2 className={styles.sessionValue}>{storedUsername}</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "10px" }}>
                  <TrophyOutlined style={{ color: "#3b82f6", fontSize: "20px" }} />
                  <span style={{ fontWeight: "700", fontSize: "22px" }}>{myScore}</span>
                </div>
              </div>

              <span style={{ fontWeight: "bold", color: "#94a3b8" }}>VS</span>

              <div className={styles.nameBox} style={{ border: "2px solid #ef4444" }}>
                <CodosseumAvatar id={opponentAvatarId} size={50} backgroundColor="#ef4444" />
                <div className={styles.sessionArea}>
                  <p className={styles.sessionLabel}>Opponent</p>
                  <h2 className={styles.sessionValue}>{opponent ? opponent.username : "Waiting..."}</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "10px" }}>
                  <TrophyOutlined style={{ color: "#ef4444", fontSize: "20px" }} />
                  <span style={{ fontWeight: "700", fontSize: "22px" }}>{opponent ? opponent.score : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.content}>

          {/* LEFT: PROBLEM */}
          <div className={styles.card}>
            {problem ? (
                <>
                  <section className={styles.section}>
                    <div className={styles.problemHeader}>
                      <h3 className={styles.problemTitle}>{problem.title}</h3>
                      <div className={styles.badgeRow}>
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

          {/* RIGHT: CODE EDITOR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            <div className={styles.card} style={{ flex: 2, paddingBottom: 0, overflow: "hidden" }}>
              <section className={styles.section}>
                <div className={styles.problemHeader}>
                  <h3 className={styles.sectionTitle}>Code Editor</h3>
                  <span className={styles.languageIndicator}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </span>
                </div>
              </section>
              <hr className={styles.divider} />

              <div className={styles.editorBox}>
                <CodeMirror
                    value={code}
                    height="100%"
                    style={{ height: "100%" }}
                    extensions={[
                      language === "java" ? java() : python(),
                      indentUnit.of("    "),
                    ]}
                    onChange={(value) => setCode(value)}
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: false,
                      dropCursor: true,
                      allowMultipleSelections: true,
                      indentOnInput: true,
                    }}
                />
              </div>
              <div className={styles.actionRow}>
                <button className={styles.runButton} onClick={handleRun} disabled={isRunning || isSubmitting}>
                  {isRunning ? <LoadingOutlined spin /> : <><PlayCircleOutlined /> Run</>}
                </button>
                <button className={styles.submitButton} onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                  {isSubmitting ? <LoadingOutlined spin /> : <><SendOutlined /> Submit</>}
                </button>
              </div>
            </div>

            {/* OUTPUT RENDERING */}
            <div className={styles.card} style={{ flex: 1 }}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <svg className={styles.outputTitleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                  </svg>
                  Output
                </h3>
              </section>
              <hr className={styles.divider} />

              <div className={styles.outputContent}>
                {testCases ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 8px 20px 8px" }}>
                      {currentResult?.summary && (
                          <div style={{ fontWeight: 600, fontSize: "16px", color: currentResult.status === "success" ? "#16a34a" : "#dc2626" }}>
                            {currentResult.summary}
                          </div>
                      )}
                      {testCases.map((t, index) => {
                        const isPass = t.result === "PASS";
                        return (
                            <div key={t.testCaseId} style={{ border: `1px solid ${isPass ? "#16a34a" : "#dc2626"}`, borderRadius: "8px", padding: "10px", background: isPass ? "#f0fdf4" : "#fef2f2" }}>
                              <div style={{ fontWeight: 600 }}>{isPass ? "✅ PASS" : "❌ FAIL"} — Test {index + 1}</div>
                              <div style={{ marginTop: "6px", fontSize: "13px" }}>
                                <div><strong>Expected:</strong> {t.expectedOutput}</div>
                                <div><strong>Actual:</strong> {t.actualOutput}</div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                ) : currentResult?.message ? (
                    <pre className={styles.exampleText} style={{ padding: "20px", whiteSpace: "pre-wrap" }}>
                      {currentResult.message}
                    </pre>
                ) : (
                    <div className={styles.placeholderContainer}>
                      <svg className={styles.terminalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                      </svg>
                      <p className={styles.placeholderText}>Run or submit your code to see results</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}