"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRedmineStore } from "@/lib/store"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { Clock, Play, Search, Building, GitBranch, Loader2 } from "lucide-react"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select"
import { ProgressBar } from "./ProgressBar"

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
	const { tasks,
		filteredTasks,
		selectedTask,
		selectTask,
		sessions,
		isLoading,
		isSearching,
		searchQuery,
		setSearchQuery,
		selectedProjectId,
		setSelectedProjectId,
		selectedVersionId,
		setSelectedVersionId,
		projects,
		versions,
		searchTasks,
	} = useRedmineStore()
	// const [selectedProjectId, setSelectedProjectId] = useState<string>("all")

	// const projects = useMemo(() => {
	// 	const map = new Map<number, string>()
	// 	tasks.forEach((task) => {
	// 		if (task.project) {
	// 			map.set(task.project.id, task.project.name)
	// 		}
	// 	})
	// 	return Array.from(map.entries())
	// }, [tasks])

	// const filteredTasks = useMemo(() => {
	// 	if (selectedProjectId === "all") return tasks
	// 	return tasks.filter((task) => task.project?.id === Number(selectedProjectId))
	// }, [tasks, selectedProjectId])

	// Debounce поискового запроса на 700мс
	const debouncedSearchQuery = useDebounce(searchQuery, 700)

	// Выполняем поиск при изменении debounced значения
	useEffect(() => {
		if (debouncedSearchQuery !== undefined) {
			searchTasks(debouncedSearchQuery)
		}
	}, [debouncedSearchQuery, searchTasks])

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
			<div className="space-y-4 mb-4">
				<h2 className="text-lg font-semibold">Активные задачи</h2>

				{/* Поиск */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					{isSearching && (
						<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
					)}
					<Input
						placeholder="Поиск по названию, номеру, описанию..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-10"
					/>
				</div>

				{/* Показываем подсказку о поиске */}
				{searchQuery.length > 0 && searchQuery.length < 2 && (
					<div className="text-xs text-muted-foreground px-2">Введите минимум 2 символа для поиска</div>
				)}

				{/* Фильтры */}
				<div className="grid grid-cols-1 gap-3">
					{/* Фильтр по проекту */}
					<div className="flex items-center gap-2">
						<Building className="w-4 h-4 text-muted-foreground" />
						<Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Все проекты" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Все проекты</SelectItem>
								{projects.map((project) => (
									<SelectItem key={project.id} value={project.id.toString()}>
										{project.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Фильтр по спринту/версии */}
					{/* <div className="flex items-center gap-2">
						<GitBranch className="w-4 h-4 text-muted-foreground" />
						<Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Все спринты" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все спринты</SelectItem>
							<SelectItem value="none">Без спринта</SelectItem>
							{versions.map((version) => (
							<SelectItem key={version.id} value={version.id.toString()}>
								{version.name} ({version.status})
							</SelectItem>
							))}
						</SelectContent>
						</Select>
					</div> */}
				</div>
			</div>

			<div className="space-y-3">
				{filteredTasks.map((task) => {
					const isRunning = sessions.some((s) => s.taskId === task.id)
					const isSelectable = isRunning || sessions.length < 3
					const priority = (task.priority?.name ?? "Normal") as PriorityLevel

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
										<h3 className="font-medium text-sm leading-tight line-clamp-2">{task.subject}</h3>


										{/* Проект и спринт */}
										<div className="flex flex-wrap gap-1 mt-2">
											{task.project && (
												<Badge variant="outline" className="text-xs">
													<Building className="w-3 h-3 mr-1" />
													{task.project.name}
												</Badge>
											)}
											{/* {task.fixed_version && (
												<Badge variant="outline" className="text-xs">
													<GitBranch className="w-3 h-3 mr-1" />
													{task.fixed_version.name}
												</Badge>
											)} */}
										</div>

										<ProgressBar taskId={task.id} estimatedHours={task.estimated_hours ?? null} />
									</div>
									<div>
										<Badge
											variant={task.status.name === "In Progress" ? "default" : "secondary"}
											className="text-xs w-[80px] text-center"
										>
											{task.status.name}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}

				{filteredTasks.length === 0 && !isSearching && (
					<div className="text-center text-muted-foreground py-8">
						<Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
						{/* <p>{searchQuery || selectedProjectId || selectedVersionId ? "Задачи не найдены" : "Нет активных задач"}</p> */}
						{/* {(searchQuery || selectedProjectId || selectedVersionId) && (
							<p className="text-sm mt-2">Попробуйте изменить критерии поиска или фильтры</p>
						)} */}
						<p>{searchQuery ? "Задачи не найдены" : "Нет активных задач"}</p>
						{searchQuery && <p className="text-sm mt-2">Попробуйте изменить поисковый запрос или очистить фильтры</p>}
					</div>
				)}

				{isSearching && (
					<div className="text-center text-muted-foreground py-8">
						<Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
						<p>Поиск задач...</p>
					</div>
				)}
			</div>
		</div>
	)
}