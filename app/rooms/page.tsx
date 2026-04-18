"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined, ReloadOutlined, ThunderboltFilled,
  TeamOutlined, LockOutlined,
} from "@ant-design/icons";
import { Client, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import CodosseumLogo from "@/components/CodosseumLogo";
import ProfileButton from "@/components/ProfileButton";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import styles from "@/styles/rooms.module.css";

interface RoomData {
  roomId: number;
  roomJoinCode: string;
  currentNumPlayers: number;
  maxNumPlayers: number;
  isRoomOpen: boolean;
  gameDifficulty: string;
  gameLanguage: string;
  gameMode: string;
}

const formatEnum = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export default function RoomsPage() {
  const router = useRouter();
  const { value: token } = useLocalStorage("token", "");
  const { value: username } = useLocalStorage("username", "Player");
  const { value: userId } = useLocalStorage("userid", "");

  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoomId, setJoiningRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (token === "") return;
    if (!token) {
      router.push("/");
      return;
    }
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiDomain()}/rooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "userId": String(userId),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data: RoomData[] = await res.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (room: RoomData) => {
    setJoiningRoomId(room.roomId);

    try {
      const joinRes = await fetch(`${getApiDomain()}/rooms/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "userId": String(userId),
          "roomJoinCode": room.roomJoinCode,
        },
      });

      if (!joinRes.ok) throw new Error("Failed to join room");

      const roomId = (await joinRes.json()).roomId;

      const client = new Client({
        webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
        connectHeaders: { token: token },
        reconnectDelay: 0,
        onConnect: () => {
          client.publish({
            destination: `/app/room/${roomId}/join`,
            body: JSON.stringify({ username: username, host: false }),
          });
          setTimeout(() => {
            client.deactivate();
            router.push(`/rooms/${roomId}`);
          }, 500);
        },
        onStompError: (frame: IFrame) => {
          console.error("WebSocket error:", frame);
          client.deactivate();
          setJoiningRoomId(null);
        },
      });

      client.activate();
    } catch (err) {
      console.error(err);
      alert("Failed to join room. Please try again.");
      setJoiningRoomId(null);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <div className={styles.content}>
        <ProfileButton />

        <button className={styles.backButton} onClick={() => router.push("/menu")}>
          <ArrowLeftOutlined /> Back
        </button>

        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Browse Rooms</h1>
            <p className={styles.logoSubtitle}>Find an open battle to join</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Open Rooms</h2>
            <button className={styles.refreshButton} onClick={fetchRooms} disabled={loading}>
              <ReloadOutlined spin={loading} /> Refresh
            </button>
          </div>

          {loading ? (
            <p className={styles.emptyText}>Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <div className={styles.emptyState}>
              <ThunderboltFilled className={styles.emptyIcon} />
              <p className={styles.emptyText}>No open rooms right now</p>
              <p className={styles.emptySubtext}>Be the first to create one!</p>
            </div>
          ) : (
            <div className={styles.roomList}>
              {rooms.map((room) => (
                <div key={room.roomId} className={styles.roomRow}>

                  <div className={styles.roomLeft}>
                    <span className={styles.roomCode}>{room.roomJoinCode}</span>
                    {room.isRoomOpen ? (
                      <span className={styles.badgeOpen}>
                        <TeamOutlined /> Open
                      </span>
                    ) : (
                      <span className={styles.badgeFull}>
                        <LockOutlined /> Full
                      </span>
                    )}
                  </div>

                  <div className={styles.roomMeta}>
                    <span className={styles.metaTag}>{formatEnum(room.gameLanguage)}</span>
                    <span className={styles.metaTag}>{formatEnum(room.gameDifficulty)}</span>
                    <span className={styles.metaTag}>{formatEnum(room.gameMode)}</span>
                  </div>

                  <div className={styles.roomPlayers}>
                    {room.currentNumPlayers}/{room.maxNumPlayers}
                  </div>

                  <button
                    className={styles.joinButton}
                    onClick={() => handleJoin(room)}
                    disabled={!room.isRoomOpen || joiningRoomId !== null}
                  >
                    {joiningRoomId === room.roomId ? "Joining..." : "Join"}
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
