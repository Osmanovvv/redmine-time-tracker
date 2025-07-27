"use client"

import { useState, useEffect } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTasksStore } from "@/store/tasks"
import { useActivitiesStore } from "@/store/activities"
import { useStatusesStore } from "@/store/statuses"
import { useModalStore } from "@/store/modal"
import { useTimeLogStore } from "@/store/timeLog"
import { Clock, Send, Shield, Lock, ArrowRight } from "lucide-react"

export function TimeLogModal() {
	const { selectedTask, userRole } = useTasksStore()
	const { activities, loadActivities } = useActivitiesStore()
	const { loadStatuses, getFilteredStatuses, canChangeStatus } = useStatusesStore()
	const { timeLogModal, closeTimeLogModal } = useModalStore()
	const { submitTimeLog } = useTimeLogStore()

	const [hours, setHours] = useState("")
	const [comments, setComments] = useState("")
	const [activityId, setActivityId] = useState("")
	const [statusId, setStatusId] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Получаем отфильтрованные статусы для текущей задачи
	const filteredStatuses = selectedTask ? getFilteredStatuses(selectedTask.status.name, userRole) : []
	const canChangeTaskStatus = selectedTask ? canChangeStatus(selectedTask.status.name, userRole) : false

	useEffect(() => {
		if (timeLogModal.isOpen && timeLogModal.duration) {
			// Правильно округляем до 0.1 часа
			const calculatedHours = Math.round((timeLogModal.duration / 1000 / 3600) * 10) / 10
			setHours(calculatedHours.toString())
			setComments("")
			setActivityId("")
			setStatusId("")

			// Загружаем список активностей и статусов
			loadActivities()
			loadStatuses()
		}
	}, [timeLogModal.isOpen, timeLogModal.duration, loadActivities, loadStatuses])

	const handleSubmit = async () => {
		if (!selectedTask || !hours || !comments.trim() || !activityId) return

		setIsSubmitting(true)
		try {
			await submitTimeLog({
				issueId: selectedTask.id,
				hours: Number.parseFloat(hours),
				comments: comments.trim(),
				spentOn: new Date().toISOString().split("T")[0],
				activityId: Number.parseInt(activityId),
				statusId: Number.parseInt(statusId),
			})
			closeTimeLogModal()
		} catch (error) {
			console.error("Ошибка отправки лога:", error)
		} finally {
			setIsSubmitting(false)
		}
	}

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

	const getStatusChangeMessage = () => {
		if (!selectedTask) return ""

		const currentStatus = selectedTask.status.name.toLowerCase()

		if (userRole === "Developer") {
			switch (currentStatus) {
				case "new":
					return "Статус 'New' нельзя изменить"
				case "to review":
					return "Можно изменить только на 'On merge'"
				default:
					return "Доступны статусы: New, To Review, On merge"
			}
		}

		if (userRole === "Manager") {
			return "Доступны все статусы"
		}

		return "Нет прав для изменения статуса"
	}

	return (
		<Dialog open={timeLogModal.isOpen} onOpenChange={closeTimeLogModal}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Clock className="w-5 h-5" />
						Завершение сессии
					</DialogTitle>

					<DialogDescription>
						Отправить лог времени в Redmine для задачи #{selectedTask?.id}
						<span className="flex items-center gap-2 mt-2">
							<Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
								{userRole}
							</Badge>
						</span>
					</DialogDescription>

				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="hours">Время (часы)</Label>
						<Input
							id="hours"
							type="text"
							value={hours}
							onChange={(e) => setHours(e.target.value)}
							placeholder="Пример: 1.5 или 1h 30m (мин. 0.1 ч)"
						/>
						<div className="text-xs">
							<p>Use the format:</p>
							<ul className="list-disc list-inside">
								<li>w = weeks</li>
								<li>d = days</li>
								<li>h = hours</li>
								<li>m = minutes</li>
							</ul>
						</div>

					</div>

					<div className="flex gap-4">
						<div className="flex-1 space-y-2">
							<Label htmlFor="activity">Тип активности *</Label>
							<Select value={activityId} onValueChange={setActivityId}>
								<SelectTrigger>
									<SelectValue placeholder="Выберите тип активности" />
								</SelectTrigger>
								<SelectContent>
									{activities.map((activity) => (
										<SelectItem key={activity.id} value={activity.id.toString()}>
											{activity.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex-1 space-y-2">
							<Label htmlFor="status" className="flex items-center gap-2">
								Статус
								{!canChangeTaskStatus && <Lock className="w-3 h-3 text-muted-foreground" />}
							</Label>
							<Select value={statusId} onValueChange={setStatusId} disabled={!canChangeTaskStatus}>
								<SelectTrigger id="status">
									<SelectValue
										placeholder={
											!canChangeTaskStatus
												? "Изменение запрещено"
												: filteredStatuses.length === 0
													? "Нет доступных статусов"
													: "Изменить статус"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Не изменять</SelectItem>
									{filteredStatuses.map((status) => (
										<SelectItem key={status.id} value={status.id.toString()}>
											{status.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* {selectedTask && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm flex-wrap">
								<span className="text-muted-foreground">Текущий статус:</span>
								<Badge variant="outline" className="text-xs">
									{selectedTask.status.name}
								</Badge>
								{canChangeTaskStatus && filteredStatuses.length > 0 && (
									<>
										<ArrowRight className="w-3 h-3 text-muted-foreground" />
										<span className="text-muted-foreground">Доступно:</span>
										{filteredStatuses.map((status, index) => (
											<Badge key={status.id} variant="secondary" className="text-xs">
												{status.name}
												{index < filteredStatuses.length - 1 && ","}
											</Badge>
										))}
									</>
								)}
							</div>

							<div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
								<div className="flex items-center gap-2">
									<Shield className="w-3 h-3" />
									<span>{getStatusChangeMessage()}</span>
								</div>
							</div>
						</div>
					)} */}

					<div className="space-y-2">
						<Label htmlFor="comments">Описание работы</Label>
						<Textarea
							id="comments"
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							placeholder="Опишите выполненную работу..."
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={closeTimeLogModal}>
						Отмена
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!hours || !comments.trim() || !activityId || isSubmitting}
					>
						<Send className="w-4 h-4 mr-2" />
						{isSubmitting ? "Отправка..." : "Отправить лог"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
