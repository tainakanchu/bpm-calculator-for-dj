// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.jsの設定
  experimental: {
    // Service Workerの最適化
    optimizePackageImports: ["@serwist/next"],
  },
};

// ESM形式で@serwist/nextをインポートして設定を行う関数
export default async function () {
  const { default: withSerwist } = await import("@serwist/next");

  return withSerwist({
    // 基本設定
    swSrc: "app/sw.ts", // Service Workerのソースファイル
    swDest: "public/sw.js", // 出力先
    disable: process.env.NODE_ENV !== "production", // 開発環境では無効化

    // キャッシュ設定
    cacheOnFrontEndNav: true, // フロントエンドナビゲーションをキャッシュ
    reloadOnOnline: true, // オンライン復帰時にリロード

    // マニフェスト生成設定
    additionalPrecacheEntries: [
      // 重要なページを明示的にプリキャッシュ
      { url: "/", revision: null },
      { url: "/manifest.webmanifest", revision: null },
    ],

    // 除外設定
    exclude: [
      // 不要なファイルを除外
      /\.map$/,
      /manifest$/,
      /\.DS_Store$/,
      /^build-manifest\.json$/,
      /^react-loadable-manifest\.json$/,
    ],

    // モード設定
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
  })(nextConfig);
}
