import { Row, Col, Typography, Button } from "antd";
import CodosseumAvatar from "@/components/CodosseumAvatar";
import {useState} from "react";
import styles from "@/styles/page.module.css";

const { Title, Text } = Typography;

interface AvatarSelectionProps {
    onSelect: (id: number) => void;
    onBack: () => void;
    isLoading: boolean;
}

const AvatarSelection = ({ onSelect, onBack, isLoading }: AvatarSelectionProps) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const avatarIds = Array.from({ length: 9 }, (_, i) => i + 1);

    return (
        <div style={{ textAlign: "center" }}>
            <h2> Choose Your Avatar</h2>
            <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                Select a gladiator to represent you
            </Text>

            <Row gutter={[24, 24]} justify="center">
                {[1, 2, 10, 4, 5, 6, 7, 8, 9].map((id) => (
                    <Col key={id} span={4.8} style={{ display: 'flex', justifyContent: 'center' }}>
                        <div
                            onClick={() => !isLoading && setSelectedId(id)}
                            style={{
                                cursor: isLoading ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease-in-out",
                                opacity: isLoading ? 0.5 : 1,
                                borderRadius: "50%",
                                transform: selectedId === id ? "scale(1.1)" : "scale(1)",
                            }}
                            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = "scale(1.15)")}
                            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = "scale(1.0)")}
                        >
                            <CodosseumAvatar id={id} size={80} variant = "avatarSelection" backgroundColor={selectedId === id ? "#1890ff" : "#cccccc"} />
                        </div>
                    </Col>
                ))}
            </Row>

            <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button
                    type="primary"
                    size="large"
                    block
                    disabled={!selectedId || isLoading}
                    loading={isLoading}
                    onClick={() => selectedId && onSelect(selectedId)}
                    style={{ height: '50px', fontSize: '1.1rem' }}
                    className ={styles.signInButton}
                >
                    Complete Registration
                </Button>

                <Button
                    type="link"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    Go back to details
                </Button>
            </div>
        </div>
    );
};

export default AvatarSelection;