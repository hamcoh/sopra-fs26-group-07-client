"use client";

import styles from "@/styles/game.module.css";
import CodeMirror from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { SendOutlined, PlayCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { ExecutionResult } from "../_types";

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
}: CodeEditorPanelProps) {
  const currentResult = runResult ?? submitResult;
  const testCases = currentResult && "testCases" in currentResult ? currentResult.testCases : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>

      {/* CODE EDITOR */}
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
            extensions={[language === "java" ? java() : python(), indentUnit.of("    ")]}
            onChange={(value) => setCode(value)}
            basicSetup={{ lineNumbers: true, foldGutter: false, dropCursor: true, allowMultipleSelections: true, indentOnInput: true }}
          />
        </div>
        <div className={styles.actionRow}>
          <button className={styles.runButton} onClick={onRun} disabled={isRunning || isSubmitting}>
            {isRunning ? <LoadingOutlined spin /> : <><PlayCircleOutlined /> Run</>}
          </button>
          <button className={styles.submitButton} onClick={onSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? <LoadingOutlined spin /> : <><SendOutlined /> Submit</>}
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
  );
}