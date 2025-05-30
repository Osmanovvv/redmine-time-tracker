"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRedmineStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Clock, Play } from "lucide-react"

export function TaskList() {
	const { tasks, selectedTask, selectTask, sessions, isLoading } = useRedmineStore()

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
			<div className="space-y-3">
				{tasks.map((task) => {
					const isRunning = Array.isArray(sessions) && sessions.some(s => s.taskId === task.id)
					const canRunMore = Array.isArray(sessions) && sessions.length < 3
					const isSelectable = isRunning || canRunMore

					return (
						<Card
							key={task.id}
							className={cn(
								"transition-colors",
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
										<h3 className="font-medium text-sm leading-tight line-clamp-2">{task.subject}</h3>
									</div>
									<Badge variant={task.status.name === "In Progress" ? "default" : "secondary"} className="text-xs">
										{task.status.name}
									</Badge>
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
