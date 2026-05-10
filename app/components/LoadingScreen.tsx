"use client";

import React, { useState, useEffect } from "react";
import loadingStyles from "@/styles/loadingScreen.module.css";

const lines = [
    "> Initializing arena...",
    "> Loading problem set................[OK]",
    "> Connecting to opponent.............[OK]",
    "> Establishing secure channel........[OK]",
    '> Sharpening the blades of logic...',
];

export default function LoadingScreen() {
    const [visibleLines, setVisibleLines] = useState<number>(0);

    useEffect(() => {
        lines.forEach((_, i) => {
            setTimeout(() => setVisibleLines(i + 1), i * 500);
        });
    }, []);

    return (
        <div className={loadingStyles.fullPageLoader}>
            <div className={loadingStyles.loaderContent}>
                <div className={loadingStyles.spinnerWrapper}>
                <div className={loadingStyles.vsGlow}></div>
                    <div className={loadingStyles.ringBackground} />
                    <div className={loadingStyles.ringSpinner}>
                        <svg viewBox="0 0 120 120" width="100%" height="100%">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#7c3aed"
                                strokeWidth="6" strokeDasharray="90 250" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={loadingStyles.iconCenter}>
                        <img src="/codosseum_icon.svg" alt="Codosseum" width={80} height={80} />
                    </div>
                </div>

                <div className={loadingStyles.terminalBox}>
                    {lines.slice(0, visibleLines).map((line, i) => (
                        <p
                            key={i}
                            className={loadingStyles.terminalLine}
                            style={{
                                animationDuration: i < lines.length - 1
                                    ? `${line.length * 0.025}s`
                                    : `${line.length * 0.045}s`
                            }}
                        >
                            {line}
                        </p>
                    ))}
                    {visibleLines > 0 && visibleLines <= lines.length && (
                        <span className={loadingStyles.cursor}>▋</span>
                    )}
                </div>

                
            </div>
        </div>
    );
}