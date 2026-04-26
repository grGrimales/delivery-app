import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/hooks/useConfig";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Delivery App",
  description: "Real-time delivery tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
