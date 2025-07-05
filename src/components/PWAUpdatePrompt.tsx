import { useRegisterSW } from 'virtual:pwa-register/react'

function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker登録成功。スコープ:', r?.scope)
    },
    onRegisterError(error) {
      console.error('Service Worker登録失敗:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <>
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 left-4 z-50 bg-zinc-800 p-4 rounded-lg shadow-lg">
          <div className="text-white">
            {offlineReady ? (
              <span>アプリはオフラインで使用できます</span>
            ) : (
              <span>新しいバージョンが利用可能です</span>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            {needRefresh && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => updateServiceWorker(true)}
              >
                更新
              </button>
            )}
            <button
              className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700"
              onClick={() => close()}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PWAUpdatePrompt