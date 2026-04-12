"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftOutlined, UserOutlined, CrownFilled,
  CopyOutlined, TrophyOutlined, ThunderboltFilled,
} from "@ant-design/icons";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import CodosseumLogo from "@/components/CodosseumLogo";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import styles from "@/styles/room.module.css";

interface RoomData {
  roomId: number;
  roomJoinCode: string;
  hostUserId: number;
  playerIds: number[];
  gameDifficulty: string;
  gameLanguage: string;
  gameMode: string;
  currentNumPlayers: number;
  maxNumPlayers: number;
}

const formatEnum = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const { value: token } = useLocalStorage("token", "");
  const { value: username } = useLocalStorage("username", "Player");
  const { value: userId } = useLocalStorage("userid", "");

  const [room, setRoom] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);
  const [hostUsername, setHostUsername] = useState<string | null>(null);
  const [player2Username, setPlayer2Username] = useState<string | null>(null);

  const fetchUsername = async (id: number): Promise<string> => {
    try {
      const res = await fetch(`${getApiDomain()}/users/${id}`, {
        headers: { "token": token },
      });
      if (!res.ok) return "Player";
      const data = await res.json();
      return data.username ?? "Player";
    } catch {
      return "Player";
    }
  };

  const fetchRoom = async () => {
    if (!token || !roomId) return;
    try {
      const res = await fetch(`${getApiDomain()}/rooms/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "userId": String(userId),
        },
      });

      if (!res.ok) {
        alert("Room not found");
        router.push("/menu");
        return;
      }

      const data: RoomData = await res.json();
      setRoom(data);

      const host = await fetchUsername(data.hostUserId);
      setHostUsername(host);

      if (data.currentNumPlayers >= 2) {
        const p2Id = data.playerIds.find(
          (id) => String(id) !== String(data.hostUserId)
        );
        if (p2Id) {
          const p2Name = await fetchUsername(p2Id);
          setPlayer2Username(p2Name);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load room");
      router.push("/menu");
    }
  };

  // 1. Initial room fetch
  useEffect(() => {
    if (!token || !roomId) return;
    fetchRoom();
  }, [token, roomId, userId]);

  // 2. WebSocket for live updates
  useEffect(() => {
    if (!token || !roomId) return;

    const wsUrl = getApiDomain()
      .replace("https://", "wss://")
      .replace("http://", "ws://") + "/ws";

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { token: token },

      onConnect: () => {
        console.log("✅ WebSocket connected!");

        // NOTE: backend broadcasts to /topic/room/{roomId} (singular), not /topic/rooms/
        client.subscribe(`/topic/room/${roomId}`, async (message: IMessage) => {
          console.log("📨 Room update received:", message.body);
          // Re-fetch full room data via REST — the WS payload is just a notification
          await fetchRoom();
        });
      },

      onStompError: (frame: IFrame) => {
        console.error("❌ WebSocket error:", frame);
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [token, roomId]);

  const handleCopy = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomJoinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.content}>
          <p style={{ color: "#6b7280", marginTop: 80 }}>Loading room...</p>
        </div>
      </div>
    );
  }

  const isCurrentUserHost = String(userId) === String(room.hostUserId);
  const bothReady = room.currentNumPlayers >= 2;

  return (
    <div className={styles.pageBackground}>
      <div className={styles.content}>

        <button className={styles.backButton} onClick={() => router.push("/menu")}>
          <ArrowLeftOutlined /> Leave Arena
        </button>

        <div className={styles.logoArea}>
          <CodosseumLogo size={52} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Battle Arena</h1>
            <p className={styles.logoSubtitle}>Prepare for combat</p>
          </div>
        </div>

        <div className={styles.sessionCodeBadge}>
          <span>Session Code: <strong>{room.roomJoinCode}</strong></span>
          <button className={styles.copyButton} onClick={handleCopy}>
            {copied ? "Copied!" : <CopyOutlined />}
          </button>
        </div>

        <div className={styles.playersCard}>
          <div className={styles.playersRow}>

            {/* Gladiator 1 — always the HOST */}
            <div className={styles.playerSection}>
              <div className={styles.avatarWrapper}>
                <div className={`${styles.avatar} ${styles.avatarBlue}`}>
                  <UserOutlined style={{ fontSize: 32, color: "white" }} />
                </div>
                <div className={styles.crownBadge}>
                  <CrownFilled style={{ color: "white", fontSize: 11 }} />
                </div>
                <div className={styles.onlineDot} />
              </div>
              <p className={styles.playerName}>
                {hostUsername ?? (isCurrentUserHost ? username : "Host")}
                {isCurrentUserHost && (
                  <span style={{
                    marginLeft: 8, background: "#EEF2FF", color: "#4361EE",
                    fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                  }}>You</span>
                )}
              </p>
              <p className={styles.playerRole}>Gladiator 1</p>
            </div>

            {/* VS */}
            <div className={styles.vsSection}>
              <div className={styles.vsCircle}>
                <ThunderboltFilled style={{ fontSize: 28, color: "white" }} />
              </div>
              <span className={styles.vsText}>VS</span>
            </div>

            {/* Gladiator 2 — the joining player */}
            <div className={styles.playerSection}>
              {bothReady ? (
                <>
                  <div className={styles.avatarWrapper}>
                    <div className={`${styles.avatar} ${styles.avatarPurple}`}>
                      <UserOutlined style={{ fontSize: 32, color: "white" }} />
                    </div>
                    <div className={styles.onlineDot} />
                  </div>
                  <p className={styles.playerName}>
                    {player2Username ?? (!isCurrentUserHost ? username : "Gladiator 2")}
                    {!isCurrentUserHost && (
                      <span style={{
                        marginLeft: 8, background: "#EEF2FF", color: "#4361EE",
                        fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                      }}>You</span>
                    )}
                  </p>
                  <p className={styles.playerRole}>Gladiator 2</p>
                </>
              ) : (
                <>
                  <div className={styles.avatarWrapper}>
                    <div className={`${styles.avatar} ${styles.avatarEmpty}`}>
                      <UserOutlined style={{ fontSize: 32, color: "#9CA3AF" }} />
                    </div>
                  </div>
                  <p className={styles.playerNameMuted}>Waiting...</p>
                  <p className={styles.playerRole}>Gladiator 2</p>
                </>
              )}
            </div>

          </div>

          <hr className={styles.divider} />

          <p className={styles.statusMessage}>
            {bothReady ? (
              <><TrophyOutlined style={{ marginRight: 6 }} />Both gladiators are ready! May the best coder win!</>
            ) : (
              "Waiting for opponent to join..."
            )}
          </p>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.configCard}>
            <h3 className={styles.configTitle}>
              <span className={styles.configDot} />
              Battle Configuration
            </h3>
            <div className={styles.configItems}>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Programming Language</span>
                <div className={styles.configValue}>{formatEnum(room.gameLanguage)}</div>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Difficulty Level</span>
                <div className={styles.configValue}>{formatEnum(room.gameDifficulty)}</div>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Game Mode</span>
                <div className={styles.configValue}>{formatEnum(room.gameMode)}</div>
              </div>
            </div>
          </div>

          <button
            className={styles.enterArenaButton}
            disabled={!bothReady}
            onClick={() => router.push("/arena")}
          >
            <ThunderboltFilled style={{ fontSize: 28 }} />
            <span>Enter Arena</span>
          </button>
        </div>

      </div>
    </div>
  );
}
