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
  UserOutlined
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

  const pythonStarter = `def solve(*args):
    # Write your solution here
    return None`;

  const javaStarter = `public class Main {
    public static void main(String[] args) {
    }
}`;

  const [code, setCode] = useState(pythonStarter);
  const [submitResult, setSubmitResult] = useState<{
    message: string;
    status: "success" | "error" | "info";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const { verdict, passedTestCases, totalTestCases } = result;

      if (verdict === "CORRECT_ANSWER") {
        setMyScore((prev) => prev + 100);
        setCurrentRound((prev) => prev + 1);
        setSubmitResult({
          message: `✓  Correct! All ${totalTestCases} test cases passed. +100 points`,
          status: "success",
        });
        setCode(language === "java" ? javaStarter : pythonStarter);
      } else if (verdict === "WRONG_ANSWER") {
        setSubmitResult({
          message: `✗  Wrong Answer — ${passedTestCases}/${totalTestCases} test cases passed.`,
          status: "error",
        });
      } else if (verdict === "COMPILE_ERROR") {
        setSubmitResult({
          message: `✗  Compile Error — make sure your function is named "solve" and has a return statement.`,
          status: "error",
        });
      } else if (verdict === "TIME_LIMIT_EXCEEDED") {
        setSubmitResult({
          message: `✗  Time Limit Exceeded — optimise your solution.`,
          status: "error",
        });
      } else {
        setSubmitResult({
          message: `Status: ${result.submissionStatus ?? "unknown"} · Verdict: ${verdict ?? "unknown"}`,
          status: "info",
        });
      }
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
                      Round {currentRound}
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
        <div className={styles.card} style={{ flex: 1, paddingBottom: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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

          {/* Submit result banner */}
          {submitResult && (
            <div
              style={{
                padding: "10px 20px",
                background:
                  submitResult.status === "success" ? "#f0fdf4"
                  : submitResult.status === "error" ? "#fef2f2"
                  : "#f8fafc",
                borderTop: `1.5px solid ${
                  submitResult.status === "success" ? "#bbf7d0"
                  : submitResult.status === "error" ? "#fecaca"
                  : "#e2e8f0"
                }`,
                color:
                  submitResult.status === "success" ? "#16a34a"
                  : submitResult.status === "error" ? "#dc2626"
                  : "#1a1a2e",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {submitResult.message}
            </div>
          )}

          <div className={styles.actionRow}>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting || !problem}
            >
              <SendOutlined />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}