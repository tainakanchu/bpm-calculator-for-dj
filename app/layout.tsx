import "./globals.css";
import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import Pwa from "./_components/Pwa";
import OfflineIndicator from "./_components/OfflineIndicator";

const bizUd = BIZ_UDPGothic({
  weight: "400",
  subsets: ["latin"],
});

const title = "BPM Calculator";
const name = "BPM Calculator for DJs";
const description = "Intelligent BPM Calculator for DJs";
const abstract =
  "Intelligent BPM Calculator for DJs. BPM is calculated from the result of multiple taps of the button. It also displays the result of the division set based on the result.";
const url = "https://bpm-calculator.vercel.app/";

const ogImagePath = "./image/ogp.png";

export const metadata: Metadata = {
  title,
  description,
  applicationName: name,
  authors: [
    {
      url: "https://github.com/tainakanchu",
      name: "tainakanchu",
    },
  ],
  keywords: [
    "BPM",
    "DJ",
    "BPM Calculator",
    "BPM計算",
    "BPM計算機",
    "BPM計算アプリ",
    "ポリリズム",
  ],
  themeColor: "#080808",
  colorScheme: "dark",
  icons: ["./icon.png"],
  abstract,
  openGraph: {
    title,
    siteName: name,
    type: "website",
    images: [ogImagePath],
    description,
    locale: "ja_JP",
    url: url,
  },
  twitter: {
    card: "summary_large_image",
    site: url,
    title,
    description,
    images: [ogImagePath],
  },
  appleWebApp: true,
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
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <link rel="icon" href="/favicon.png"></link>
        <meta name="theme-color" content="#080808" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="BPM Calculator" />
        <meta
          name="google-site-verification"
          content="JwWIxoPltJpLgYWfsb-bRZa5r5_DrvCg_IeBAATCJo0"
        />
      </head>
      <body className={bizUd.className}>
        {children}
        <OfflineIndicator />
        <Pwa />
        <Analytics />
      </body>
    </html>
  );
}
