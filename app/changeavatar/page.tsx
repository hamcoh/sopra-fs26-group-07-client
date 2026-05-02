"use client";
import AvatarSelection from "@/components/register/AvatarSelection";
import styles from "@/styles/page.module.css";
import { useRouter } from "next/navigation";
import CodosseumLogo from "@/components/CodosseumLogo";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {getApiDomain} from "@/utils/domain";
import useLocalStorage from "@/hooks/useLocalStorage";
import {message} from "antd";
import {useEffect, useState} from "react";

export default function ChangeAvatarPage() {
  const router = useRouter();
  const { value: userId, loading: userIdLoading } = useLocalStorage<string>("userid", "");
  const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!tokenLoading && !userIdLoading) {
            if (!token || !userId) {
                router.push("/");
            } else {
                setIsReady(true);
            }
        }
    }, [token, userId, tokenLoading, userIdLoading, router]);

    const handleUpdate = async (newAvatarId: number) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${getApiDomain()}/users/${userId}/avatar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: token || "",
                },
                body: JSON.stringify({
                    avatarId: newAvatarId,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update avatar");
            }

            messageApi.success("Avatar updated successfully!");

            setTimeout(() => {
                router.push("/profile");
            }, 1000);

        } catch (error) {
            messageApi.error(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isReady) {
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", maxWidth: "450px", position: "relative" }}>
        <button
            className={styles.backButton}
            onClick={() => router.push("/profile")}
            style={{
              position: "absolute",
              top: "20px",
              left: "0"
            }}>
          <ArrowLeftOutlined /> Back to Profile
        </button>
        <div className={styles.logoArea}>
          <CodosseumLogo size={100} />
          <div className={styles.logoTexts}>
            <h1 className={styles.logoTitle}>Codosseum</h1>
            <p className={styles.logoSubtitle}>Join the coding arena</p>
          </div>
        </div>

        <div className={styles.card}>
          <AvatarSelection
              onSelect={handleUpdate}
              onBack={() => router.back()}
              isLoading={false}
              title="Change Your Avatar"
              submitText="Update Avatar"
              showBackDetails={false}
          />
        </div>
      </div>
      </div>
    </>
  );
}