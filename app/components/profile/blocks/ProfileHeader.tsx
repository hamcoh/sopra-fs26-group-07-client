import { ArrowLeftOutlined } from "@ant-design/icons";
import CodosseumLogo from "@/components/CodosseumLogo";
import styles from "@/styles/profile.module.css";

interface ProfileNavigationProps {
    onBack: () => void;
    title?: string;
    subtitle?: string;
    logoAreaClass?: string;
    useTopRow?: boolean;
}

export default function ProfileNavigation({
                                              onBack,
                                              title = "Profile",
                                              subtitle = "Your gladiator stats",
                                              logoAreaClass = styles.logoArea,
                                              useTopRow = true
                                          }: ProfileNavigationProps) {
    const Content = (
        <>
            <button className={styles.backButton} onClick={onBack}>
                <ArrowLeftOutlined /> Back to Menu
            </button>

            <div className={logoAreaClass}>
                <CodosseumLogo size={100} />
                <div className={styles.logoTexts}>
                    <h1 className={styles.logoTitle}>{title}</h1>
                    <p className={styles.logoSubtitle}>{subtitle}</p>
                </div>
            </div>
        </>
    );

    return useTopRow ? (
        <div className={styles.topRow}>{Content}</div>
    ) : (
        Content
    );
}

