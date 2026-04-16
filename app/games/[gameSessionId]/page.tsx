"use client";

import { useRouter, useParams } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/game.module.css";
import resultStyles from "@/styles/results.module.css";
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import {
  PlayCircleOutlined,
  SendOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { indentUnit } from "@codemirror/language";
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

export default function GamePage() {
  const router = useRouter();

  // NEEDED FOR API REQUESTS & UI
  const { value: token } = useLocalStorage("token", "");
  const { value: userId } = useLocalStorage("userid", "");
  const { value: storedUsername } = useLocalStorage("username", "Player One");
  const { gameSessionId } = useParams();

  // PLACEHOLDER FOR RENDERING THE PROGRAMMING LANGUAGE ABOVE THE CODE EDITOR
  const [language, setLanguage] = useState("python");

  // PLACEHOLDER FOR PROBLEM RENDERING (SAMPLE PROBLEM)
  const [problem, setProblem] = useState({
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    timeLimit: "7:00",
    description: "Given an array of integers nums and an integer target, return indices of the numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" }
    ]
  });

  // SCORE & ROUND TRACKING (HEADER PART)
  const [myScore, setMyScore] = useState(150);
  const [opponentScore, setOpponentScore] = useState(180);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);

  // NEEDED FOR GAME RESULT/END UI CONDITIONAL RENDERING
  const [isGameOver, setIsGameOver] = useState(false);

  // NEEDED FOR EXAMPLE TEXT THAT SHOULD SHOW UP IN THE CODE EDITOR
  const [code, setCode] = useState(`def solution(input_data):\n    # Write your solution here\n    pass`);


  useEffect(() => {
    const fetchProblem = async () => {
      if (!token || !gameSessionId) return;

      try {
        const response = await fetch(`${getApiDomain()}/games/${gameSessionId}/problems`, {
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProblem({
            id: data.id ?? 1,
            title: data.title ?? "Unknown Problem",
            difficulty: data.difficulty ?? "Easy",
            timeLimit: data.timeLimit ?? "7:00",
            description: data.description ?? "",
            examples: data.examples ?? []
          });

          if(data.totalRounds) setTotalRounds(data.totalRounds);

          // EVERYTIME A PROBLEM IS SUBMITTED THE CODE WILL BE REPLACED THROUGH THIS:
          const starterCode = language === "python"
              ? "def solution(input_data):\n    pass"
              : "public class Main {\n    public static void main(String[] args) {\n    }\n}";

          setCode(starterCode);
          setOutput("");
        }
      } catch (error) {
        console.error("Error while loading the problem", error);
      }
    };

    fetchProblem();
  }, [token, gameSessionId, currentRound]);

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // RUN BUTTON LOGIC
  const handleRun = async () => {
    if (!token || isRunning) return;

    setIsRunning(true);
    setOutput("Running code...");

    try {
      const response = await fetch(`${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
        },
        body: JSON.stringify({
          gameSessionId: gameSessionId,
          problemId: problem.id,
          playerSessionId: Number(userId),
          sourceCode: code
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOutput(result.output || result.stdout || "Code executed successfully (no output).");
      } else {
        const errorData = await response.json();
        setOutput(`Error: ${errorData.message || "Execution failed"}`);
      }
    } catch (error) {
      console.error("Run error:", error);
      setOutput("Connection error. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  // SUBMIT BUTTON LOGIC
  const handleSubmit = async () => {
    if (!token || isRunning) return;

    setIsRunning(true);
    setOutput("Submitting solution...");

    try {
      const response = await fetch(`${getApiDomain()}/games/${gameSessionId}/problems/${problem.id}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
        },
        body: JSON.stringify({
          gameSessionId: gameSessionId,
          problemId: problem.id,
          playerSessionId: Number(userId),
          sourceCode: code
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOutput("Success: " + (result.message || "Solution submitted successfully!"));
        setMyScore(result.newScore);
        setCurrentRound((prev) => prev + 1);
      } else {
        const errorData = await response.json();
        setOutput(`Submission Error: ${errorData.message || "Failed to submit"}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setOutput("Connection error during submission.");
    } finally {
      setIsRunning(false);
    }
  };

  {/* GAME-RESULT UI */}
  if (isGameOver) {
    return (
        <div className={resultStyles.pageBackground}>
          {/* HEADER PART */}
          <div className={styles.topRow}>
            <div className={styles.logoArea}>
              <CodosseumLogo size={100} />
              <div className={styles.logoTexts}>
                <h1 className={styles.logoTitle}>Codosseum</h1>
                <p className={styles.logoSubtitle}>Game Results</p>
              </div>
            </div>

            {/* HEADER BUTTONS */}
              <div className={resultStyles.headerButtons}>
                <button
                    className={resultStyles.secondaryButton}
                    onClick={() => router.push("/menu")}
                >
                  Back to Menu
                </button>
                <button className={resultStyles.primaryButton}
                        onClick={() => router.push("/leaderboard")}>
                  View Leaderboard
                </button>
              </div>
          </div>

          <div className={resultStyles.resultsContent}>

            {/* VICTORY BANNER */}
            <div className={resultStyles.victoryBanner}>
              <TrophyOutlined className={resultStyles.trophyIcon} style={{ fontSize: '48px', marginBottom: '10px' }} />
              <h1 className={resultStyles.victoryTitle}>
                {myScore > opponentScore ? "Victory!" : "Game Over"}
              </h1>
              <p>{myScore > opponentScore ? storedUsername : "CodeMaster"} wins the battle!</p>
              <span className={resultStyles.sessionText}>Session {gameSessionId}</span>
            </div>

            {/* PLAYER SCORE BOX (MYSELF) */}
            <div className={resultStyles.playerScoreBox}>
              <div className={`${resultStyles.playerCard} ${myScore >= opponentScore ? resultStyles.winnerCard : ""}`}>
                <div className={resultStyles.cardHeader}>
                  <strong>{storedUsername} (You)</strong>
                  {myScore >= opponentScore && <TrophyOutlined style={{ color: '#eab308', fontSize: '24px' }} />}
                </div>
                <div className={resultStyles.pointsText}>{myScore} <span className={resultStyles.pointsLabel}>points</span></div>
              </div>

              {/* OPPONENT SCORE BOX */}
              <div className={`${resultStyles.playerCard} ${opponentScore > myScore ? resultStyles.winnerCard : ""}`}>
                <div className={resultStyles.cardHeader}>
                  <strong>CodeMaster</strong>
                  {opponentScore > myScore && <TrophyOutlined style={{ color: '#eab308', fontSize: '24px' }}/>}
                </div>
                <div className={resultStyles.pointsText}>{opponentScore} <span className={resultStyles.pointsLabel}>points</span></div>
              </div>
            </div>

            {/* PROBLEMS THAT WERE SOLVED IN THE SESSION (TODO:SAMPLE SOLUTIONS RENDERING)*/}
            <div className={resultStyles.problemsSection}>
              <h2 style={{ marginBottom: '20px' }}>Problems (3)</h2>

              {/* PLACEHOLDER1 PROBLEM */}
              <div className={resultStyles.problemItem}>
                <div>
                  <h3 style={{ margin: 0 }}>Two Sum</h3>
                  <span className={styles.difficultyBadge}>Easy</span>
                </div>
                <div style={{ textAlign: 'right' }}></div>
              </div>

              {/* PLACEHOLDER2 PROBLEM */}
              <div className={resultStyles.problemItem}>
                <div>
                  <h3 style={{ margin: 0 }}>Reverse Linked List</h3>
                  <span className={styles.difficultyBadge}>Easy</span>
                </div>
                <div style={{ textAlign: 'right' }}></div>
              </div>

              {/* PLACEHOLDER3 PROBLEM */}
              <div className={resultStyles.problemItem}>
                <div>
                  <h3 style={{ margin: 0 }}>Valid Parenthesis</h3>
                  <span className={styles.difficultyBadge}>Easy</span>
                </div>
                <div style={{ textAlign: 'right' }}></div>
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
              <h2 className={`${styles.sessionValue} ${styles.blueValue}`}>{currentRound}/{totalRounds}</h2>
            </div>

            {/* Name Box of current player */}
            <div
                className={`${styles.nameBox} ${styles.nameBoxYou}`}
                style={{ marginLeft: "250px" }}
            >
              <Avatar
                  size="default"
                  style={{ backgroundColor: '#3b82f6'}}
                  icon={<UserOutlined style={{ fontSize: '16px' }} />}
              >
              </Avatar>
              <div className={styles.sessionArea}>
                <p className={styles.sessionLabel}>You</p>
                <h2 className={styles.sessionValue}>{storedUsername}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <TrophyOutlined style={{ color: '#3b82f6', fontSize: '24px' }} />
                <span style={{
                  fontWeight: '700',
                  fontSize: '24px',
                  color: '#1a1a2e'
                }}>
                  {myScore}
                </span>
              </div>
            </div>

            <div className={styles.verticalDivider} />

            {/* Opponent Name Box */}
            <div className={styles.nameBox}>
              <Avatar
                  size="default"
                  style={{ backgroundColor: '#9CA3AF', flexShrink: 0 }}
                  icon={<UserOutlined style={{ fontSize: '16px' }} />}
              >
              </Avatar>
              <div className={styles.sessionArea}>
                <p className={styles.sessionLabel}>Opponent</p>
                <h2 className={styles.sessionValue}>CodeMaster</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <TrophyOutlined style={{ color: '#9CA3AF', fontSize: '24px' }} />
                <span style={{
                  fontWeight: '700',
                  fontSize: '24px',
                  color: '#1a1a2e'
                }}>
                  {opponentScore}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.content}>

          {/* LEFT: PROBLEM INFOS TITLE & DESCRIPTION */}
          <div className={styles.card}>
            <section className={styles.section}>
              <div className={styles.problemHeader}>
                <h3 className={styles.problemTitle}>{problem.title}</h3>
                <div className={styles.badgeRow}>
                  <span className={styles.difficultyBadge}>{problem.difficulty}</span>
                  <span className={styles.timerBadge}>
                    <ClockCircleOutlined />
                    {problem.timeLimit}
                  </span>
                </div>
              </div>
            </section>

            <hr className={styles.divider} />

            <div className={styles.scrollableContent}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <p className={styles.problemDescription}>
                  {problem.description}
                </p>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Examples</h3>

                {/* Example 1 */}
                {problem.examples.map((ex, index) => (
                    <div key={index} className={styles.exampleCard}>
                      <div className={styles.exampleBlock}>
                        <h5 className={styles.exampleSubTitle}>Input:</h5>
                        <div className={styles.exampleContentBox}>
                          <p className={styles.exampleText}>{ex.input}</p>
                        </div>
                      </div>
                      <div className={styles.exampleBlock}>
                        <h5 className={styles.exampleSubTitle}>Output:</h5>
                        <div className={styles.exampleContentBox}>
                          <p className={styles.exampleText}>{ex.output}</p>
                        </div>
                      </div>
                    </div>
                ))}
              </section>

            </div>
          </div>

          {/* RIGHT: CODE EDITOR & OUTPUT */}
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
                    style={{ height: '100%' }}
                    extensions={[
                      language === 'python' ? python() : java(),
                      indentUnit.of("    ")
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
                    disabled={isRunning}
                >
                  <PlayCircleOutlined />
                  {isRunning ? "Running..." : "Run"}
                </button>
                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isRunning}
                >
                  <SendOutlined />
                  {isRunning ? "Submitting..." : "Submit"}
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
                {output ? (
                    <pre className={styles.exampleText} style={{ padding: '20px', color: '#1a1a2e', whiteSpace: 'pre-wrap' }}>
                      {output}
                    </pre>
                ) : (
                    <div className={styles.placeholderContainer}>
                      <svg className={styles.terminalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                      </svg>
                      <p className={styles.placeholderText}>Run your code to see results</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}