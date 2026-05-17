"use client";

import styles from "@/styles/game.module.css";
import CodeMirror from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { sql } from "@codemirror/lang-sql";
import {SendOutlined, PlayCircleOutlined, LoadingOutlined, BulbOutlined} from "@ant-design/icons";
import { ExecutionResult } from "../_types";
import {useState} from "react";
import { bracketMatching} from "@codemirror/language";
import { highlightSelectionMatches } from "@codemirror/search";
import { autocompletion } from "@codemirror/autocomplete";
import { closeBrackets } from "@codemirror/autocomplete";


interface CodeEditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  isRunning: boolean;
  isSubmitting: boolean;
  onRun: () => void;
  onSubmit: () => void;
  runResult: ExecutionResult | null;
  submitResult: ExecutionResult | null;
  hint?: string | null;
}

export default function CodeEditorPanel({
  code,
  setCode,
  language,
  isRunning,
  isSubmitting,
  onRun,
  onSubmit,
  runResult,
  submitResult,
  hint,
}: CodeEditorPanelProps) {
  const currentResult = runResult ?? submitResult;
  const testCases = currentResult && "testCases" in currentResult ? currentResult.testCases : null;
  const [showHint, setShowHint] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>

      {/* CODE EDITOR */}
      <div className={styles.card} style={{ flex: 2, paddingBottom: 0, overflow: "hidden" }}>
        <section className={styles.section}>
          <div className={styles.problemHeader}>
            <h3 className={styles.sectionTitle}>Code Editor</h3>
            <span className={styles.languageIndicator}>
              {language === "sqlite" ? "SQLite" : language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          </div>
        </section>
        <hr className={styles.divider} />
        <div className={styles.editorBox}>
          <CodeMirror
            value={code}
            height="100%"
            style={{ height: "100%" }}
            extensions={[language === "java" ? java() : language === "sqlite" ? sql() : python(),
              indentUnit.of("    "),
              bracketMatching(),
              closeBrackets(),
              highlightSelectionMatches(),
              autocompletion()     ]}
            onChange={(value) => setCode(value)}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>
        <div className={styles.actionRow}>
          <button className={styles.runButton} onClick={() => { setShowHint(false); onRun(); }} disabled={isRunning || isSubmitting}>
            {isRunning ? <LoadingOutlined spin /> : <><PlayCircleOutlined /> Run</>}
          </button>
          <button className={styles.submitButton} onClick={() => { setShowHint(false); onSubmit(); }} disabled={isRunning || isSubmitting}>
            {isSubmitting ? <LoadingOutlined spin /> : <><SendOutlined /> Submit</>}
          </button>
          <button className={styles.hintButton} onClick={() => setShowHint(true)} disabled={!hint}>
            <BulbOutlined /> Hint
          </button>
        </div>
      </div>

      {/* OUTPUT */}
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
          {showHint && hint ? (
              <div style={{ padding: "16px" }}>
                  <div style={{
                      border: "1px solid #fed7aa", borderRadius: "8px",
                      padding: "14px 16px", background: "#fff7ed",
                      fontSize: "14px", lineHeight: "1.6", color: "#374151"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "18px" }}>💡</span>
                      <span style={{ fontWeight: 700, fontSize: "15px", color: "#ea580c" }}>Hint</span>
                  </div>
                  {hint}
                </div>
              </div>
          ) : testCases ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 8px 20px 8px" }}>
              {currentResult?.summary && (() => {
                  const isTopLevelError =
                      currentResult.summary === "Runtime Error" ||
                      currentResult.summary === "Compilation Error" ||
                      testCases.every(t => t.result === "ERROR");
                  const errorTitle =
                      currentResult.summary === "Runtime Error" ? "Runtime Error" :
                          currentResult.summary === "Compilation Error" ? "Compilation Error" :
                              "Error";
                  return isTopLevelError ? (
                      <div style={{
                          background: "#fffbeb", border: "1px solid #d97706",
                          borderRadius: "8px", padding: "12px 16px",
                          display: "flex", alignItems: "flex-start", gap: "8px",
                      }}>
                          <span style={{ fontSize: "16px" }}>⚠️</span>
                          <div>
                              <div style={{ fontWeight: 700, fontSize: "14px", color: "#b45309", marginBottom: "4px" }}> {errorTitle} </div>
                              <div style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.6, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                              {testCases?.[0]?.errorMessage ?? testCases?.[0]?.actualOutput ?? "An internal error occurred."}
                          </div>
                          </div>
                      </div>
                  ) : (
                      <div style={{ fontWeight: 600, fontSize: "16px", color: currentResult.status === "success" ? "#16a34a" : "#dc2626" }}>
                          {currentResult.summary}
                      </div>
                  );
              })()}

                {!testCases.every(t => t.result === "ERROR") && testCases.map((t, index) => (
                    <div key={t.testCaseId} style={{
                        border: `1px solid ${t.result === "PASS" ? "#16a34a" : t.result === "ERROR" ? "#d97706" : "#dc2626"}`,
                        borderRadius: "8px", padding: "10px",
                        background: t.result === "PASS" ? "#f0fdf4" : t.result === "ERROR" ? "#fffbeb" : "#fef2f2"
                    }}>
                        <div style={{ fontWeight: 600 }}>
                            {t.result === "PASS" ? "✅ PASS" : t.result === "ERROR" ? "⚠️ ERROR" : "❌ FAIL"} — Test {index + 1}
                        </div>
                        <div style={{ marginTop: "6px", fontSize: "13px" }}>
                            {t.result === "ERROR" ? (
                                <pre style={{
                                    marginTop: "6px", background: "#fef3c7", borderRadius: "4px",
                                    padding: "8px", fontSize: "12px", whiteSpace: "pre-wrap",
                                    color: "#92400e", fontFamily: "monospace",
                                }}>
                                    {t.errorMessage ?? t.actualOutput}
                                  </pre>
                            ) : (
                                <>
                                    <div><strong>Expected:</strong> {t.expectedOutput}</div>
                                    <div><strong>Actual:</strong> {t.actualOutput ?? "—"}</div>
                                </>
                            )}
                        </div>
                    </div>
              ))}
            </div>
          ) : currentResult?.message ? (
              currentResult.status === "error" ? (
                  <div style={{ padding: "16px" }}>
                      <div style={{
                          background: "#fffbeb", border: "1px solid #d97706",
                          borderRadius: "8px", padding: "14px 16px",
                          display: "flex", alignItems: "flex-start", gap: "10px",
                      }}>
                          <span style={{ fontSize: "18px", lineHeight: 1.4 }}>⚠️</span>
                          <div>
                              <div style={{ fontWeight: 700, fontSize: "14px", color: "#b45309", marginBottom: "4px" }}>Error</div>
                              <div style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.6 }}>{currentResult.message}</div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <pre className={styles.exampleText} style={{ padding: "20px", whiteSpace: "pre-wrap" }}>
                    {currentResult.message}
                  </pre>
              )
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
  );
}