import { CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Avatar from "../base/Avatar";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import styles from "@/styles/profile.module.css";

interface ProfileHeaderProps {
    username: string;
    joinedDate: string;
    bio?: string | null;
    avatarId: number;
}

export default function UserIdentity({ username, joinedDate, bio, avatarId, }: ProfileHeaderProps) {
    return (
        <div className={styles.profile} style={{ height: "auto", minHeight: "120px" }}>
            <CodosseumAvatar
                id={avatarId}
                size={75}
                backgroundColor="#ffffff"
            />

            <div className={styles.profileText}>
                <span className={styles.usernameText}>
                    {username || "???"}
                </span>
                <div className={styles.titledescr}>
                    <CalendarOutlined />
                    <span>Joined {joinedDate || "???"}</span>
                </div>
                {bio && (
                    <div className={styles.titledescr} style={{ marginTop: 6, opacity: 0.85 }}>
                        <InfoCircleOutlined />
                        <span>{bio}</span>
                    </div>
                )}
            </div>
        </div>
    );
}