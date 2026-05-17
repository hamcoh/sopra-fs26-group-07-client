import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { getApiDomain } from "@/utils/domain";
import { GameEndDTO, PlayerGameSummaryDTO } from "../_types";

type PlayersMap = Record<string, { username: string; score: number }>;

const ENUM_TO_EFFECT: Record<string, string> = {
  SQUID_INK_SABOTAGE: "ink",
  JITTER_SABOTAGE: "jitter",
  ROTATE_SABOTAGE: "rotate",
};

const SABOTAGE_DURATION_MS = 10_000;

export function useGameWebSocket(
  gameSessionId: string,
  token: string,
  userId: string,
  playerSessionId: number | null,
  setPlayers: (updater: (prev: PlayersMap) => PlayersMap) => void,
) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameEndData, setGameEndData] = useState<GameEndDTO | null>(null);
  const [gameSummary, setGameSummary] = useState<PlayerGameSummaryDTO | null>(null);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
  const [sabotageNotification, setSabotageNotification] = useState<string | null>(null);
  const audioWin  = useRef(typeof window !== "undefined" ? new Audio("/sounds/winSound.mp3") : null);
  const audioDraw = useRef(typeof window !== "undefined" ? new Audio("/sounds/tieSound.mp3") : null);
  const audioLose = useRef(typeof window !== "undefined" ? new Audio("/sounds/loseSound.mp3"): null);

  const playerSessionIdRef = useRef(playerSessionId);
  useEffect(() => { playerSessionIdRef.current = playerSessionId; }, [playerSessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !token || !gameSessionId || !userId || userId === "") return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      connectHeaders: { token },
      onConnect: () => {
        console.log("Connected to Game WebSockets as user:", userId);

        client.subscribe(`/topic/game/${gameSessionId}/points-update`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          const incomingSessionId = Number(data.playerSessionId);
          if (incomingSessionId === playerSessionIdRef.current) {
            setPlayers(prev => ({
              ...prev,
              [String(userId)]: { ...prev[String(userId)], score: data.currentScore },
            }));
          } else {
            setPlayers(prev => {
              const entry = Object.entries(prev).find(([id]) => id !== String(userId));
              const opponentId = entry ? entry[0] : "opponent";
              return { ...prev, [opponentId]: { ...prev[opponentId], score: data.currentScore } };
            });
          }
        });

        client.subscribe(`/topic/game/${gameSessionId}/end`, (message: IMessage) => {
          const endData: GameEndDTO = JSON.parse(message.body);
          setGameEndData(endData);
          setIsGameOver(true);
          localStorage.removeItem("gameRoundData");
          localStorage.removeItem("roomLanguage");
          localStorage.removeItem("roomMode");
          localStorage.removeItem("roomDifficulty");

          if (!endData.winnerPlayerId) {
            audioDraw.current?.play().catch(() => {});
          } else if (endData.winnerPlayerId === Number(userId)) {
            audioWin.current?.play().catch(() => {});
          } else {
            audioLose.current?.play().catch(() => {});
          }
        });

        client.subscribe(`/user/queue/game-summary`, (message: IMessage) => {
          const summary: PlayerGameSummaryDTO = JSON.parse(message.body);
          setGameSummary(summary);
        });

        client.subscribe(`/user/queue/sabotage`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          const effectId = ENUM_TO_EFFECT[data.item];
          if (!effectId) return;
          setActiveEffects(prev => new Set(prev).add(effectId));
          setTimeout(() => {
            setActiveEffects(prev => {
              const next = new Set(prev);
              next.delete(effectId);
              return next;
            });
          }, SABOTAGE_DURATION_MS);
          setSabotageNotification(data.item);
          setTimeout(() => setSabotageNotification(null), 4000);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();
    return () => { if (client.active) client.deactivate(); };
  }, [token, gameSessionId, userId]);

  return { isGameOver, gameEndData, gameSummary, activeEffects, sabotageNotification };
}