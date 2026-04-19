"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/profile.module.css";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import {message} from "antd";
import ProfileHeader from "@/components/profile/blocks/ProfileHeader";
import UserIdentity from "@/components/profile/blocks/UserIdentity";
import StatGroup from "@/components/profile/blocks/StatGroup";
import ProfileButton from "@/components/ProfileButton";
import {useAuth} from "@/hooks/useAuth";
import {useUserProfile} from "@/hooks/useUserProfile";

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const [messageApi, contextHolder] = message.useMessage();
    const { token, isLoading: authLoading, handleLogOut } = useAuth();
    const { username, joinedDate, stats, isLoading: profileLoading, fetchUser } = useUserProfile();

    useEffect(() => {
        if (authLoading) return;

        if (!token || !userId) {
            messageApi.error("You must be logged in to look at user profiles.", 4);
            handleLogOut(4000);
            return;
        }

        fetchUser(userId, token, () => handleLogOut(3000))
            .catch((err) => {
                messageApi.error(err.message || "User not found");
            });
    }, [authLoading, token, userId]);

    // Loading-Page
    const isActuallyLoading = authLoading || profileLoading || (token && !username);

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
                <ProfileButton />

                <ProfileHeader
                    onBack={() => router.push("/menu")}
                    subtitle="Gladiator stats"
                    logoAreaClass={styles.logoArea2}
                    useTopRow={false}
                />

                <UserIdentity username={username} joinedDate={joinedDate} />

                <StatGroup stats={stats} losses={losses} />

            </div>
        </div>
        </>
    );
}
