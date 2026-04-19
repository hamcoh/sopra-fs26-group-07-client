import { CalendarOutlined } from "@ant-design/icons";
import Avatar from "../base/Avatar";
import styles from "@/styles/profile.module.css";

interface ProfileHeaderProps {
    username: string;
    joinedDate: string;
}

export default function UserIdentity({ username, joinedDate }: ProfileHeaderProps) {
    return (
        <div className={styles.profile}>
            <Avatar username={username} />

            <div className={styles.profileText}>
        <span className={styles.usernameText}>
          {username || "???"}
        </span>
                <div className={styles.titledescr}>
                    <CalendarOutlined />
                    <span>Joined {joinedDate || "???"}</span>
                </div>
            </div>
        </div>
    );
}