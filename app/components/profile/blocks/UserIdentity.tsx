import {CalendarOutlined, EditOutlined, InfoCircleOutlined} from "@ant-design/icons";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import styles from "@/styles/profile.module.css";
import {useRouter} from "next/navigation";
import {useState} from "react";

interface ProfileHeaderProps {
    username: string;
    joinedDate: string;
    bio?: string | null;
    avatarId: number;
    isEditable?: boolean;
    onBioSave?: (newBio: string) => void;
}

export default function UserIdentity({ username, joinedDate, bio, avatarId, isEditable = false, onBioSave }: ProfileHeaderProps) {
    const router = useRouter();
    const [editingBio, setEditingBio] = useState(false);
    const [bioValue, setBioValue] = useState(bio ?? "");

    return (
        <div className={styles.profile} style={{ height: "auto", minHeight: "120px" }}>
            <div
                className={styles.avatarWrapper}
                onClick={() => isEditable && router.push("/changeavatar")}
                style={{ cursor: isEditable ? "pointer" : "default", pointerEvents: isEditable ? "auto" : "none" }}
            >
                <CodosseumAvatar id={avatarId} size={75} backgroundColor="#ffffff" />
                {isEditable && (
                    <div className={styles.avatarOverlay}>
                        <EditOutlined style={{ fontSize: "20px" }} />
                    </div>
                )}
            </div>

            <div className={styles.profileText}>
                <span className={styles.usernameText}>{username || "???"}</span>
                <div className={styles.titledescr}>
                    <CalendarOutlined />
                    <span>Joined {joinedDate || "???"}</span>
                </div>

                {isEditable ? (
                    editingBio ? (
                        <div className={styles.titledescr} style={{ marginTop: 6 }}>
                            <InfoCircleOutlined />
                            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                <input
                                    autoFocus
                                    value={bioValue}
                                    onChange={(e) => setBioValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { onBioSave?.(bioValue); setEditingBio(false); }
                                        if (e.key === "Escape") { setBioValue(bio ?? ""); setEditingBio(false); }
                                    }}
                                    onBlur={() => { onBioSave?.(bioValue); setEditingBio(false); }}
                                    maxLength={50}
                                    placeholder="Add a bio..."
                                    style={{
                                        fontSize: "14px", border: "none", borderBottom: "1px solid #cbd5e1",
                                        outline: "none", background: "transparent", fontFamily: "inherit",
                                        width: "100%", padding: "0 2px", color: "#ffffff",
                                    }}
                                />
                                <span style={{ fontSize: "11px", color: bioValue.length >= 51 ? "#ef4444" : "#94a3b8", alignSelf: "flex-end", marginTop: 2 }}>
                                    {bioValue.length}/50
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={styles.titledescr}
                            onClick={() => setEditingBio(true)}
                            style={{ marginTop: 6, opacity: bioValue ? 0.85 : 0.45, cursor: "pointer" }}
                        >
                            <InfoCircleOutlined />
                            <span>{bioValue || "Add a bio..."}</span>
                            <EditOutlined style={{ fontSize: "12px", marginLeft: 4 }} />
                        </div>
                    )
                ) : bio ? (
                    <div className={styles.titledescr} style={{ marginTop: 6, opacity: 0.85 }}>
                        <InfoCircleOutlined />
                        <span>{bio}</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}