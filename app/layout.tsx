import "./globals.css";
import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";
import Pwa from "./_components/Pwa";

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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon.png"></link>
        <link rel="icon" href="/favicon.png"></link>
        <meta name="theme-color" content="#080808" />
      </head>
      <body className={bizUd.className}>
        {children}
        <Pwa />
      </body>
    </html>
  );
}
