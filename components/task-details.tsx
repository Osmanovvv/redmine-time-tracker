"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRedmineStore } from "@/lib/store"
import { Play, Pause, Square, Clock, User, Calendar } from "lucide-react"
import { formatTime, getCurrentElapsed } from "@/lib/utils"

export function TaskDetails() {
	const { selectedTask, sessions, startTimer, pauseTimer, finishTimer, canStartTask } = useRedmineStore()

	if (!selectedTask) {
		return (
			<div className="p-6 h-full flex items-center justify-center">
				<div className="text-center text-muted-foreground">
					<Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
					<p className="text-lg">Выберите задачу для просмотра деталей</p>
				</div>
			</div>
		)
	}

	const isCurrentTask = Array.isArray(sessions)
		? sessions.find(s => s.taskId === selectedTask.id)
		: null;
	const isRunning = isCurrentTask?.isRunning ?? false

	const handleStart = () => {
		if (!canStartTask(selectedTask.id)) {
			// Показать предупреждение о том, что другая задача активна
			return
		}
		startTimer(selectedTask.id)
	}

	return (
		<div className="p-6 h-full overflow-auto">
			<div className="w-full">
				<div className="mb-6">
					<div className="flex items-start justify-between gap-4 mb-4">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<span className="text-sm text-muted-foreground">#{selectedTask.id}</span>
								<Badge variant={selectedTask.status.name === "In Progress" ? "default" : "secondary"}>
									{selectedTask.status.name}
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">{selectedTask.subject}</h1>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<User className="w-4 h-4" />
							<span>{selectedTask.assigned_to?.name || "Не назначен"}</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="w-4 h-4" />
							<span>Создано: {new Date(selectedTask.created_on).toLocaleDateString()}</span>
							<Calendar className="w-4 h-4" />
							<span>Обновлено: {new Date(selectedTask.updated_on).toLocaleDateString()}</span>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6		">
							<div className="flex flex-col items-center bg-muted/40 rounded-xl p-4 text-center shadow">
								<div className="flex items-center gap-2 text-muted-foreground mb-1">
									<Clock className="w-4 h-4 text-primary" />
									<span className="text-sm font-medium text-primary">Оценка</span>
								</div>
								<div className="text-lg font-semibold">{selectedTask.estimated_hours ?? "—"} ч.</div>
							</div>

							<div className="flex flex-col items-center bg-muted/40 rounded-xl p-4 text-center shadow">
								<div className="flex items-center gap-2 text-muted-foreground mb-1">
									<Square className="w-4 h-4 text-yellow-500" />
									<span className="text-sm font-medium text-yellow-600">Готовность</span>
								</div>
								<div className="text-lg font-semibold">{selectedTask.done_ratio ?? 0}%</div>
								{/* <span className="w-[50px] text-right">{progressPercentage}%</span> */}
							</div>

							<div className="flex flex-col items-center bg-muted/40 rounded-xl p-4 text-center shadow">
								<div className="flex items-center gap-2 text-muted-foreground mb-1">
									<User className="w-4 h-4 text-rose-500" />
									<span className="text-sm font-medium text-rose-600">Приоритет</span>
								</div>
								<div className="text-lg font-semibold">{selectedTask.priority?.name ?? "—"}</div>
							</div>
						</div>
					</div>

					{selectedTask.description && (
						<Card className="mb-6">
							<CardHeader>
								<CardTitle className="text-lg">Описание</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="prose prose-sm max-w-none">
									<p className="whitespace-pre-wrap">{selectedTask.description}</p>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="w-5 h-5" />
							Трекинг времени
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isCurrentTask && (
							<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-green-800">Текущая сессия</span>
									<span className="text-lg font-mono text-green-800">
										{formatTime(getCurrentElapsed(isCurrentTask))}
									</span>
								</div>
							</div>
						)}

						<div className="flex gap-2">
							{!isCurrentTask ? (
								<Button onClick={handleStart} className="flex items-center gap-2">
									<Play className="w-4 h-4" />
									Начать работу
								</Button>
							) : (
								<>
									{isRunning ? (
											<Button
												variant="outline"
												onClick={() => pauseTimer(selectedTask.id)}
												className="flex items-center gap-2"
											>
												<Pause className="w-4 h-4" />
												Пауза
											</Button>									  
									) : (
										<Button onClick={() => startTimer(selectedTask.id)} className="flex items-center gap-2">
											<Play className="w-4 h-4" />
											Продолжить
										</Button>
									)}
										<Button
											variant="destructive"
											onClick={() => finishTimer(selectedTask.id)}
											className="flex items-center gap-2"
										>
											<Square className="w-4 h-4" />
											Завершить
										</Button>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
