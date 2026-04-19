import { LockOutlined, TeamOutlined, LogoutOutlined } from "@ant-design/icons";
import ActionCard from "../base/ActionCard";
import styles from "@/styles/profile.module.css";

interface ActionGroupProps {
    onChangePassword: () => void;
    onViewUsers: () => void;
    onLogout: () => void;
}

export default function ActionGroup({ onChangePassword, onViewUsers, onLogout }: ActionGroupProps) {
    return (
        <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Account Actions</h3>

                <ActionCard
                    title="Change password"
                    description="Update your account password"
                    icon={<LockOutlined />}
                    onClick={onChangePassword}
                    hoverClass={styles.blueHover}
                    iconClass={styles.icon}
                />

                <ActionCard
                    title="View all Users"
                    description="Browse the leaderboard and other players"
                    icon={<TeamOutlined />}
                    onClick={onViewUsers}
                    hoverClass={styles.violetHover}
                    iconClass={styles.icon2}
                />

                <ActionCard
                    title="Logout"
                    description="Sign out of your account"
                    icon={<LogoutOutlined />}
                    onClick={onLogout}
                    hoverClass={styles.redHover}
                    iconClass={styles.icon3}
                />
            </div>
    );
}