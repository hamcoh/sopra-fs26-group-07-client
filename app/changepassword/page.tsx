"use client";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";
import {LockOutlined} from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import {getApiDomain} from "@/utils/domain";



export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const userid = typeof window !== "undefined" ? localStorage.getItem("userid") : null;
  const { value: token, clear: clearToken } = useLocalStorage("token", "");
  type PasswordFormValues = {
    password: string;
  };
  const handlePasswordChange = async (values: PasswordFormValues) => {
    try {

      if (!userid || !token) {
        alert("Missing user or token");
        return;
      }

      const res = await fetch(`${getApiDomain()}/users/${userid}/password`, {
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
      localStorage.removeItem("username");
      localStorage.removeItem("userid");
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong:\n${error.message}`);
      } else {
        console.error("Unknown error");
      }
    }
  };

  return (
    <div className={styles.pageBackground}>
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
  );
}
