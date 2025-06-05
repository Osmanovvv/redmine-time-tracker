"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRedmineStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Clock, Play } from "lucide-react"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
// import { getCurrentElapsed } from "@/lib/utils"

const PRIORITY_STYLES = {
	Immediate: {
		sidebar: "bg-red-700",
		badge: "bg-red-100 text-red-800 font-bold",
	},
	Urgent: {
		sidebar: "bg-red-500",
		badge: "bg-red-100 text-red-700",
	},
	High: {
		sidebar: "bg-orange-500",
		badge: "bg-orange-100 text-orange-700",
	},
	Normal: {
		sidebar: "bg-yellow-400",
		badge: "bg-yellow-100 text-yellow-700",
	},
	Low: {
		sidebar: "bg-gray-300",
		badge: "bg-gray-100 text-gray-700",
	},
} as const

type PriorityLevel = keyof typeof PRIORITY_STYLES

export function TaskList() {
	const { tasks, selectedTask, selectTask, sessions, isLoading, getProgressPercentage, getElapsedSeconds } = useRedmineStore()
	const [selectedProjectId, setSelectedProjectId] = useState<string>("all")

	const projects = useMemo(() => {
		const map = new Map<number, string>()
		tasks.forEach((task) => {
			if (task.project) {
				map.set(task.project.id, task.project.name)
			}
		})
		return Array.from(map.entries())
	}, [tasks])

	const filteredTasks = useMemo(() => {
		if (selectedProjectId === "all") return tasks
		return tasks.filter((task) => task.project?.id === Number(selectedProjectId))
	}, [tasks, selectedProjectId])

	if (isLoading) {
		return (
			<div className="p-4">
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="p-4 h-full overflow-auto">
			<h2 className="text-lg font-semibold mb-4">Активные задачи</h2>

			<div className="mb-4 w-64">
				<Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
					<SelectTrigger>
						<SelectValue placeholder="Фильтр по проекту" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Все проекты</SelectItem>
						{projects.map(([id, name]) => (
							<SelectItem key={id} value={String(id)}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-3">
				{filteredTasks.map((task) => {
					const isRunning = sessions.some((s) => s.taskId === task.id)
					const isSelectable = isRunning || sessions.length < 3
					const priority = (task.priority?.name ?? "Normal") as PriorityLevel

					// Получаем прогресс для задачи
					const progressPercentage = getProgressPercentage(task.id, task.estimated_hours)
					const elapsedSeconds = getElapsedSeconds(task.id)
					const elapsedHours = Math.round((elapsedSeconds / 3600) * 10) / 10

					return (
						<Card
							key={task.id}
							className={cn(
								"relative transition-colors pl-2",
								isSelectable ? "cursor-pointer hover:bg-muted/50" : "opacity-50 cursor-not-allowed",
								selectedTask?.id === task.id && "ring-2 ring-primary",
								isRunning && "bg-green-50 border-green-200"
							)}
							onClick={() => {
								if (isSelectable) {
									selectTask(task)
								}
							}}
						>
							<div
								className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l", PRIORITY_STYLES[priority].sidebar)}
							/>
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-sm text-muted-foreground">#{task.id}</span>
											{isRunning && (
												<div className="flex items-center gap-1 text-green-600">
													<Play className="w-3 h-3" />
													<Clock className="w-3 h-3" />
												</div>
											)}
										</div>
										<div className="mb-1">
											<Badge className={cn("text-xs", PRIORITY_STYLES[priority].badge)}>
												{priority}
											</Badge>
										</div>
										<h3 className="font-medium text-sm leading-tight line-clamp-2">
											{task.subject}
										</h3>
										<div className="mt-2">
											<div className="flex justify-between text-xs text-muted-foreground mb-1">
												<span>
													{elapsedHours}ч / {task.estimated_hours}ч
												</span>
												<span>{progressPercentage}%</span>
											</div>
											<Progress value={progressPercentage} className="h-1.5" />
										</div>

									</div>
									<div>
										<Badge
											variant={task.status.name === "In Progress" ? "default" : "secondary"}
											className="text-xs"
										>
											{task.status.name}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}

				{tasks.length === 0 && (
					<div className="text-center text-muted-foreground py-8">
						<Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>Нет активных задач</p>
					</div>
				)}
			</div>
		</div>
	)
}
