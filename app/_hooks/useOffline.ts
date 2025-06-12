"use client";

import { useState, useEffect } from "react";

interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
}

export function useOffline(): OfflineState {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // 初期状態を設定
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // オフラインから復帰したことを記録
      if (!navigator.onLine) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // イベントリスナーを追加
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // クリーンアップ
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

// キャッシュ管理のためのユーティリティ関数
export const cacheUtils = {
  // キャッシュサイズを取得
  async getCacheSize(): Promise<number> {
    if (!("caches" in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error("キャッシュサイズの取得に失敗:", error);
      return 0;
    }
  },

  // キャッシュをクリア
  async clearAllCaches(): Promise<void> {
    if (!("caches" in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("すべてのキャッシュをクリアしました");
    } catch (error) {
      console.error("キャッシュクリアに失敗:", error);
      throw error;
    }
  },

  // 特定のキャッシュをクリア
  async clearCache(cacheName: string): Promise<void> {
    if (!("caches" in window)) return;

    try {
      await caches.delete(cacheName);
      console.log(`キャッシュ "${cacheName}" をクリアしました`);
    } catch (error) {
      console.error(`キャッシュ "${cacheName}" のクリアに失敗:`, error);
      throw error;
    }
  },

  // キャッシュ一覧を取得
  async getCacheNames(): Promise<string[]> {
    if (!("caches" in window)) return [];

    try {
      return await caches.keys();
    } catch (error) {
      console.error("キャッシュ一覧の取得に失敗:", error);
      return [];
    }
  },
};
