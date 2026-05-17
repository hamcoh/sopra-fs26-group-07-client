"use client";

import {useState, useEffect, useRef} from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftOutlined, UserOutlined, CrownFilled,
  CopyOutlined, TrophyOutlined, ThunderboltFilled, InfoCircleOutlined,
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

  const { value: token } = useLocalStorage("token", "");
  const { value: username } = useLocalStorage("username", "Player");
  const { value: userId } = useLocalStorage("userid", "");

  const [room, setRoom] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);
  const [hostUsername, setHostUsername] = useState<string | null>(null);
  const [player2Username, setPlayer2Username] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [showArcadeInfo, setShowArcadeInfo] = useState(false);

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
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
        localStorage.setItem("roomDifficulty", (data.gameDifficulty ?? "EASY"));
        localStorage.setItem("roomMode", (data.gameMode ?? "SPRINT_ARCADE"));
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

          if (lobbyAudioRef.current) {
            fadeOutAudio(lobbyAudioRef.current, 200, () => {
              const drums = new Audio("/sounds/DrumGameStart.mp3");
              drums.volume = 0.8;
              drums.play().catch(console.error);
            });
          }

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

        client.subscribe(`/topic/chat/room/${roomId}`, (message: IMessage) => {
          const msg: ChatMessage = JSON.parse(message.body);
          setChatMessages(prev => [...prev, msg]);
        });
      },

      onStompError: (frame: IFrame) => {
        console.error("WebSocket error:", frame);
      },
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
                  <span style={{
                    marginLeft: 8, background: "#EEF2FF", color: "#4361EE",
                    fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                  }}>You</span>
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
            <h3 className={styles.configTitle} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={styles.configDot} />
              Battle Configuration
              {room.gameMode.includes("ARCADE") && (
                <button
                  onClick={() => setShowArcadeInfo(true)}
                  style={{
                    background: "#ede9fe",
                    border: "1.5px solid #c4b5fd",
                    borderRadius: 20,
                    padding: "3px 10px 3px 8px",
                    cursor: "pointer",
                    color: "#7c3aed",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: 13 }} />
                  How does Arcade work?
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

        {/* CHAT */}
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
            <button className={styles.chatSendButton} onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>

        {/* ARCADE GAME MODE INFORMATION */}
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
                background: "#fff", borderRadius: 20, padding: 32, maxWidth: 500, width: "100%",
                boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxHeight: "85vh", overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>🎮 Arcade Mode</h2>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>Solve problems, earn coins, sabotage your opponent</p>
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

              <div style={{
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                borderRadius: 12, padding: "14px 16px", marginBottom: 24,
              }}>
                <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                  Every point you score earns you <strong>1 coin</strong>. Spend your coins in the
                  <strong> Item Shop</strong> during the game to buy sabotage items that disrupt your opponent!
                </p>
              </div>

              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Item Shop</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div style={{
                  border: "1.5px solid #ede9fe", borderRadius: 14, padding: 16,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 72, height: 52, borderRadius: 10, background: "#1a1a2e",
                    flexShrink: 0, overflow: "hidden", position: "relative", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(8,2,25,0.97)",
                      animation: "inkSplat 1.5s ease-in-out infinite",
                    }} />
                    <span style={{ position: "relative", fontSize: 22, zIndex: 1 }}>🦑</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Squid Ink</span>
                      <span style={{
                        background: "#fef9c3", color: "#854d0e", fontSize: 12,
                        fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      }}>🪙 5 coins</span>
                      <span style={{
                        background: "#f1f5f9", color: "#64748b", fontSize: 11,
                        fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      }}>10s</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                      Blacks out your opponent&apos;s entire screen with ink. They can&apos;t see a thing!
                    </p>
                  </div>
                </div>

                <div style={{
                  border: "1.5px solid #fef3c7", borderRadius: 14, padding: 16,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 72, height: 52, borderRadius: 10, background: "#fffbeb",
                    border: "1.5px solid #fde68a", flexShrink: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    animation: "quakeDemo 0.15s linear infinite",
                  }}>
                    <span style={{ fontSize: 26 }}>⚡</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Earthquake</span>
                      <span style={{
                        background: "#fef9c3", color: "#854d0e", fontSize: 12,
                        fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      }}>🪙 5 coins</span>
                      <span style={{
                        background: "#f1f5f9", color: "#64748b", fontSize: 11,
                        fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      }}>10s</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                      Makes your opponent&apos;s game area shake violently. Good luck typing like that!
                    </p>
                  </div>
                </div>

                <div style={{
                  border: "1.5px solid #cffafe", borderRadius: 14, padding: 16,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 72, height: 52, borderRadius: 10, background: "#ecfeff",
                    border: "1.5px solid #a5f3fc", flexShrink: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    animation: "flipDemo 3s ease-in-out infinite",
                  }}>
                    <span style={{ fontSize: 26 }}>🌀</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Flip Screen</span>
                      <span style={{
                        background: "#fef9c3", color: "#854d0e", fontSize: 12,
                        fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      }}>🪙 5 coins</span>
                      <span style={{
                        background: "#f1f5f9", color: "#64748b", fontSize: 11,
                        fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      }}>10s</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                      Rotates your opponent&apos;s entire game view 180°. Everything is upside down!
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
    </div>
  );
}