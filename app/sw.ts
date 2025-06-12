/// <reference lib="webworker" />

import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  getCacheKeyForURL,
} from "@serwist/precaching";
import {
  Serwist,
  NavigationRoute,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
  CacheableResponsePlugin,
  ExpirationPlugin,
  type RouteMatchCallbackOptions,
} from "serwist";

// マニフェスト定義
declare const self: ServiceWorkerGlobalScope & {
  // Serwistが生成するマニフェスト
  __SW_MANIFEST: any[];
};

// Serwistインスタンスを作成
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: process.env.NODE_ENV === "production",
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
  },
  runtimeCaching: [
    // 画像ファイルのキャッシュ戦略（CacheFirst - 長期間キャッシュ）
    {
      matcher: ({ request }: RouteMatchCallbackOptions) =>
        request.destination === "image",
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
          }),
        ],
      }),
    },
    // CSS・JSファイルのキャッシュ戦略（StaleWhileRevalidate - バックグラウンド更新）
    {
      matcher: ({ request }: RouteMatchCallbackOptions) =>
        request.destination === "style" || request.destination === "script",
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      }),
    },
    // フォントファイルのキャッシュ戦略
    {
      matcher: ({ request }: RouteMatchCallbackOptions) =>
        request.destination === "font",
      handler: new CacheFirst({
        cacheName: "fonts",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
          }),
        ],
      }),
    },
    // Google Fontsのキャッシュ戦略
    {
      matcher: ({ url }: RouteMatchCallbackOptions) =>
        url.origin === "https://fonts.googleapis.com",
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    {
      matcher: ({ url }: RouteMatchCallbackOptions) =>
        url.origin === "https://fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
          }),
        ],
      }),
    },
    // APIリクエストのキャッシュ戦略（NetworkFirst - ネットワーク優先、オフライン時はキャッシュ）
    {
      matcher: ({ url }: RouteMatchCallbackOptions) =>
        url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5分
          }),
        ],
      }),
    },
  ],
});

// ナビゲーションリクエストのオフライン対応
const navigationHandler = async (params: any) => {
  try {
    // ネットワークから取得を試行
    return await new NetworkFirst({
      cacheName: "pages",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }).handle(params);
  } catch (error) {
    // オフライン時はプリキャッシュされたindex.htmlを返す
    const fallbackResponse = await serwist.matchPrecache("/");
    if (fallbackResponse) {
      return fallbackResponse;
    }

    // フォールバックページを作成
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>オフライン - BPM Calculator</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #080808;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              text-align: center;
            }
            .offline-container {
              max-width: 400px;
              padding: 2rem;
            }
            .offline-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .offline-title {
              font-size: 1.5rem;
              margin-bottom: 1rem;
            }
            .offline-message {
              opacity: 0.8;
              line-height: 1.6;
            }
            .retry-button {
              background: #007acc;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              margin-top: 1.5rem;
              cursor: pointer;
              font-size: 1rem;
            }
            .retry-button:hover {
              background: #005a9e;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1 class="offline-title">オフラインモード</h1>
            <p class="offline-message">
              現在インターネットに接続されていません。<br>
              BPM Calculatorの基本機能は引き続きご利用いただけます。
            </p>
            <button class="retry-button" onclick="window.location.reload()">
              再試行
            </button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
};

serwist.registerRoute(new NavigationRoute(navigationHandler));

// オフライン/オンライン状態の変更を検知
self.addEventListener("online", () => {
  console.log("オンラインになりました");
});

self.addEventListener("offline", () => {
  console.log("オフラインになりました");
});

// バックグラウンド同期（将来的な拡張用）
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("バックグラウンド同期実行");
  }
});

// Serwistのイベントリスナーを追加
serwist.addEventListeners();
