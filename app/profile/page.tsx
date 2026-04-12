"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  RiseOutlined,
  LockOutlined,
  LogoutOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/profile.module.css";
import { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState } from "react";
import {getApiDomain} from "@/utils/domain";
import {message} from "antd";

export default function OwnProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [stats, setStats] = useState({
    winCount: 0,
    winRatePercentage: 0,
    totalGamesPlayed: 0,
    totalPoints: 0,
  });

  const { value: token, loading: tokenLoading, clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: userId, loading: userIdLoading, clear: clearUserId } = useLocalStorage<string>("userid", "");
  const { clear: clearUsername } = useLocalStorage<string>("username", "");
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (tokenLoading || userIdLoading) return;

    if (!token || !userId) {
      messageApi.error("You must be logged in to look at the profile.",4);
      setIsLoading(false);
      setTimeout(() => router.push("/"), 4000);
      return;
    }

    setIsAuthorized(true);

    const fetchUser = async () => {
      try {
        const res = await fetch(`${getApiDomain()}/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message|| "Failed to load profile data");
        }

        setUsername(data.username);
        const date = new Date(data.creationDate);
        const formatted = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        setJoinedDate(formatted);
        setStats({
          winCount: data.winCount ?? 0,
          winRatePercentage: data.winRatePercentage ?? 0,
          totalGamesPlayed: data.totalGamesPlayed ?? 0,
          totalPoints: data.totalPoints ?? 0,
        });

      } catch (err) {
        if (err instanceof Error) {
          messageApi.error(err.message);
        } else {
          messageApi.error("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [tokenLoading, userIdLoading, router]);

  const handleLogOut = async () => {
    await fetch(`${getApiDomain()}/users/logout/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    clearToken();
    clearUserId();
    clearUsername();
    router.push("/");
  };

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

  // Final UI
  const losses = Math.max(0, stats.totalGamesPlayed - stats.winCount);

  return (
    <>
      {contextHolder}
      <div className={styles.pageBackground}>
            <div className={styles.content}>

          {/* Back-Arrow, Logo and Title of Page */}
          <div className={styles.topRow}>
            <button className={styles.backButton} onClick={() => router.push("/menu")}>
              <ArrowLeftOutlined/> Back to Menu
            </button>
            <div className={styles.logoArea}>
              <CodosseumLogo size={100}/>
              <div className={styles.logoTexts}>
                <h1 className={styles.logoTitle}>Profile</h1>
                <p className={styles.logoSubtitle}>Your gladiator stats</p>
              </div>
            </div>
          </div>

          {/* Account Title, White Circle and creationDate info */}
          <div className={styles.profile}>
            <div className={styles.avatarCircle}>
              <span className={styles.avatarLetter}>
                {(username || "???").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={styles.profileText}>
              <span className={styles.usernameText}>
                {username || "???"}
              </span>
              <div className={styles.titledescr}>
                <CalendarOutlined/>
                  <span>
                    Joined {joinedDate || "???"}
                  </span>
              </div>
            </div>
          </div>

          {/* Player Statistics */}
          <div className={styles.statsRow}>

            {/* Statbox 1 Total Points */}
            <div className={styles.statBox}>
              <div className={styles.statTop}>
                <div className={styles.icon4}>
                  <TrophyOutlined/>
                </div>
                <div className={styles.statTitle}>Points</div>
              </div>
              <div className={styles.statValue}>
                {stats.totalPoints}
              </div>
            </div>

            {/* Statbox 2 Games Played */}
            <div className={styles.statBox}>
              <div className={styles.statTop}>
                <div className={styles.icon}>
                  <PlayCircleOutlined/>
                </div>
                <div className={styles.statTitle}>Games Played</div>
              </div>
              <div className={styles.statValue}>
                {stats.totalGamesPlayed}
              </div>
            </div>

            {/* Statbox 3 Win Ratio */}
            <div className={styles.statBox}>
              <div className={styles.statTop}>
                <div className={styles.icon5}>
                  <RiseOutlined/>
                </div>
                <div className={styles.statTitle}>Win Ratio</div>
              </div>
              <div className={styles.statValue}>
                {stats.winRatePercentage}%
              </div>
            </div>

            {/* Statbox 4 Record */}
            <div className={styles.statBox}>
              <div className={styles.statTop}>
                <div className={styles.icon2}>
                  <TrophyOutlined/>
                </div>
                <div className={styles.statTitle}>Record</div>
              </div>
              <div className={styles.statValue}>
                {stats.winCount}W - {losses}L
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className={styles.card}>

            {/* Change Password - Option 1 */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Account Actions
              </h3>
              <div className={styles.optionsRow}>
                <div
                    className={`${styles.optionCard} ${styles.blueHover}`}
                    onClick={() => router.push("/changepassword")}
                >
                  <div className={styles.icon}>
                    <LockOutlined/>
                  </div>
                  <div>
                    <p className={styles.optionName}>Change password</p>
                    <p className={styles.optionDesc}>Update your account password</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Leaderboard redirect - Option 2 */}
            <section className={styles.section}>
              <div className={styles.optionsRow}>
                <div
                    className={`${styles.optionCard} ${styles.violetHover}`}
                    onClick={() => router.push("/leaderboard")}
                >
                  <div className={styles.icon2}>
                    <TeamOutlined/>
                  </div>
                  <div>
                    <p className={styles.optionName}>View all Users</p>
                    <p className={styles.optionDesc}>Browse the leaderboard and other players</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Log Out - Option 3 */}
            <section className={styles.section}>
              <div className={styles.optionsRow}>
                <div
                    className={`${styles.optionCard} ${styles.redHover}`}
                    onClick={handleLogOut}
                >
                  <div className={styles.icon3}>
                    <LogoutOutlined/>
                  </div>
                  <div>
                    <p className={styles.optionName}>Logout</p>
                    <p className={styles.optionDesc}>Sign out of your account</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}