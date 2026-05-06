"use client";

import styles from "@/styles/game.module.css";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import { TrophyOutlined } from "@ant-design/icons";
import { Particle } from "../_types";

interface ScoreBoxProps {
  isMe: boolean;
  storedUsername: string;
  storedAvatarId: number;
  opponentAvatarId: number;
  opponentUsername: string | null;
  myScore: number;
  opponentScore: number;
  flash: { delta: number; key: number } | null;
  particles: Particle[];
}

export default function ScoreBox({
  isMe,
  storedUsername,
  storedAvatarId,
  opponentAvatarId,
  opponentUsername,
  myScore,
  opponentScore,
  flash,
  particles,
}: ScoreBoxProps) {
  const boxClass = isMe
    ? `${styles.nameBox} ${styles.nameBoxYou} ${flash ? styles.boxStrike : ""}`
    : `${styles.nameBox} ${flash ? styles.boxStrike : ""}`;
  const borderStyle = isMe ? {} : { border: "2px solid #ef4444" };
  const avatarId = isMe ? storedAvatarId : opponentAvatarId;
  const avatarBg = isMe ? undefined : "#ef4444";
  const label = isMe ? "You" : "Opponent";
  const name = isMe ? storedUsername : (opponentUsername ?? "Waiting...");
  const score = isMe ? myScore : opponentScore;
  const trophyColor = isMe ? "#3b82f6" : "#ef4444";

  return (
    <div style={{ position: "relative" }}>
      {/* Score box — overflow:hidden clips the slash */}
      <div
        className={boxClass}
        style={{ display: "flex", alignItems: "center", position: "relative", overflow: "hidden", ...borderStyle }}
      >
        <CodosseumAvatar id={avatarId} size={50} backgroundColor={avatarBg} />
        <div className={styles.sessionArea}>
          <p className={styles.sessionLabel}>{label}</p>
          <h2 className={styles.sessionValue}>{name}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "10px" }}>
          <TrophyOutlined style={{ color: trophyColor, fontSize: "20px" }} />
          <span style={{ fontWeight: "700", fontSize: "22px" }}>{score}</span>
        </div>
        {/* Sword slash sweeps through the box */}
        {flash && <div key={flash.key} className={styles.slashElement} />}
      </div>

      {/* Particles — outside so they aren't clipped by overflow:hidden */}
      {particles.map(p => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            "--tx": `${p.x}px`,
            "--ty": `${p.y}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Floating badge — outside so it floats above without being clipped */}
      {flash && (
        <div key={`b-${flash.key}`} className={styles.scoreBadge}>
          ⚔️ +{flash.delta} pts
        </div>
      )}
    </div>
  );
}