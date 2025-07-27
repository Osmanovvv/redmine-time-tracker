"use client"

import { useEffect } from "react"
import { useConfigStore } from "@/store/config"
import { SettingsPage } from "@/components/settings-page"
import { MainInterface } from "@/components/main-interface"

export default function HomePage() {
  const { isConfigured, loadConfig, hasHydrated } = useConfigStore()

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Показываем загрузку пока не завершена гидратация
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return <SettingsPage />
  }

  return <MainInterface />
}
