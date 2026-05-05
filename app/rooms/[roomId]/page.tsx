"use client";

import {useState, useEffect, useRef} from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftOutlined, UserOutlined, CrownFilled,
  CopyOutlined, TrophyOutlined, ThunderboltFilled,
} from "@ant-design/icons";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import CodosseumLogo from "@/components/CodosseumLogo";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import styles from "@/styles/room.module.css";
import LoadingScreen from "@/components/LoadingScreen";
import CodosseumAvatar from "@/components/CodosseumAvatar";

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
  const [isStarting, setIsStarting] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);

  const [hostAvatarId, setHostAvatarId] = useState<number | null>(null);
  const hostAvatarIdRef = useRef<number | null>(null);
  const [player2AvatarId, setPlayer2AvatarId] = useState<number | null>(null);
  const player2AvatarIdRef = useRef<number | null>(null);

  const hostUsernameRef = useRef<string | null>(null);
  const player2UsernameRef = useRef<string | null>(null);
  const isHostRef = useRef(false);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    hostUsernameRef.current = hostUsername;
  }, [hostUsername]);

  useEffect(() => {
    player2UsernameRef.current = player2Username;
  }, [player2Username]);

  useEffect(() => {
    isHostRef.current = String(userId) === String(room?.hostUserId);
  }, [userId, room]);

  useEffect(() => {
    hostAvatarIdRef.current = hostAvatarId;
  }, [hostAvatarId]);

  useEffect(() => {
    player2AvatarIdRef.current = player2AvatarId;
  }, [player2AvatarId]);

  const fetchUsername = async (
      id: number
  ): Promise<{ username: string; avatarId: number }> => {
    try {
      const res = await fetch(`${getApiDomain()}/users/${id}`, {
        headers: { "token": token },
      });
      if (!res.ok) return { username: "Player", avatarId: 1 };

      const data = await res.json();
      return {
        username: data.username ?? "Player",
        avatarId: data.avatarId ?? 1,
      };
    } catch {
      return { username: "Player", avatarId: 1 };
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
      if (typeof window !== "undefined") {
        localStorage.setItem("roomLanguage", (data.gameLanguage ?? "PYTHON").toLowerCase());
      }

      const host = await fetchUsername(data.hostUserId);
      setHostUsername(host.username);
      setHostAvatarId(host.avatarId);

      if (data.currentNumPlayers >= 2) {
        const p2Id = data.playerIds.find(
          (id) => String(id) !== String(data.hostUserId)
        );
        if (p2Id) {
          const p2 = await fetchUsername(p2Id);
          setPlayer2Username(p2.username);
          setPlayer2AvatarId(p2.avatarId);
        }
      } else {
        setPlayer2Username(null);
        setPlayer2AvatarId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load room");
      router.push("/menu");
    }
  };

  const handleStartGame = async () => {
    try {
      const res = await fetch(`${getApiDomain()}/rooms/${roomId}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "hostId": String(userId),
        },
      });
      if (!res.ok) throw new Error("Failed to start game");
    } catch (err) {
      console.error(err);
      alert("Failed to start game");
    }
  };

  const handleLeaveRoom = async () => {
    isLeavingRef.current = true;
    try {
      await fetch(`${getApiDomain()}/rooms/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "userId": String(userId),
        },
      });
    } catch (err) {
      console.error("Failed to leave room:", err);
    }
    router.push("/rooms");
  };

  // 1. Initial room fetch
  useEffect(() => {
    if (!token || !roomId) return;
    fetchRoom();
  }, [token, roomId, userId]);

  // 2. WebSocket for live updates
  useEffect(() => {
    if (!token || !roomId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      connectHeaders: { token: token },

      onConnect: () => {
        console.log("WebSocket connected!");

        client.subscribe(`/topic/room/${roomId}`, async (message: IMessage) => {
          console.log("Room update received:", message.body);

          if (isLeavingRef.current) return;

          const parsed = JSON.parse(message.body);

          if (parsed.type === "ROOM_CLOSED") {
            setHostLeft(true);
            setTimeout(() => router.push("/menu"), 3000);
          } else if (parsed.type === "PLAYER_LEFT") {
            await fetchRoom();
          } else {
            await fetchRoom();
          }
        });

        client.subscribe(`/user/queue/game-start`, (message: IMessage) => {
          setIsStarting(true);
          const gameData = JSON.parse(message.body);
          console.log("Game started:", gameData);
          const isHost = isHostRef.current;

          const opponentName = isHost
              ? player2UsernameRef.current
              : hostUsernameRef.current;

          const opponentAvatarId = isHost
              ? player2AvatarIdRef.current
              : hostAvatarIdRef.current;

          const playerAvatarId = isHost
              ? hostAvatarIdRef.current
              : player2AvatarIdRef.current;

          const gameLanguage =
            typeof window !== "undefined"
              ? (localStorage.getItem("roomLanguage") ?? "python")
              : "python";
          localStorage.setItem(
            "gameRoundData",
            JSON.stringify({
              ...gameData,
              gameLanguage,
              opponentName: opponentName ?? "Opponent",
              opponentAvatarId: opponentAvatarId ?? 1,
              playerAvatarId: playerAvatarId ?? 1,
            })
          );
          setTimeout(() => {
            router.push(`/games/${gameData.gameSessionId}`);
          }, 3000);
        });
      },

      onStompError: (frame: IFrame) => {
        console.error("WebSocket error:", frame);
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

  if (isStarting) {
    return <LoadingScreen />;
  }

  if (hostLeft) {
    return (
      <div className={styles.pageBackground}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "16px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48 }}>🚪</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
            The host has left the arena
          </h2>
          <p style={{ color: "#6b7280", margin: 0 }}>
            The room has been closed. Redirecting you to the menu...
          </p>
        </div>
      </div>
    );
  }

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

        <button className={styles.backButton} onClick={handleLeaveRoom}>
          <ArrowLeftOutlined /> Leave Arena
        </button>

        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
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
                  <CodosseumAvatar id={hostAvatarId ?? 1} size={64} variant="room"/>
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
                      <CodosseumAvatar id={player2AvatarId ?? 1} size={64} variant="room"/>
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
            disabled={!bothReady || !isCurrentUserHost}
            onClick={handleStartGame}
          >
            <ThunderboltFilled style={{ fontSize: 28 }} />
            <span>Enter Arena</span>
          </button>
        </div>

      </div>
    </div>
  );
}