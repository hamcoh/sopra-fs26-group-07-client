"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FireOutlined, RiseOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { message, Tabs } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import CodosseumLogo from "@/components/CodosseumLogo";
import ProfileButton from "@/components/ProfileButton";
import ProblemStatsList from "@/stats/_components/ProblemStatsList";
import { useHardestProblems } from "@/stats/_hooks/useHardestProblems";
import { usePopularProblems } from "@/stats/_hooks/usePopularProblems";
import styles from "@/styles/stats.module.css";

export default function StatsPage() {
  const router = useRouter();
  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
  const [messageApi, contextHolder] = message.useMessage();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const hardest = useHardestProblems();
  const popular = usePopularProblems();

  useEffect(() => {
    if (tokenLoading) return;
    if (!token) {
      messageApi.error("You must be logged in to view this page.", 4);
      setTimeout(() => router.push("/"), 4000);
    } else {
      setIsAuthorized(true);
    }
    setAuthChecked(true);
  }, [token, tokenLoading, router, messageApi]);

  if (!authChecked || tokenLoading) {
    return <div className={styles.pageBackground}>{contextHolder}</div>;
  }

  if (!isAuthorized) {
    return <div className={styles.pageBackground}>{contextHolder}</div>;
  }

  const tabItems = [
    {
      key: "hardest",
      label: (
          <span className={styles.tabLabel}>
            <FireOutlined /> Hardest Problems
          </span>
      ),
      children: (
          <ProblemStatsList
              title="Hardest Problems"
              subtitle="Top 5 problems ranked by difficulty score"
              icon={<FireOutlined style={{ fontSize: 22, color: "white" }} />}
              tooltip="Problems are ranked by a weighted difficulty score based on overall success rate and total play volume. A problem requires a minimum number of plays to appear in this ranking."
              data={hardest.data}
              loading={hardest.loading}
              error={hardest.error}
              accentColor="orange"
          />
      ),
    },
    {
      key: "popular",
      label: (
          <span className={styles.tabLabel}>
            <RiseOutlined /> Most Popular
          </span>
      ),
      children: (
          <ProblemStatsList
              title="Most Popular Problems"
              subtitle="Top 5 problems ranked by total play count"
              icon={<RiseOutlined style={{ fontSize: 22, color: "white" }} />}
              data={popular.data}
              loading={popular.loading}
              error={popular.error}
              accentColor="blue"
          />
      ),
    },
  ];

  return (
      <>
        {contextHolder}
        <div className={styles.pageBackground}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />

          <div className={styles.content}>
            <ProfileButton />

            <button className={styles.backButton} onClick={() => router.push("/menu")}>
              <ArrowLeftOutlined /> Back to Menu
            </button>

            <div className={`${styles.logoArea} ${styles.animFadeUp}`} style={{ animationDelay: "0.05s" }}>
              <CodosseumLogo size={100} />
              <div className={styles.logoTexts}>
                <h1 className={styles.logoTitle}>Problem Statistics</h1>
                <p className={styles.logoSubtitle}>See what the arena is playing</p>
              </div>
            </div>

            <div className={`${styles.tabsWrapper} ${styles.animFadeUp}`} style={{ animationDelay: "0.15s" }}>
              <Tabs
                  defaultActiveKey="hardest"
                  items={tabItems}
                  centered
                  size="large"
              />
            </div>
          </div>
        </div>
      </>
  );
}