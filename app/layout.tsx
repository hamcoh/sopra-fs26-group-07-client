import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Group 07 - Codosseum",
  description: "sopra-fs26-template-client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#7B4FF0",
              borderRadius: 8,
              colorText: "#1A1A2E",
              fontSize: 16,
              colorBgContainer: "#ffffff",
            },
            components: {
              Button: {
                colorPrimary: "#7B4FF0",
                algorithm: true,
                controlHeight: 38,
              },
              Input: {
                colorBorder: "#E0E0E0",
                colorTextPlaceholder: "#BDBDBD",
                colorText: "#1A1A2E",
                colorBgContainer: "#ffffff",
                algorithm: false,
              },
              Form: {
                labelColor: "#1A1A2E",
                algorithm: theme.defaultAlgorithm,
              },
              Card: {},
            },
          }}
        >
          <AntdRegistry>
            <AntdApp>{children}</AntdApp>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
