"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRedmineStore } from "@/lib/store"
import { Timer, Settings, RefreshCw } from "lucide-react"
import { formatTime, getCurrentElapsed } from "@/lib/utils"

export function Header() {
  const { currentSession, clearConfig, loadTasks, isLoading, cleanup } = useRedmineStore()

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Timer className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold">Redmine Time Tracker</h1>
      </div>

      {currentSession && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Активная сессия: {formatTime(getCurrentElapsed(currentSession))}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={loadTasks} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
        <Button variant="outline" size="sm" onClick={clearConfig}>
          <Settings className="w-4 h-4" />
          Настройки
        </Button>
      </div>
    </header>
  )
}
