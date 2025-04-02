/// <reference lib="webworker" />

/**
 * このService Workerファイルは@serwist/nextによって処理され、
 * 最終的なService Workerコード（public/sw.js）が生成されます。
 */

import type { PrecacheEntry } from "@serwist/precaching";

// Service WorkerのグローバルスコープにWB_MANIFESTが追加されます
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: PrecacheEntry[];
};

// スキップウェイティングを有効化
self.addEventListener("install", () => {
  self.skipWaiting();
});

// クライアントコントロールを有効化
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * 注意：
 * このファイルの残りのコード（キャッシュ戦略等）は
 * @serwist/nextによって自動的に生成されます。
 * next.config.jsのruntimeCaching設定が使用されます。
 */
