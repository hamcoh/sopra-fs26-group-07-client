"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/joinRoom.module.css";
import ProfileButton from "@/components/ProfileButton";
import {useEffect, useState} from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import {message} from "antd";

export default function JoinRoomPage() {
  const router = useRouter();
  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
  const { value: userId, loading: userIdLoading } = useLocalStorage<string>("userid", "");

  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (tokenLoading || userIdLoading) return;

    if (!token) {
      messageApi.error("You must be logged in to join a room",4);
      setIsLoading(false);
      setTimeout(() => router.push("/"), 4000);
      return;
    }

    setIsLoading(false);
    setIsAuthorized(true);

  }, [token, tokenLoading, userIdLoading, router, messageApi]);

  // Loading-Page
  const isActuallyLoading = tokenLoading || userIdLoading || isLoading;

  if (isActuallyLoading) {
    return (
        <div className={styles.pageBackground}>
          {contextHolder}
        </div>
    );
  }

  // Not-Authorized-Page
  if (!isAuthorized) {
    return (
        <div className={styles.pageBackground}>
          {contextHolder}
        </div>
    );
  }

  return (
  <>
    {contextHolder}
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
    </>
  );
}
