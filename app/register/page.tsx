"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import {Button, Form, Input, message} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import Link from "next/link";
import {useState} from "react";
import AvatarSelection from "@/components/register/AvatarSelection";


interface FormFieldProps {
  username: string;
  password: string;
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

  const handleNextStep = (values: FormFieldProps) => {
    setTempFormData(values);
    setStep("avatar");
  };

  const handleRegister = async (avatarId: number) => {
    if (!tempFormData) return;

    setIsSubmitting(true);
    try {
      const finalData = {
        ...tempFormData,
        avatarId: avatarId
      };

      await apiService.post<User>("/users/register", finalData);

      const loginRes = await apiService.post<User>("/users/login", {
        username: tempFormData.username,
        password: tempFormData.password,
      });

      if (loginRes.token) {
        localStorage.setItem("token", JSON.stringify(loginRes.token));
        localStorage.setItem("userid", JSON.stringify(loginRes.id));
        localStorage.setItem("username", JSON.stringify(loginRes.username ?? ""));
        localStorage.setItem("avatarId", JSON.stringify(loginRes.avatarId));
      }
      

      router.push("/menu");
    } catch (err) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        messageApi.error("Register was not successful. Username is already taken.");
      } else {
        messageApi.error("An unknown error occurred");
      }
    }
  };

  return (
  <>
    {contextHolder}
    <div className={styles.pageBackground}>

      <div className={styles.logoArea}>
      <CodosseumLogo size={100} />
        <div className={styles.logoTexts}>
          <h1 className={styles.logoTitle}>Codosseum</h1>
          <p className={styles.logoSubtitle}>Join the coding arena</p>
        </div>
      </div>

      <div
          className={styles.card}
          style={step === "avatar" ? { paddingTop: '40px', paddingBottom: '20px' } : {}}
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
            name="bio"
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
              Next: Choose Avatar
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.signUpText}>
          Already have an account?{" "}
          <Link href="/" className={styles.signUpLink}>
            Sign in
          </Link>
        </p>
        </>
        ) : (
            <AvatarSelection
                onSelect={handleRegister}
                onBack={() => setStep("details")}
                isLoading={isSubmitting}
            />
            )}
      </div>
    </div>
    </>
  );
}
