import "./globals.css";
import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";

const bizUd = BIZ_UDPGothic({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BPM Calculator",
  description: "Intelligent BPM Calculator for DJs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={bizUd.className}>{children}</body>
    </html>
  );
}
