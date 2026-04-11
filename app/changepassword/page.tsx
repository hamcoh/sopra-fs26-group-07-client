"use client";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import {Button, Form, Input, message} from "antd";
import {ArrowLeftOutlined, LockOutlined} from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import {getApiDomain} from "@/utils/domain";
import {useEffect, useState} from "react";



export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { value: userId, loading: userIdLoading, clear: clearUserId } = useLocalStorage<string>("userid", "");
  const { value: token, loading: tokenLoading, clear: clearToken } = useLocalStorage("token", "");
  const { clear: clearUsername } = useLocalStorage("username", "Player");
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  type PasswordFormValues = {
    password: string;
  };

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
      clearToken()
      clearUsername();
      clearUserId();
      router.push("/");
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
      <div className={styles.contentWrapper}>
      <button className={styles.backButton} onClick={() => router.push("/menu")}>
        <ArrowLeftOutlined/> Back to Menu
      </button>
      <div className={styles.logoArea}>
      <CodosseumLogo size={100} />
        <div className={styles.logoTexts}>
          <h1 className={styles.logoTitle}>Change Password</h1>
          <p className={styles.logoSubtitle}>Update your account password</p>
        </div>
      </div>

      <div className={styles.card}>
        <Form
          form={form}
          name="PasswordChange"
          onFinish={handlePasswordChange}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label={<span className={styles.fieldLabel}><span className={styles.requiredStar}>*</span> New Password</span>}
            rules={[{ required: true, message: "Please input your new password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
              placeholder="Enter new password"
              size="large"
              className={styles.input}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
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
