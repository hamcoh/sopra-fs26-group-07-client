"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import Link from "next/link";


interface FormFieldProps {
  username: string;
  password: string;
  biography?: string;
}



export default function RegisterPage() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const handleRegister = async (values: FormFieldProps) => {
    try {
      await apiService.post<User>("/users/register", values);

      const loginRes = await apiService.post<User>("/users/login", {
        username: values.username,
        password: values.password,
      });

      if (loginRes.token) {
        localStorage.setItem("token", JSON.stringify(loginRes.token));
        localStorage.setItem("userid", JSON.stringify(loginRes.id));
        localStorage.setItem("username", JSON.stringify(loginRes.username ?? ""));
      }
      

      router.push("/menu");
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
      {/* Logo */}
      <div className={styles.logoArea}>
      <CodosseumLogo size={100} />
        <div className={styles.logoTexts}>
          <h1 className={styles.logoTitle}>Codosseum</h1>
          <p className={styles.logoSubtitle}>Join the coding arena</p>
        </div>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Create Account</h2>
        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label={
              <span className={styles.fieldLabel}>
                <span className={styles.requiredStar}>*</span> Username
              </span>
            }
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#BDBDBD" }} />}
              placeholder="CodeMaster"
              size="large"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span className={styles.fieldLabel}>
                <span className={styles.requiredStar}>*</span> Password
              </span>
            }
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
              placeholder="········"
              size="large"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="biography"
            label={<span className={styles.fieldLabel}>Biography</span>}
          >
            <Input.TextArea
              placeholder="Tell us about yourself..."
              rows={3}
              className={styles.textarea}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              htmlType="submit"
              block
              size="large"
              className={styles.signInButton}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.signUpText}>
          Already have an account?{" "}
          <Link href="/" className={styles.signUpLink}>
            Sign in
          </Link>

        </p>
      </div>
    </div>
  );
}
