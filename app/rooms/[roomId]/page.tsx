"use client";

import {useState, useEffect, useRef} from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftOutlined, UserOutlined, CrownFilled,
  CopyOutlined, TrophyOutlined, ThunderboltFilled, InfoCircleOutlined,
} from "@ant-design/icons";
import { notification } from "antd";
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
  numOfProblems: number | null;
}

interface ChatMessage {
  senderUsername: string;
  content: string;
  timestamp: string;
}

const formatEnum = (value: string) =>
  value.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

const fadeOutAudio = (audio: HTMLAudioElement, durationMs: number, onComplete?: () => void) => {
  const steps = 30;
  const stepTime = durationMs / steps;
  const volumeStep = audio.volume / steps;
  const interval = setInterval(() => {
    if (audio.volume > volumeStep) {
      audio.volume = Math.max(0, audio.volume - volumeStep);
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(interval);
      onComplete?.();
    }
  }, stepTime);
};

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
  const { value: username } = useLocalStorage("username", "Player");
  const { value: userId, loading: userIdLoading } = useLocalStorage("userid", "");

  const [room, setRoom] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);
  const [hostUsername, setHostUsername] = useState<string | null>(null);
  const [player2Username, setPlayer2Username] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [showArcadeInfo, setShowArcadeInfo] = useState(false);
  const [showSprintInfo, setShowSprintInfo] = useState(false);

  const [hostAvatarId, setHostAvatarId] = useState<number | null>(null);
  const hostAvatarIdRef = useRef<number | null>(null);
  const [player2AvatarId, setPlayer2AvatarId] = useState<number | null>(null);
  const player2AvatarIdRef = useRef<number | null>(null);

  const hostUsernameRef = useRef<string | null>(null);
  const player2UsernameRef = useRef<string | null>(null);
  const isHostRef = useRef(false);
  const isLeavingRef = useRef(false);

  const lobbyAudioRef = useRef<HTMLAudioElement | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  useEffect(() => { hostUsernameRef.current = hostUsername; }, [hostUsername]);
  useEffect(() => { player2UsernameRef.current = player2Username; }, [player2Username]);
  useEffect(() => { isHostRef.current = String(userId) === String(room?.hostUserId); }, [userId, room]);
  useEffect(() => { hostAvatarIdRef.current = hostAvatarId; }, [hostAvatarId]);
  useEffect(() => { player2AvatarIdRef.current = player2AvatarId; }, [player2AvatarId]);

  // Auth guard — redirect unauthenticated users to login
  useEffect(() => {
    if (tokenLoading || userIdLoading) return;
    if (!token || !userId) {
      router.replace("/login");
    }
  }, [token, userId, tokenLoading, userIdLoading, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/sounds/LobbyTheme.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    lobbyAudioRef.current = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const unlock = () => { audio.play(); };
        document.addEventListener("click", unlock, { once: true });
      });
    }
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchUsername = async (id: number): Promise<{ username: string; avatarId: number }> => {
    try {
      const res = await fetch(`${getApiDomain()}/users/${id}`, { headers: { "token": token } });
      if (!res.ok) return { username: "Player", avatarId: 1 };
      const data = await res.json();
      return { username: data.username ?? "Player", avatarId: data.avatarId ?? 1 };
    } catch {
      return { username: "Player", avatarId: 1 };
    }
  };

  const fetchRoom = async () => {
    if (!token || !roomId) return;
    try {
      const res = await fetch(`${getApiDomain()}/rooms/${roomId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "token": token, "userId": String(userId) },
      });
      if (!res.ok) {
        notificationApi.error({ title: "Room not found", description: "This room no longer exists.", duration: 4, placement: "top" });
        router.push("/menu");
        return;
      }
      const data: RoomData = await res.json();
      // Redirect if the current user is not a participant in this room
      if (userId && !data.playerIds.map(String).includes(String(userId))) {
        router.push("/menu");
        return;
      }
      setRoom(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("roomLanguage", (data.gameLanguage ?? "PYTHON").toLowerCase());
        localStorage.setItem("roomDifficulty", (data.gameDifficulty ?? "EASY"));
        localStorage.setItem("roomMode", (data.gameMode ?? "SPRINT_ARCADE"));
      }
      const host = await fetchUsername(data.hostUserId);
      setHostUsername(host.username);
      setHostAvatarId(host.avatarId);
      if (data.currentNumPlayers >= 2) {
        const p2Id = data.playerIds.find((id) => String(id) !== String(data.hostUserId));
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
      notificationApi.error({ title: "Failed to load room", description: "Could not connect to the room. Returning to menu.", duration: 4, placement: "top" });
      router.push("/menu");
    }
  };

  const handleStartGame = async () => {
    try {
      const res = await fetch(`${getApiDomain()}/rooms/${roomId}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": token, "hostId": String(userId) },
      });
      if (!res.ok) throw new Error("Failed to start game");
    } catch (err) {
      console.error(err);
      notificationApi.error({ title: "Failed to start game", description: "Something went wrong. Please try again.", duration: 4, placement: "top" });
    }
  };

  const handleLeaveRoom = async () => {
    isLeavingRef.current = true;
    try {
      await fetch(`${getApiDomain()}/rooms/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": token, "userId": String(userId) },
      });
    } catch (err) {
      console.error("Failed to leave room:", err);
    }
    router.push("/rooms");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !stompClientRef.current?.active) return;
    stompClientRef.current.publish({
      destination: `/app/room/${roomId}/send`,
      body: JSON.stringify({ senderUsername: username, content: chatInput.trim() }),
    });
    setChatInput("");
  };

  useEffect(() => {
    if (!token || !roomId) return;
    fetchRoom();
  }, [token, roomId, userId]);

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
          // Clear any stale game results from previous sessions
          Object.keys(localStorage)
            .filter(k => k.startsWith("gameResult_"))
            .forEach(k => localStorage.removeItem(k));
          if (lobbyAudioRef.current) {
            fadeOutAudio(lobbyAudioRef.current, 200, () => {
              const drums = new Audio("/sounds/DrumGameStart.mp3");
              drums.volume = 0.8;
              drums.play().catch(console.error);
            });
          }
          console.log("Game started:", gameData);
          const isHost = isHostRef.current;
          const opponentName = isHost ? player2UsernameRef.current : hostUsernameRef.current;
          const opponentAvatarId = isHost ? player2AvatarIdRef.current : hostAvatarIdRef.current;
          const playerAvatarId = isHost ? hostAvatarIdRef.current : player2AvatarIdRef.current;
          const gameLanguage = typeof window !== "undefined" ? (localStorage.getItem("roomLanguage") ?? "python") : "python";
          localStorage.setItem("gameRoundData", JSON.stringify({
            ...gameData,
            gameLanguage,
            opponentName: opponentName ?? "Opponent",
            opponentAvatarId: opponentAvatarId ?? 1,
            playerAvatarId: playerAvatarId ?? 1,
          }));
          setTimeout(() => { router.push(`/games/${gameData.gameSessionId}`); }, 3000);
        });
        client.subscribe(`/topic/chat/room/${roomId}`, (message: IMessage) => {
          const msg: ChatMessage = JSON.parse(message.body);
          setChatMessages(prev => [...prev, msg]);
        });
      },
      onStompError: (frame: IFrame) => { console.error("WebSocket error:", frame); },
    });
    stompClientRef.current = client;
    client.activate();
    return () => { client.deactivate(); };
  }, [token, roomId]);

  const handleCopy = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomJoinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tokenLoading || userIdLoading || !token || !userId) return null;

  if (isStarting) return <LoadingScreen />;

  if (hostLeft) {
    return (
      <div className={styles.pageBackground}>
        {notificationContextHolder}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "16px", textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🚪</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e", margin: 0 }}>The host has left the arena</h2>
          <p style={{ color: "#6b7280", margin: 0 }}>The room has been closed. Redirecting you to the menu...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={styles.pageBackground}>
        {notificationContextHolder}
        <div className={styles.content}>
          <p style={{ color: "#6b7280", marginTop: 80 }}>Loading room...</p>
        </div>
      </div>
    );
  }

  const isCurrentUserHost = String(userId) === String(room.hostUserId);
  const bothReady = room.currentNumPlayers >= 2;
  const isArcadeMode = room.gameMode.includes("ARCADE");

  return (
    <div className={styles.pageBackground}>
      {notificationContextHolder}
      <div className={`${styles.content} ${styles.animContent}`}>

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
                  <span style={{ marginLeft: 8, background: "#EEF2FF", color: "#4361EE", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>You</span>
                )}
              </p>
              <p className={styles.playerRole}>Gladiator 1</p>
            </div>

            <div className={styles.vsSection}>
              <div className={styles.vsCircle}>
                <ThunderboltFilled style={{ fontSize: 28, color: "white" }} />
              </div>
              <span className={styles.vsText}>VS</span>
            </div>

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
                      <span style={{ marginLeft: 8, background: "#EEF2FF", color: "#4361EE", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>You</span>
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
            <h3 className={styles.configTitle} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={styles.configDot} />
              Battle Configuration

              {/* Arcade info button */}
              {isArcadeMode && (
                <button
                  onClick={() => setShowArcadeInfo(true)}
                  style={{
                    background: "#ede9fe", border: "1.5px solid #c4b5fd", borderRadius: 20,
                    padding: "3px 10px 3px 8px", cursor: "pointer", color: "#7c3aed",
                    fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center",
                    gap: 5, flexShrink: 0, whiteSpace: "nowrap",
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: 13 }} />
                  How does Sprint Arcade work?
                </button>
              )}

              {/* Sprint Classic info button */}
              {!isArcadeMode && (
                <button
                  onClick={() => setShowSprintInfo(true)}
                  style={{
                    background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 20,
                    padding: "3px 10px 3px 8px", cursor: "pointer", color: "#2563eb",
                    fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center",
                    gap: 5, flexShrink: 0, whiteSpace: "nowrap",
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: 13 }} />
                  How does Sprint Classic work?
                </button>
              )}
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
              {room.numOfProblems != null && (
                <div className={styles.configItem}>
                  <span className={styles.configLabel}>Number of Problems</span>
                  <div className={styles.configValue}>{room.numOfProblems}</div>
                </div>
              )}
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

        {/* CHAT — only shown once both players are in the room */}
        {bothReady && (
          <div className={styles.chatCard}>
            <h3 className={styles.configTitle}>
              <span className={styles.configDot} style={{ background: "#22c55e" }} />
              Arena Chat
            </h3>
            <div className={styles.chatMessages}>
              {chatMessages.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", margin: "auto 0" }}>
                  No messages yet. Say hello! 👋
                </p>
              )}
              {chatMessages.map((msg, i) => {
                const isMe = msg.senderUsername === username;
                const avatarId = msg.senderUsername === hostUsername ? hostAvatarId : player2AvatarId;
                return (
                  <div key={i} className={`${styles.chatMessage} ${isMe ? styles.chatMessageMe : ""}`}>
                    {!isMe && (
                      <div className={styles.chatAvatar}>
                        <CodosseumAvatar id={avatarId ?? 1} size={32} variant="room" />
                      </div>
                    )}
                    <div className={styles.chatBubbleGroup}>
                      {!isMe && <span className={styles.chatSenderName}>{msg.senderUsername}</span>}
                      <div className={`${styles.chatBubble} ${isMe ? styles.chatBubbleMe : styles.chatBubbleOther}`}>
                        {msg.content}
                      </div>
                    </div>
                    {isMe && (
                      <div className={styles.chatAvatar}>
                        <CodosseumAvatar id={avatarId ?? 1} size={32} variant="room" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className={styles.chatInputRow}>
              <input
                className={styles.chatInput}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                maxLength={255}
              />
              <button className={styles.chatSendButton} onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}

      </div>

      {/* ── SPRINT CLASSIC INFO MODAL ── */}
      {showSprintInfo && (
        <div
          onClick={() => setShowSprintInfo(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 20, padding: 32, maxWidth: 520, width: "100%",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxHeight: "85vh", overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>⚡ Sprint Classic</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>Race to solve all problems before time runs out</p>
              </div>
              <button
                onClick={() => setShowSprintInfo(false)}
                style={{
                  background: "#f1f5f9", border: "none", borderRadius: 8,
                  width: 32, height: 32, cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >✕</button>
            </div>

            {/* Mini game UI illustration */}
            <div style={{
              background: "#f8fafc", borderRadius: 12, padding: 12,
              marginBottom: 20, border: "1.5px solid #e2e8f0",
              boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
            }}>
              {/* Top bar: avatar + player name | YOU badge */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 9, padding: "5px 9px",
                background: "white", borderRadius: 8,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4361EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12 }}>👤</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#1a1a2e", width: 52, opacity: 0.65 }} />
                </div>
                <div style={{ background: "#EEF2FF", color: "#4361EE", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.05em" }}>YOU</div>
              </div>

              {/* Bottom: problem panel | code editor */}
              <div style={{ display: "flex", gap: 8 }}>
                {/* Problem panel */}
                <div style={{ flex: 1, background: "white", borderRadius: 8, padding: "9px 11px", display: "flex", flexDirection: "column", gap: 4, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#1a1a2e", marginBottom: 3, letterSpacing: "0.06em" }}>Problem Description</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                    <div style={{ height: 9, borderRadius: 5, background: "#dcfce7", padding: "0 5px", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 6, color: "#16a34a", fontWeight: 700 }}>Easy</span>
                    </div>
                    <div style={{ height: 9, borderRadius: 5, background: "#dbeafe", padding: "0 5px", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 6, color: "#2563eb", fontWeight: 700 }}>Python</span>
                    </div>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "92%" }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "76%" }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "60%" }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "84%" }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "50%" }} />
                </div>

                {/* Code editor panel */}
                <div style={{ flex: 1.4, background: "white", borderRadius: 8, padding: "9px 11px", display: "flex", flexDirection: "column", gap: 3, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#1a1a2e", marginBottom: 3, letterSpacing: "0.06em" }}>Code Editor</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <div style={{ height: 4, borderRadius: 2, background: "#7c3aed", width: 22 }} />
                    <div style={{ height: 4, borderRadius: 2, background: "#4361EE", width: 34 }} />
                    <div style={{ height: 4, borderRadius: 2, background: "#ec4899", width: 18 }} />
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "88%", marginLeft: 8 }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "62%", marginLeft: 8 }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "74%", marginLeft: 14 }} />
                  <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "50%", marginLeft: 10 }} />
                  <div style={{ display: "flex", gap: 5, marginTop: 6, justifyContent: "flex-end" }}>
                    <div style={{ height: 14, borderRadius: 4, background: "#334155", padding: "0 7px", display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 7, color: "#94a3b8", fontWeight: 700 }}>▶ Run</span>
                    </div>
                    <div style={{ height: 14, borderRadius: 4, background: "#16a34a", padding: "0 7px", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 7, color: "#fff", fontWeight: 700 }}>Submit ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <div style={{ border: "1.5px solid #dbeafe", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: "#eff6ff", border: "1.5px solid #bfdbfe", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24 }}>⏱️</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 3 }}>15-Minute Time Limit</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                    Each player has up to <strong>15 minutes</strong> to solve all problems. The clock starts the moment the game begins.
                  </p>
                </div>
              </div>

              <div style={{ border: "1.5px solid #d1fae5", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: "#ecfdf5", border: "1.5px solid #6ee7b7", flexShrink: 0, display: "flex", flexDirection: "column", gap: 3, alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14 }}>💻</span>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#059669", textAlign: "center", lineHeight: 1.2 }}>Run &amp; Submit</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 3 }}>The Code Editor</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                    <strong>Run</strong> your code as many times as you like to check test results and grab a <strong>Hint</strong> if you&apos;re stuck. When you&apos;re confident, hit <strong>Submit</strong> — you only get <strong>one submission per problem</strong>, so make it count!
                  </p>
                </div>
              </div>

              <div style={{ border: "1.5px solid #fef9c3", borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  🏅 Scoring
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: "#dcfce7", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", flexShrink: 0 }}>5 pts</div>
                    <span style={{ fontSize: 13, color: "#374151" }}>All test cases pass ✅ — full points</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: "#fef3c7", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 800, color: "#92400e", flexShrink: 0 }}>partial</div>
                    <span style={{ fontSize: 13, color: "#374151" }}>Some test cases pass — partial points awarded</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: "#fee2e2", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 800, color: "#dc2626", flexShrink: 0 }}>0 pts</div>
                    <span style={{ fontSize: 13, color: "#374151" }}>No test cases pass — no points</span>
                  </div>
                </div>
              </div>

              <div style={{ border: "1.5px solid #ede9fe", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f5f3ff", border: "1.5px solid #ddd6fe", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24 }}>🏆</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 3 }}>Winning</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                    The player who submits all problems and collects the <strong>most points wins</strong>. If time runs out, whoever has more points takes the glory!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── ARCADE INFO MODAL ── */}
      {showArcadeInfo && (
        <div
          onClick={() => setShowArcadeInfo(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <style>{`
            @keyframes inkSplat { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
            @keyframes quakeDemo { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-5px,3px)} 40%{transform:translate(5px,-4px)} 60%{transform:translate(-4px,5px)} 80%{transform:translate(4px,-3px)} }
            @keyframes flipDemo { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(180deg)} }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 20, padding: 32, maxWidth: 860, width: "100%",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxHeight: "85vh", overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>🎮 Sprint Arcade</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>All the sprint rules — plus coins, sabotage, and chaos</p>
              </div>
              <button
                onClick={() => setShowArcadeInfo(false)}
                style={{
                  background: "#f1f5f9", border: "none", borderRadius: 8,
                  width: 32, height: 32, cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >✕</button>
            </div>

            {/* Two-column layout */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

              {/* LEFT: Sprint Classic rules */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#4361EE", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 3, height: 14, background: "#4361EE", borderRadius: 2 }} />
                  Sprint Rules
                </div>

                {/* Mini game UI illustration */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 2px 14px rgba(0,0,0,0.08)" }}>
                  {/* Top bar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9, padding: "5px 9px", background: "white", borderRadius: 8, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#4361EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10 }}>👤</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 3, background: "#1a1a2e", width: 40, opacity: 0.65 }} />
                    </div>
                    <div style={{ background: "#EEF2FF", color: "#4361EE", fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 5 }}>YOU</div>
                  </div>
                  {/* Problem + Editor panels */}
                  <div style={{ display: "flex", gap: 7 }}>
                    <div style={{ flex: 1, background: "white", borderRadius: 8, padding: "8px 9px", display: "flex", flexDirection: "column", gap: 3, border: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#1a1a2e", marginBottom: 3 }}>Problem Description</div>
                      <div style={{ display: "flex", gap: 3, marginBottom: 2 }}>
                        <div style={{ height: 8, borderRadius: 4, background: "#dcfce7", padding: "0 4px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 5, color: "#16a34a", fontWeight: 700 }}>Easy</span></div>
                        <div style={{ height: 8, borderRadius: 4, background: "#dbeafe", padding: "0 4px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 5, color: "#2563eb", fontWeight: 700 }}>Python</span></div>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "90%" }} />
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "74%" }} />
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "58%" }} />
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "82%" }} />
                    </div>
                    <div style={{ flex: 1.3, background: "white", borderRadius: 8, padding: "8px 9px", display: "flex", flexDirection: "column", gap: 3, border: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#1a1a2e", marginBottom: 3 }}>Code Editor</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <div style={{ height: 3, borderRadius: 2, background: "#7c3aed", width: 18 }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#4361EE", width: 28 }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#ec4899", width: 14 }} />
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "85%", marginLeft: 7 }} />
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "60%", marginLeft: 7 }} />
                      <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "72%", marginLeft: 12 }} />
                      <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
                        <div style={{ height: 12, borderRadius: 3, background: "#334155", padding: "0 5px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 6, color: "#94a3b8", fontWeight: 700 }}>▶ Run</span></div>
                        <div style={{ height: 12, borderRadius: 3, background: "#16a34a", padding: "0 5px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 6, color: "#fff", fontWeight: 700 }}>Submit ✓</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                  <div style={{ border: "1.5px solid #dbeafe", borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", border: "1.5px solid #bfdbfe", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 20 }}>⏱️</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", marginBottom: 2 }}>15-Minute Time Limit</div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                        Each player has up to <strong>15 minutes</strong> to solve all problems. The clock starts when the game begins.
                      </p>
                    </div>
                  </div>

                  <div style={{ border: "1.5px solid #d1fae5", borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ecfdf5", border: "1.5px solid #6ee7b7", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13 }}>💻</span>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#059669", textAlign: "center", lineHeight: 1.2 }}>Run &amp; Submit</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", marginBottom: 2 }}>The Code Editor</div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                        <strong>Run</strong> as many times as you need and grab a <strong>Hint</strong> if stuck. You only get <strong>one submission per problem</strong> — so make sure you&apos;re ready before you hit Submit!
                      </p>
                    </div>
                  </div>

                  <div style={{ border: "1.5px solid #fef9c3", borderRadius: 14, padding: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      🏅 Scoring
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ background: "#dcfce7", borderRadius: 7, padding: "3px 9px", fontSize: 12, fontWeight: 800, color: "#16a34a", flexShrink: 0 }}>5 pts</div>
                        <span style={{ fontSize: 12, color: "#374151" }}>All test cases pass — full points</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ background: "#fef3c7", borderRadius: 7, padding: "3px 9px", fontSize: 12, fontWeight: 800, color: "#92400e", flexShrink: 0 }}>partial</div>
                        <span style={{ fontSize: 12, color: "#374151" }}>Some pass — partial points awarded</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ background: "#fee2e2", borderRadius: 7, padding: "3px 9px", fontSize: 12, fontWeight: 800, color: "#dc2626", flexShrink: 0 }}>0 pts</div>
                        <span style={{ fontSize: 12, color: "#374151" }}>No test cases pass — no points</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: "1.5px solid #ede9fe", borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f5f3ff", border: "1.5px solid #ddd6fe", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 20 }}>🏆</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", marginBottom: 2 }}>Winning</div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                        Most points wins. If time runs out, whoever scored more takes the glory!
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Vertical divider */}
              <div style={{ width: 1, alignSelf: "stretch", background: "#e5e7eb", flexShrink: 0 }} />

              {/* RIGHT: Item Shop */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 3, height: 14, background: "#7c3aed", borderRadius: 2 }} />
                  Arcade Extras
                </div>

                {/* Mini item shop illustration */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 2px 14px rgba(0,0,0,0.08)" }}>
                  {/* Shop header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9, padding: "5px 9px", background: "white", borderRadius: 8, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#1a1a2e" }}>Item Shop</div>
                    <div style={{ background: "#fef9c3", borderRadius: 6, padding: "2px 7px", display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 9 }}>🪙</span>
                      <span style={{ fontSize: 8, fontWeight: 800, color: "#854d0e" }}>0</span>
                    </div>
                  </div>
                  {/* Three item cards */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* Squid Ink */}
                    <div style={{ flex: 1, background: "white", borderRadius: 8, border: "1.5px solid #ede9fe", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ background: "#2d1b69", padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 12 }}>🦑</span>
                        </div>
                      </div>
                      <div style={{ padding: "5px 7px", display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ height: 4, borderRadius: 2, background: "#1a1a2e", width: "65%", opacity: 0.75 }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "90%" }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "72%" }} />
                      </div>
                      <div style={{ background: "#e2e8f0", margin: "5px 7px 7px", borderRadius: 4, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9 }}>🔒</span>
                      </div>
                    </div>
                    {/* Earthquake */}
                    <div style={{ flex: 1, background: "white", borderRadius: 8, border: "1.5px solid #fef3c7", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ background: "#fffbeb", padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 12 }}>⚡</span>
                        </div>
                      </div>
                      <div style={{ padding: "5px 7px", display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ height: 4, borderRadius: 2, background: "#1a1a2e", width: "65%", opacity: 0.75 }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "90%" }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "72%" }} />
                      </div>
                      <div style={{ background: "#e2e8f0", margin: "5px 7px 7px", borderRadius: 4, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9 }}>🔒</span>
                      </div>
                    </div>
                    {/* Flip Screen */}
                    <div style={{ flex: 1, background: "white", borderRadius: 8, border: "1.5px solid #cffafe", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ background: "#ecfeff", padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 12 }}>🌀</span>
                        </div>
                      </div>
                      <div style={{ padding: "5px 7px", display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ height: 4, borderRadius: 2, background: "#1a1a2e", width: "65%", opacity: 0.75 }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "90%" }} />
                        <div style={{ height: 3, borderRadius: 2, background: "#e2e8f0", width: "72%" }} />
                      </div>
                      <div style={{ background: "#e2e8f0", margin: "5px 7px 7px", borderRadius: 4, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9 }}>🔒</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", marginBottom: 6 }}>🛒 Item Shop</div>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                  Every point you score earns you <strong style={{ color: "#854d0e" }}>🪙 1 coin</strong>. Spend them on sabotage items to disrupt your opponent. Coins are only valid for the current game — any unspent coins vanish when the match ends.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  <div style={{ border: "1.5px solid #ede9fe", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 60, height: 46, borderRadius: 10, background: "#1a1a2e", flexShrink: 0, overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: 0, background: "rgba(8,2,25,0.97)", animation: "inkSplat 1.5s ease-in-out infinite" }} />
                      <span style={{ position: "relative", fontSize: 20, zIndex: 1 }}>🦑</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>Squid Ink</span>
                        <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6 }}>🪙 5 coins</span>
                        <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>10s</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Blacks out your opponent&apos;s screen. They can&apos;t see a thing!</p>
                    </div>
                  </div>

                  <div style={{ border: "1.5px solid #fef3c7", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 60, height: 46, borderRadius: 10, background: "#fffbeb", border: "1.5px solid #fde68a", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "quakeDemo 0.15s linear infinite" }}>
                      <span style={{ fontSize: 22 }}>⚡</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>Earthquake</span>
                        <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6 }}>🪙 5 coins</span>
                        <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>10s</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Makes your opponent&apos;s game shake violently. Good luck typing!</p>
                    </div>
                  </div>

                  <div style={{ border: "1.5px solid #cffafe", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 60, height: 46, borderRadius: 10, background: "#ecfeff", border: "1.5px solid #a5f3fc", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "flipDemo 3s ease-in-out infinite" }}>
                      <span style={{ fontSize: 22 }}>🌀</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>Flip Screen</span>
                        <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6 }}>🪙 5 coins</span>
                        <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>10s</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Rotates your opponent&apos;s view 180°. Everything is upside down!</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
