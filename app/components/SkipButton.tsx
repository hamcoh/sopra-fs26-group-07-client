import React from "react";
import styles from "@/styles/game.module.css";
import { StepForwardOutlined, LoadingOutlined } from "@ant-design/icons";

type SkipButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    used: number;
    max: number | null;
};

const SkipButton: React.FC<SkipButtonProps> = ({
                                                   onClick,
                                                   disabled,
                                                   isLoading,
                                                   used,
                                                   max,
                                               }) => {
    const hasLimit = max !== null;
    const noSkipsLeft = hasLimit && used >= max;

    const isDisabled = disabled || isLoading || noSkipsLeft;

    return (
        <button
            className={styles.skipButton}
            onClick={onClick}
            disabled={isDisabled}
        >
            {isLoading ? (
                <LoadingOutlined spin />
            ) : (
                <>
                    <StepForwardOutlined />
                    Skip
                    {hasLimit && (
                        <span style={{ marginLeft: 8, opacity: 0.75 }}>
                            ({used}/{max})
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

export default SkipButton;