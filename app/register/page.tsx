"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import AvatarSelection from "@/components/register/AvatarSelection";

interface FormFieldProps {
    username: string;
    password: string;
    confirm: string;
    bio?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [step, setStep] = useState<"details" | "avatar">("details");
    const [tempFormData, setTempFormData] = useState<FormFieldProps | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNextLoading, setIsNextLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/menu");
        }
    }, [router]);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const handleNextStep = async (values: FormFieldProps) => {
        setIsNextLoading(true);
        setTempFormData(values);
        await new Promise(resolve => setTimeout(resolve, 500));
        setStep("avatar");
    };

    const handleBack = () =>  {
        setIsNextLoading(false);
        setIsSubmitting(false);
        setStep("details");
    };

    const handleRegister = async (avatarId: number) => {
        if (!tempFormData) return;
        setIsSubmitting(true);
        try {
            const { confirm: _confirm, ...registrationData } = tempFormData;
            await apiService.post<User>("/users/register", { ...registrationData, avatarId });

            const loginRes = await apiService.post<User>("/users/login", {
                username: tempFormData.username,
                password: tempFormData.password,
            });

            if (loginRes.token) {
                try {
                    localStorage.setItem("token", JSON.stringify(loginRes.token));
                    localStorage.setItem("userid", JSON.stringify(loginRes.id));
                    localStorage.setItem("username", JSON.stringify(loginRes.username ?? ""));
                    localStorage.setItem("avatarId", JSON.stringify(loginRes.avatarId));
                } catch {
                    console.warn("localStorage unavailable; session will not persist after reload.");
                }
            }

            router.push("/menu");
        } catch (err) {
            setIsSubmitting(false);
            if (err instanceof Error) {
                messageApi.error(err.message || "Registration failed. Please try again.");
            } else {
                messageApi.error("An unknown error occurred.");
            }
        }
    };

    return (
        <>
            {contextHolder}

            {/* Animated background orbs */}
            <div className={styles.orb1} />
            <div className={styles.orb2} />
            <div className={styles.orb3} />

            <div
                className={styles.pageBackground}
                style={{ paddingTop: "0px", paddingBottom: "10px", gap: "8px", position: "relative" }}
            >
                {/* Logo */}
                <div
                    className={styles.animLogo}
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        maxWidth: "600px",
                        zIndex: 1,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <CodosseumLogo size={100} />
                        <div className={styles.logoTexts}>
                            <h1 className={styles.logoTitleShimmer}>Codosseum</h1>
                            <p className={styles.logoSubtitle}>Join the coding arena</p>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div
                    className={`${styles.card} ${styles.animCard}`}
                    style={
                        step === "avatar"
                            ? { paddingTop: "40px", paddingBottom: "20px", position: "relative", zIndex: 1 }
                            : { paddingTop: "25px", paddingBottom: "25px", position: "relative", zIndex: 1 }
                    }
                >
                    {step === "details" ? (
                        <>
                            <h2 className={styles.cardTitle}>Create Account</h2>
                            <Form
                                form={form}
                                name="register"
                                onFinish={handleNextStep}
                                layout="vertical"
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="username"
                                    hasFeedback
                                    label={
                                        <span className={styles.fieldLabel}>
                                          <span className={styles.requiredStar}>*</span> Username
                                        </span>
                                    }
                                    validateTrigger="onChange"
                                    rules={[
                                        {
                                            validator: async (_, value) => {
                                                if (!value || value.trim() === "")
                                                    return Promise.reject(new Error("Please input your username!"));
                                                if (value.length < 3)
                                                    return Promise.reject(new Error("Username must be at least 3 characters!"));
                                                if (value.length > 20)
                                                    return Promise.reject(new Error("Username cannot exceed 20 characters!"));

                                                return new Promise<void>((resolve, reject) => {
                                                    if (debounceTimer.current) clearTimeout(debounceTimer.current);
                                                    debounceTimer.current = setTimeout(async () => {
                                                        try {
                                                            await apiService.get(`/users/check/${value}`);
                                                            resolve();
                                                        } catch (err: unknown) {
                                                            const status =
                                                                err != null && typeof err === "object" && "status" in err
                                                                    ? (err as { status: number }).status
                                                                    : undefined;
                                                            if (status === 409 || status === 400) {
                                                                reject(new Error("Username already taken!"));
                                                            } else if (status !== undefined) {
                                                                reject(new Error("Could not verify username. Please try again."));
                                                            } else {
                                                                const msg = err instanceof Error ? err.message.toLowerCase() : "";
                                                                if (msg.includes("taken") || msg.includes("exist") || msg.includes("conflict")) {
                                                                    reject(new Error("Username already taken!"));
                                                                } else if (msg) {
                                                                    reject(new Error(err instanceof Error ? err.message : "Could not verify username."));
                                                                } else {
                                                                    reject(new Error("Could not verify username. Please try again."));
                                                                }
                                                            }
                                                        }
                                                    }, 500);
                                                });
                                            },
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: "#BDBDBD" }} />}
                                        maxLength={21}
                                        placeholder="CodeMaster"
                                        size="large"
                                        className={styles.input}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    hasFeedback
                                    label={
                                        <span className={styles.fieldLabel}>
                                          <span className={styles.requiredStar}>*</span> Password
                                        </span>
                                    }
                                    validateTrigger="onChange"
                                    rules={[
                                        {
                                            validator: async (_, value) => {
                                                if (!value || value.trim() === "")
                                                    return Promise.reject(new Error("Please enter a password"));
                                                if (value.length < 8)
                                                    return Promise.reject(new Error("Password must be at least 8 characters long"));
                                                if (value.length > 100)
                                                    return Promise.reject(new Error("Password cannot exceed 100 characters"));
                                                if (!/(?=.*[a-z])/.test(value))
                                                    return Promise.reject(new Error("Password must contain at least one lowercase letter"));
                                                if (!/(?=.*[A-Z])/.test(value))
                                                    return Promise.reject(new Error("Password must contain at least one uppercase letter"));
                                                if (!/(?=.*\d)/.test(value))
                                                    return Promise.reject(new Error("Password must contain at least one number"));
                                                if (!/(?=.*[@$!%*?&+\-._#])/.test(value))
                                                    return Promise.reject(new Error("Password must contain at least one symbol"));
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
                                        placeholder="········"
                                        size="large"
                                        maxLength={100}
                                        className={styles.input}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirm"
                                    hasFeedback
                                    label={
                                        <span className={styles.fieldLabel}>
                                          <span className={styles.requiredStar}>*</span> Confirm Password
                                        </span>
                                    }
                                    dependencies={["password"]}
                                    rules={[
                                        { required: true, message: "Please confirm your password!" },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue("password") === value) return Promise.resolve();
                                                return Promise.reject(new Error("The two passwords do not match!"));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
                                        placeholder="Repeat your password"
                                        size="large"
                                        maxLength={100}
                                        className={styles.input}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="bio"
                                    label={<span className={styles.fieldLabel}>Biography</span>}
                                    validateTrigger="onChange"
                                    rules={[{ max: 50, message: "Biography cannot exceed 50 characters!" }]}
                                >
                                    <Input.TextArea
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                        maxLength={50}
                                        showCount
                                        style={{ resize: "none" }}
                                        className={styles.textarea}
                                    />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                                    <Button
                                        htmlType="submit"
                                        block
                                        size="large"
                                        className={styles.signInButton}
                                        loading={isNextLoading}
                                    >
                                        Next: Choose Avatar
                                    </Button>
                                </Form.Item>
                            </Form>

                            <p className={styles.signUpText} style={{ marginTop: 6 }}>
                                Already have an account?{" "}
                                <Link href="/login" className={styles.signUpLink}>
                                    Sign in
                                </Link>
                            </p>

                            <p className={styles.signUpText} style={{ marginTop: 4 }}>
                                Return?{" "}
                                <Link href="/" className={styles.signUpLink}>
                                    Go Back to Landing Page
                                </Link>
                            </p>
                        </>
                    ) : (
                        <AvatarSelection
                            onSelect={handleRegister}
                            onBack={handleBack}
                            isLoading={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </>
    );
}