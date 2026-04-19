"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/profile.module.css";
import {useEffect} from "react";
import {message} from "antd";
import ProfileHeader from "@/components/profile/blocks/ProfileHeader";
import StatGroup from "@/components/profile/blocks/StatGroup";
import UserIdentity from "@/components/profile/blocks/UserIdentity";
import ActionGroup from "@/components/profile/blocks/ActionGroup";
import {useUserProfile} from "@/hooks/useUserProfile";
import {useAuth} from "@/hooks/useAuth";

export default function OwnProfilePage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { username, joinedDate, stats, isLoading: profileLoading, fetchUser } = useUserProfile();
  const { token, userId, isLoading: authLoading, isLoggingOut, handleLogOut } = useAuth();

    useEffect(() => {
        if (authLoading || isLoggingOut) return;

        if (!token) {
            messageApi.error("You must be logged in to look at the profile.", 4);
            handleLogOut(4000);
            return;
        }

        fetchUser(userId, token)
            .catch((err) => {
                messageApi.error(err.message);

                if (err.message.includes("Session expired")) {
                    handleLogOut(3000);
                }
            });

    }, [authLoading, token, userId]);

  const isActuallyLoading = authLoading || isLoggingOut || profileLoading || (token && !username);

  if (isActuallyLoading) {
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

          <ProfileHeader onBack={() => router.push("/menu")} />

          <UserIdentity username={username} joinedDate={joinedDate} />

          <StatGroup stats={stats} losses={losses} />

          <ActionGroup
              onChangePassword={() => router.push("/changepassword")}
              onViewUsers={() => router.push("/leaderboard")}
              onLogout={handleLogOut}
          />
        </div>
      </div>
    </>
  );
}