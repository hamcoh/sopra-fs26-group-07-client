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

  const handleNextStep = async (values: FormFieldProps) => {
    setIsSubmitting(true);
    try {

      await apiService.get(`/users/check/${values.username}`);

      setTempFormData(values);
      setStep("avatar");
    } catch (err) {
      form.setFields([
        {
          name: "username",
          errors: ["Username already taken!"],
        },
      ]);
      console.log("This username is not available.");
    } finally {
      setIsSubmitting(false);
    }
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
                    if (!value || value.trim() === "") {
                      return Promise.reject(new Error("Please input your username!"));
                    }
                    if (value.length < 3) {
                      return Promise.reject(new Error("Username must be at least 3 characters!"));
                    }
                    if (value.length > 20) {
                      return Promise.reject(new Error("Username cannot exceed 20 characters!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
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
              hasFeedback
              label={
                <span className={styles.fieldLabel}>
                  <span className={styles.requiredStar}>*</span> Password
                </span>
              }
              validateTrigger="onChange"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 8, message: "Password must be at least 8 characters long" },
                { max: 100, message: "Password cannot exceed 100 characters" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+\-._#])/,
                  message: "Must contain uppercase, lowercase, a number and a symbol",
                },
              ]}
          >
            <Input.Password
                prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
                placeholder="Minimum 8 characters"
                size="large"
                maxLength={101}
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
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!"
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
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
                maxLength={101}
                className={styles.input}
            />
          </Form.Item>

          <Form.Item
              name="bio"
              label={<span className={styles.fieldLabel}>Biography</span>}
              validateTrigger="onChange"
              rules={[
                {
                  max: 50,
                  message: "Biography cannot exceed 50 characters!",
                },
              ]}
          >
            <Input.TextArea
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={50}
                showCount
                style={{ resize: 'none' }}
                className={styles.textarea}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              htmlType="submit"
              block
              size="large"
              className={styles.signInButton}
              loading={isSubmitting}
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
