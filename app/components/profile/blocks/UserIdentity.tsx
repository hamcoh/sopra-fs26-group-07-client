import {CalendarOutlined, EditOutlined, InfoCircleOutlined} from "@ant-design/icons";
import Avatar from "../base/Avatar";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import styles from "@/styles/profile.module.css";
import {useRouter} from "next/navigation";

interface ProfileHeaderProps {
    username: string;
    joinedDate: string;
    bio?: string | null;
    avatarId: number;
    isEditable?: boolean;
}

export default function UserIdentity({ username, joinedDate, bio, avatarId, isEditable = false}: ProfileHeaderProps) {
    const router = useRouter();
    return (
        <div className={styles.profile} style={{ height: "auto", minHeight: "120px" }}>
            <div
                className={styles.avatarWrapper}
                onClick={() => isEditable && router.push("/changeavatar")}
                style={{
                    cursor: isEditable ? "pointer" : "default",
                    pointerEvents: isEditable ? "auto" : "none"
                }}
            >
            <CodosseumAvatar
                id={avatarId}
                size={75}
                backgroundColor="#ffffff"
            />
                {isEditable && (
                    <div className={styles.avatarOverlay}>
                        <EditOutlined style={{ fontSize: '20px' }} />
                    </div>
                )}
            </div>

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