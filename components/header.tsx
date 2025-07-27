"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import { useRedmineStore } from "@/lib/store"
import { useTasksStore } from "@/store/tasks"
import { useConfigStore } from "@/store/config"
import { useTimerStore } from "@/store/timer"
import { Timer, Settings, RefreshCw } from "lucide-react"
import { formatTime, getCurrentElapsed } from "@/lib/utils"

export function Header() {
	const { sessions, cleanup } = useTimerStore()
	const { clearConfig } = useConfigStore()
	const { loadTasks, isLoading, userRole } = useTasksStore()

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			cleanup()
		}
	}, [cleanup])

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "Manager":
				return "default"
			case "Developer":
				return "secondary"
			default:
				return "outline"
		}
	}

	return (
		<header className="h-16 border-b bg-background flex items-center justify-between px-6">
			<div className="flex items-center gap-2">
				<Timer className="w-6 h-6 text-primary" />
				<h1 className="text-xl font-semibold">Redmine Time Tracker</h1>
				{userRole !== "Other" && (
					<div className="flex items-center gap-2 ml-4">
						{/* <Shield className="w-4 h-4 text-muted-foreground" /> */}
						<Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
							{userRole}
						</Badge>
					</div>
				)}
			</div>

			{Array.isArray(sessions) && sessions.length > 0 && (
				(() => {
					const activeSession = sessions.find(s => s.isRunning)
					if (!activeSession) return null

					return (
						<div className="flex items-center gap-2 text-sm">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							<span>Активная сессия: {formatTime(getCurrentElapsed(activeSession))}</span>
						</div>
					)
				})()
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
