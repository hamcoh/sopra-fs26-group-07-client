"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/profileButton.module.css";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import useLocalStorage from "@/hooks/useLocalStorage";

const ProfileButton: React.FC = () => {
  const router = useRouter();

  const { value: avatarId } = useLocalStorage("avatarId", "1");

  return (
    <button
      className={styles.profileButton}
      onClick={() => router.push("/profile")}
      aria-label="Go to profile"
    >
      <CodosseumAvatar
          id={Number(avatarId) || 1}
          backgroundColor="transparent"
      />
    </button>
  );
};

export default ProfileButton;
