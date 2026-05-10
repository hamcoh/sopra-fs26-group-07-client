"use client";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import {Button, Form, Input, message} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import CodosseumLogo from "@/components/CodosseumLogo";
import { useEffect } from "react";
import Link from "next/link";




interface FormFieldProps {
  username: string;
  password: string;
}



export default function Home() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("userid", "");
  const {set: setUserName} = useLocalStorage<string>("username", ""); // we also save the username in local storage to display it in the menu page without an additional api call. This is not strictly necessary but it improves user experience by avoiding a loading state for the username in the menu page. We could also save the whole user object in local storage, but that would be more complex and we only need the username for now, so we save it separately.
  const {set: setAvatar} = useLocalStorage<string>("avatarId", "");
  const [messageApi, contextHolder] = message.useMessage();


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { //only check if there is a token. Validity of token is then checked in the menu page and user is redirected to login if token is invalid
      router.push("/menu"); 
    }
  }, [router]);

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        setToken(response.token);
        setUserId(response.id || "");
        setUserName(response.username || "");
        setAvatar(response.avatarId ?? "");
      }
      router.push("/menu");
    } catch (err) {
      if (err instanceof Error) {
        messageApi.error("Login was not successful. Username/password is wrong");
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
          <p className={styles.logoSubtitle}>Enter the arena of code</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Welcome Back</h2>
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label={<span className={styles.fieldLabel}><span className={styles.requiredStar}>*</span> Username</span>}
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
            label={<span className={styles.fieldLabel}><span className={styles.requiredStar}>*</span> Password</span>}
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#BDBDBD" }} />}
              placeholder="········"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>
        <p className={styles.signUpText}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={styles.signUpLink}>
           Sign up
          </Link>

        </p>
      </div>

      <div className={styles.repoButtons}>
        <Button
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          }
          className={styles.repoButton}
          onClick={() => globalThis.open("https://github.com/hamcoh/sopra-fs26-group-07-client", "_blank", "noopener,noreferrer")}
        >
          Client Repo
        </Button>
        <Button
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          }
          className={styles.repoButton}
          onClick={() => globalThis.open("https://github.com/hamcoh/sopra-fs26-group-07-server", "_blank", "noopener,noreferrer")}
        >
          Server Repo
        </Button>
      </div>
    </div>
    </>
  );
}
