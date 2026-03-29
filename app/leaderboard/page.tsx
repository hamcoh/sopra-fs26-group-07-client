"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Table } from "antd";
import type { TableProps } from "antd";
import { ArrowLeftOutlined, TrophyFilled } from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import { getApiDomain } from "@/utils/domain";
import styles from "@/styles/leaderboard.module.css";
import ProfileButton from "@/components/ProfileButton";

const PodiumIcon = ({ rank }: { rank: number }) => {
  const configs: Record<number, { bg: string }> = {
    1: { bg: "#F59E0B" },
    2: { bg: "#9CA3AF" },
    3: { bg: "#D97706" },
  };
  const config = configs[rank];
  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: config.bg,
      display: "flex", alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 12px",
    }}>
      <TrophyFilled style={{ color: "white", fontSize: 28 }} />
    </div>
  );
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const { value: token } = useLocalStorage<string>("token", "");
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userid") : null;

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${getApiDomain()}/users/leaderboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "token": token,
          },
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: User[] = await res.json();
        setUsers(data);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong:\n${error.message}`);
        }
      }
    };

    fetchUsers();
  }, [token]);

  const top3 = users.slice(0, 3);
  const podiumOrder = [
    top3[1] ?? null,
    top3[0] ?? null,
    top3[2] ?? null,
  ];
  const podiumRanks = [2, 1, 3];

  const columns: TableProps<User>["columns"] = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (rank: number) => {
        const base: React.CSSProperties = {
          width: 44, height: 44, borderRadius: 10,
          display: "flex", alignItems: "center",
          justifyContent: "center",
        };
        if (rank === 1) return <div style={{ ...base, background: "#F59E0B" }}><TrophyFilled style={{ color: "white", fontSize: 20 }} /></div>;
        if (rank === 2) return <div style={{ ...base, background: "#9CA3AF" }}><TrophyFilled style={{ color: "white", fontSize: 20 }} /></div>;
        if (rank === 3) return <div style={{ ...base, background: "#D97706" }}><TrophyFilled style={{ color: "white", fontSize: 20 }} /></div>;
        return (
          <div style={{ ...base, background: "#F3F4F6", color: "#6B7280", fontSize: 13, fontWeight: 700 }}>
            #{rank}
          </div>
        );
      },
    },
    {
      title: "Player",
      dataIndex: "username",
      key: "username",
      render: (username: string, record: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{username}</span>
          {String(record.id) === String(currentUserId) && (
            <span style={{
              background: "#EEF2FF", color: "#4361EE", fontSize: 11,
              fontWeight: 600, padding: "2px 7px", borderRadius: 6,
            }}>You</span>
          )}
          <span style={{
            fontSize: 12,
            color: record.status === "ONLINE" ? "#22C55E" : "#9CA3AF",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: record.status === "ONLINE" ? "#22C55E" : "#9CA3AF",
              display: "inline-block",
            }} />
            {record.status === "ONLINE" ? "Online" : "Offline"}
          </span>
        </div>
      ),
    },
    {
      title: "Points",
      dataIndex: "totalPoints",
      key: "totalPoints",
      render: (points: number) => (
        <span style={{ color: "#4361EE", fontWeight: 700, fontSize: 15 }}>
          {points.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Games",
      dataIndex: "totalGamesPlayed",
      key: "totalGamesPlayed",
    },
    {
      title: "Record",
      key: "record",
      render: (_: unknown, record: User) => {
        const losses = (record.totalGamesPlayed ?? 0) - (record.winCount ?? 0);
        return (
          <span style={{ fontWeight: 600 }}>
            <span style={{ color: "#22C55E" }}>{record.winCount}</span>
            <span style={{ color: "#9CA3AF" }}> - </span>
            <span style={{ color: "#EF4444" }}>{losses}</span>
          </span>
        );
      },
    },
    {
      title: "Win Rate",
      dataIndex: "winRatePercentage",
      key: "winRatePercentage",
      render: (rate: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 90, height: 8, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${rate}%`, height: "100%", background: "#22C55E", borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 13, color: "#374151", minWidth: 44 }}>
            {rate.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.content}>
        <ProfileButton />

        <button className={styles.backButton} onClick={() => router.push("/menu")}>
          <ArrowLeftOutlined /> Back to Menu
        </button>

        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Leaderboard</h1>
            <p className={styles.logoSubtitle}>Top gladiators in the arena</p>
          </div>
        </div>

        {users.length > 0 && (
          <div className={styles.podium}>
            {podiumOrder.map((user, i) => {
              const rank = podiumRanks[i];
              if (!user) return <div key={`podium-empty-${rank}`} className={styles.podiumPlaceholder} />;
              return (
                <div
                  key={user.id}
                  className={`${styles.podiumCard} ${rank === 1 ? styles.podiumCardFirst : ""}`}
                >
                  <PodiumIcon rank={rank} />
                  <p className={styles.podiumUsername}>{user.username}</p>
                  <p className={`${styles.podiumPoints} ${rank === 1 ? styles.podiumPointsGold : ""}`}>
                    {user.totalPoints.toLocaleString()}
                  </p>
                  <p className={styles.podiumWR}>{user.winRatePercentage?.toFixed(1)}% WR</p>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.tableWrapper}>
          <Table<User>
            className={styles.leaderboardTable}
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={false}
            onRow={(row) => ({
              onClick: () => {
                console.log("CLICKED ROW:", row);
                console.log("ROW ID:", row.id);
                console.log("CURRENT USER ID:", currentUserId);
                if (String(row.id) === String(currentUserId)) {
                  router.push("/profile");
                } else {
                  router.push(`/users/${String(row.id)}`);
                }
              },
              style: { cursor: "pointer" },
            })}
          />
        </div>

      </div>
    </div>
  );
}
