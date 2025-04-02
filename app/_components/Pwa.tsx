"use client";

import { useEffect } from "react";

// workboxの型定義拡張
declare global {
  interface Window {
    workbox?: any;
  }
}

export default function Pwa() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const sw = navigator.serviceWorker;

      // Service Workerの登録
      sw.register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker登録成功。スコープ: ", registration.scope);

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
              };
            }
          };
        })
        .catch((err) => {
          console.error("Service Worker登録失敗: ", err);
        });
    } else {
      console.log("Service Workerがサポートされていません");
    }
  }, []);

  return <></>;
}
