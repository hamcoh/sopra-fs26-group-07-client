"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/joinRoom.module.css";
import ProfileButton from "@/components/ProfileButton";
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import { Client, IFrame } from "@stomp/stompjs";

export default function JoinRoomPage() {
  const router = useRouter();
  const { value: token } = useLocalStorage("token", "");
  const { value: username } = useLocalStorage("username", "Player");
  const { value: userId } = useLocalStorage("userid", "");

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token === "") return;
    if (!token) {
      router.push("/");
      alert("You must be logged in to access the menu.");
    }
  }, [router, token]);

  const handleJoin = async () => {
    if (joinCode.length !== 6) {
      alert("Please enter a valid 6-character session code.");
      return;
    }

    setLoading(true);
///
    try {
      

      // Step 2: join the room via REST
      const joinRes = await fetch(`${getApiDomain()}/rooms/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token,
          "userId": String(userId),
          "roomJoinCode": joinCode.toUpperCase(),
        },
      });

      if (!joinRes.ok) throw new Error("Failed to join room");

      const roomId = (await joinRes.json()).roomId;

      // Step 3: connect via WebSocket, send join notification, then navigate
      const wsUrl = getApiDomain()
        .replace("https://", "wss://")
        .replace("http://", "ws://") + "/ws";

      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: { token: token },
        onConnect: () => {
          // publish join message to notify the host
          client.publish({
            destination: `/app/room/${roomId}/join`,
            body: JSON.stringify({ username: username, host: false }),
          });
          // small delay to ensure message is transmitted before disconnecting
          setTimeout(() => {
            client.deactivate();
            router.push(`/rooms/${roomId}`);
          }, 2000);
        },
        onStompError: (frame: IFrame) => {
          console.error("WebSocket error:", frame);
          setLoading(false);
        },
      });

      client.activate();

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
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
            <h1 className={styles.logoTitle}>Join Room</h1>
            <p className={styles.logoSubtitle}>Enter the battle code</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Enter Session Code</h2>
          <p className={styles.cardDescription}>
            Ask your opponent for their session code to join their room
          </p>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Room Code</label>
            <input
              className={styles.codeInput}
              type="text"
              placeholder="ABC123"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <p className={styles.inputHint}>Session codes are 6 characters long</p>
          </div>

          <button
            className={styles.joinButton}
            onClick={handleJoin}
            disabled={loading || joinCode.length !== 6}
            style={{ opacity: loading || joinCode.length !== 6 ? 0.6 : 1 }}
          >
            {loading ? "Joining..." : <> Join Lobby <ArrowRightOutlined /></>}
          </button>
        </div>

      </div>
    </div>
  );
}
