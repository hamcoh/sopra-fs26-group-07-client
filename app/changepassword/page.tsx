"use client";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import {Button, Form, Input, message} from "antd";
import {ArrowLeftOutlined, LockOutlined} from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import {getApiDomain} from "@/utils/domain";
import {useEffect, useState} from "react";
import type { NamePath } from "antd/es/form/interface";

type PasswordFormValues = {
  password: string;
  confirm: string;
};

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm<PasswordFormValues>();
  const { value: userId, loading: userIdLoading, clear: clearUserId } = useLocalStorage<string>("userid", "");
  const { value: token, loading: tokenLoading, clear: clearToken } = useLocalStorage("token", "");
  const { clear: clearUsername } = useLocalStorage("username", "Player");
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (tokenLoading || userIdLoading) return;

    if (!token) {
      messageApi.error("You must be logged in to change the password.",4);
      setIsLoading(false);
      setTimeout(() => router.push("/"), 4000);
      return;
    }

    setIsLoading(false);
    setIsAuthorized(true);

  }, [tokenLoading, router, messageApi]);

  const handlePasswordChange = async (values: PasswordFormValues) => {
    try {

      const res = await fetch(`${getApiDomain()}/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          newPassword: values.password,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update password");
      }

      messageApi.success("Password changed successfully!", 3);

      setTimeout(() => {
        clearToken();
        clearUsername();
        clearUserId();
        router.push("/");
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      } else {
        messageApi.error("An unknown error occurred");
      }
    }
  };

  // Loading-Page
  const isActuallyLoading = tokenLoading || isLoading;

  if (isActuallyLoading) {
    return (
        <div className={styles.pageBackground}>
          {contextHolder}
        </div>
    );
  }

  // Not-Authorized-Page
  if (!isAuthorized) {
    return (
        <div className={styles.pageBackground}>
          {contextHolder}
        </div>
    );
  }

  return (
      <>
        {contextHolder}
        <div className={styles.pageBackground}>
          <div className={`${styles.contentWrapper} ${styles.animContent}`}>
            <button className={styles.backButton} onClick={() => router.push("/profile")}>
              <ArrowLeftOutlined/> Back to Profile
            </button>
            <div className={styles.logoArea}>
              <CodosseumLogo size={100} />
              <div className={styles.logoTexts}>
                <h1 className={styles.logoTitle}>Change Password</h1>
                <p className={styles.logoSubtitle}>Update your account password</p>
              </div>
            </div>

            <div className={styles.card}>
              <Form<PasswordFormValues>
                  form={form}
                  name="PasswordChange"
                  onFinish={handlePasswordChange}
                  layout="vertical"
                  requiredMark={false}
              >
                <Form.Item
                    name="password"
                    hasFeedback
                    validateTrigger="onChange"
                    label={<span className={styles.fieldLabel}><span className={styles.requiredStar}>*</span> New Password</span>}
                    rules={[
                      {
                        validator: async (_, value) => {
                          if (!value || value.trim() === "")
                            return Promise.reject(new Error("Please input your new password!"));
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
                      placeholder="Enter new password"
                      size="large"
                      maxLength={101}
                      className={styles.input}
                  />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label="Confirm Password"
                    hasFeedback
                    validateTrigger="onChange"
                    dependencies={['password'] as NamePath<PasswordFormValues>[]}
                    rules={[
                      { required: true, message: "Please confirm your password!" },
                      ({ getFieldsValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldsValue().password === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("The two passwords do not match!"));
                        },
                      }),
                    ]}
                >
                  <Input.Password
                      prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
                      placeholder="Repeat your password"
                      size="large"
                      className={styles.input}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0, marginTop: 35 }}>
                  <Button
                      htmlType="submit"
                      block
                      size="large"
                      className={styles.signInButton}
                  >
                    Change password
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </>
  );
}
