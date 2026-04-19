import styles from "@/styles/profile.module.css";

interface AvatarProps {
    username: string;
}

export default function Avatar({ username }: AvatarProps) {
    const initial = (username || "???").charAt(0).toUpperCase();

    return (
        <div className={styles.avatarCircle}>
            <span className={styles.avatarLetter}>{initial}</span>
        </div>
    );
}