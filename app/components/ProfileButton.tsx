"use client";

import { useRouter } from "next/navigation";
import { UserOutlined } from "@ant-design/icons";
import styles from "@/styles/profileButton.module.css";

const ProfileButton: React.FC = () => {
  const router = useRouter();

  return (
    <button
      className={styles.profileButton}
      onClick={() => router.push("/profile")}
      aria-label="Go to profile"
    >
      <UserOutlined style={{ fontSize: 20 }} />
    </button>
  );
};

export default ProfileButton;
