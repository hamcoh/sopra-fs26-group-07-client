import styles from "@/styles/profile.module.css";

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    hoverClass: string;
    iconClass: string;
}

export default function ActionCard({ icon, title, description, onClick, hoverClass, iconClass }: ActionCardProps) {
    return (
            <div className={styles.optionsRow}>
                <div className={`${styles.optionCard} ${hoverClass}`} onClick={onClick}>
                    <div className={iconClass}>
                        {icon}
                    </div>
                    <div>
                        <p className={styles.optionName}>{title}</p>
                        <p className={styles.optionDesc}>{description}</p>
                    </div>
                </div>
            </div>
    );
}