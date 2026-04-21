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
  LoadingOutlined
} from "@ant-design/icons";
import { Avatar } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";


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

export default function GamePage() {
  const router = useRouter();

  const { value: token } = useLocalStorage("token", "");
  const { value: storedUsername } = useLocalStorage("username", "Player One");
  const { gameSessionId } = useParams();

  const [language, setLanguage] = useState("python");
  const [playerSessionId, setPlayerSessionId] = useState<number | null>(null);

  const [problem, setProblem] = useState<{
    id: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
  } | null>(null);

  const [myScore, setMyScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

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

  // Load problem data from localStorage (saved by lobby page on game-start WS)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("gameRoundData");
    if (!stored) return;
    try {
      const data: GameRoundData = JSON.parse(stored);
      setPlayerSessionId(data.playerSessionId);
      setMyScore(data.currentScore ?? 0);
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
    } catch (e) {
      console.error("Failed to parse game data from localStorage", e);
    }
  }, [gameSessionId]);

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
            headers: {
              token: token
            }
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
      setMyScore(updatedGameRound.currentScore);
      const lang = (updatedGameRound.gameLanguage ?? language).toLowerCase();
      setCode(lang === "java" ? javaStarter : pythonStarter);
      } else if (response.status === 204) {
        setIsGameOver(true)
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
          <div className={resultStyles.headerButtons}>
            <button className={resultStyles.secondaryButton} onClick={() => router.push("/menu")}>
              Back to Menu
            </button>
            <button className={resultStyles.primaryButton} onClick={() => router.push("/leaderboard")}>
              View Leaderboard
            </button>
          </div>
        </div>
        <div className={resultStyles.resultsContent}>
          <div className={resultStyles.victoryBanner}>
            <TrophyOutlined className={resultStyles.trophyIcon} style={{ fontSize: "48px", marginBottom: "10px" }} />
            <h1 className={resultStyles.victoryTitle}>Game Over</h1>
            <span className={resultStyles.sessionText}>Session {gameSessionId}</span>
          </div>
          <div className={resultStyles.playerScoreBox}>
            <div className={resultStyles.playerCard}>
              <div className={resultStyles.cardHeader}>
                <strong>{storedUsername} (You)</strong>
              </div>
              <div className={resultStyles.pointsText}>
                {myScore} <span className={resultStyles.pointsLabel}>points</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentResult = runResult ?? submitResult;
  const testCases = (currentResult && 'testCases' in currentResult) ? currentResult.testCases : null;

  return (
    <div className={styles.pageBackground}>

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

          <div className={`${styles.nameBox} ${styles.nameBoxYou}`} style={{ marginLeft: "250px" }}>
            <Avatar size="default" style={{ backgroundColor: "#3b82f6" }} icon={<UserOutlined style={{ fontSize: "16px" }} />} />
            <div className={styles.sessionArea}>
              <p className={styles.sessionLabel}>You</p>
              <h2 className={styles.sessionValue}>{storedUsername}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
              <TrophyOutlined style={{ color: "#3b82f6", fontSize: "24px" }} />
              <span style={{ fontWeight: "700", fontSize: "24px", color: "#1a1a2e" }}>{myScore}</span>
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
                    <span className={styles.timerBadge}>
                      <ClockCircleOutlined />
                      5:00
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
          <div
              className={styles.card}
              style={{ flex: 2, paddingBottom: 0, overflow: "hidden" }}
          >
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
            <button
                className={styles.runButton}
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
            >
              {isRunning ? (
                  <LoadingOutlined spin />
              ) : (
                  <>
                    <PlayCircleOutlined />
                    Run
                  </>
              )}
            </button>
            <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
            >
              {isSubmitting ? (
                  <LoadingOutlined spin />
              ) : (
                  <>
                    <SendOutlined />
                    Submit
                  </>
              )}
            </button>
          </div>
        </div>

          {/* OUTPUT RENDERING */}
          <div className={styles.card} style={{ flex: 1 }}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg
                    className={styles.outputTitleIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
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
                        <div style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          color: currentResult.status === "success" ? "#16a34a" : "#dc2626"
                        }}>
                          {currentResult.summary}
                        </div>
                    )}

                    {testCases.map((t, index) => {
                      const isPass = t.result === "PASS";
                      return (
                          <div
                              key={t.testCaseId}
                              style={{
                                border: `1px solid ${isPass ? "#16a34a" : "#dc2626"}`,
                                borderRadius: "8px",
                                padding: "10px",
                                background: isPass ? "#f0fdf4" : "#fef2f2"
                              }}
                          >
                            <div style={{ fontWeight: 600 }}>
                              {isPass ? "✅ PASS" : "❌ FAIL"} — Test {index + 1}
                            </div>

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
                    <svg
                        className={styles.terminalIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                      <polyline points="4 17 10 11 4 5"></polyline>
                      <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>

                    <p className={styles.placeholderText}> Run or submit your code to see results </p>
                  </div>
              )}
            </div>
        </div>
       </div>
      </div>
    </div>
  );
}