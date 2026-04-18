"use client";

import React from "react";
import loadingStyles from "@/styles/loadingScreen.module.css";
export default function LoadingScreen() {
    return (
        <div className={loadingStyles.fullPageLoader}>
            <div className={loadingStyles.loaderContent}>
                <img
                    src="/codosseum_loading.png"
                    alt="Codosseum Logo"
                    className={loadingStyles.mainLogo}
                />

                <div className={loadingStyles.vsGlow}></div>

                <div className={loadingStyles.loadingTextContainer}>
                    <div className={loadingStyles.loadingBar}>
                        <div className={loadingStyles.loadingProgress}></div>
                    </div>
                    <p className={loadingStyles.gladiatorQuote}>
                        "Sharpening the blades of logic..."
                    </p>
                </div>
            </div>
        </div>
    );
}