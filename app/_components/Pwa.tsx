"use client";

import { useEffect, useState } from "react";

// workboxの型定義拡張
declare global {
  interface Window {
    workbox?: any;
  }
}

export default function Pwa() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const sw = navigator.serviceWorker;

      // Service Workerの登録
      sw.register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker登録成功。スコープ: ", registration.scope);
          setRegistration(registration);

          // 既存のService Workerの状態確認
          if (registration.active) {
            console.log(
              "Service Worker アクティブ: ",
              registration.active.state
            );
          }

          // 更新イベント
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                console.log("Service Worker状態変更: ", installingWorker.state);

                // インストール完了時
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log(
                      "新しいコンテンツが利用可能です。更新してください。"
                    );
                    setUpdateAvailable(true);
                  } else {
                    console.log("コンテンツはオフラインで利用可能です。");
                  }
                }
              };
            }
          };

          // 定期的に更新をチェック
          setInterval(() => {
            registration.update();
          }, 60000); // 1分ごと
        })
        .catch((err) => {
          console.error("Service Worker登録失敗: ", err);
        });

      // Service Workerからのメッセージを受信
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SW_UPDATE_AVAILABLE") {
          setUpdateAvailable(true);
        }
      });
    } else {
      console.log("Service Workerがサポートされていません");
    }
  }, []);

  // アプリの更新を適用
  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  // キャッシュをクリア
  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("キャッシュをクリアしました");
      window.location.reload();
    } catch (error) {
      console.error("キャッシュクリアに失敗しました:", error);
    }
  };

  return (
    <>
      {/* 更新通知 */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">アップデートが利用可能です</h3>
              <p className="text-sm opacity-90">
                新しいバージョンが利用可能です。更新しますか？
              </p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={handleUpdate}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
              >
                更新
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* デバッグ用のキャッシュクリアボタン（開発時のみ表示） */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={clearCache}
          className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded text-sm z-40"
          title="キャッシュをクリア（開発用）"
        >
          🗑️ キャッシュクリア
        </button>
      )}
    </>
  );
}
