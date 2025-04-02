// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.jsの設定
};

// ESM形式で@serwist/nextをインポートして設定を行う関数
export default async function () {
  const { default: withSerwist } = await import("@serwist/next");

  return withSerwist({
    // 基本設定
    swSrc: "app/sw.ts", // Service Workerのソースファイル
    swDest: "public/sw.js", // 出力先
    disable: process.env.NODE_ENV !== "production", // 開発環境では無効化
    // register: trueを削除 - 最新バージョンでは非対応
    // skipWaitingを削除 - 最新バージョンでは非対応
    // runtimeCachingを削除 - 最新バージョンでは非対応
  })(nextConfig);
}
