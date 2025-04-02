/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from "@serwist/precaching";

// マニフェスト定義
declare const self: ServiceWorkerGlobalScope & {
  // Serwistが生成するマニフェスト
  __SW_MANIFEST: any[];
};

// 古いキャッシュをクリーンアップ
cleanupOutdatedCaches();

// マニフェストからリソースをプリキャッシュ
precacheAndRoute(self.__SW_MANIFEST);

// Service Workerのインストール時
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  // 即座にアクティブ化
  self.skipWaiting();
});

// Service Workerのアクティベーション時
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  // クライアントをコントロール
  if ("clients" in self) {
    const clients = self.clients as Clients;
    event.waitUntil(clients.claim());
  }
});

// MessageイベントでSKIP_WAITINGを処理
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// キャッシュは@serwist/nextにより自動生成されます
