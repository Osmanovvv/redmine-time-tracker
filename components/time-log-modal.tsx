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
import { useRedmineStore } from "@/lib/store"
import { Clock, Send, Shield, Lock } from "lucide-react"

export function TimeLogModal() {
	const {
		timeLogModal,
		closeTimeLogModal,
		submitTimeLog,
		selectedTask,
		activities,
		loadActivities,
		loadStatuses,
		getFilteredStatuses,
		userRole,
		canChangeStatus,
	} = useRedmineStore()

	const [hoursInput, setHoursInput] = useState("")
	const [comments, setComments] = useState("")
	const [activityId, setActivityId] = useState("")
	const [statusId, setStatusId] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Получаем отфильтрованные статусы для текущей задачи
	const filteredStatuses = selectedTask ? getFilteredStatuses(selectedTask.status.name) : []
	const canChangeTaskStatus = selectedTask ? canChangeStatus(selectedTask.status.name, userRole) : false

	useEffect(() => {
		if (timeLogModal.isOpen && timeLogModal.duration) {
			const durationMs = timeLogModal.duration
			const hours = durationMs / 3600000
			const roundedHours = Math.round(hours * 10) / 10
			const finalHours = Math.max(0.1, roundedHours)

			setHoursInput(finalHours.toFixed(1))
			setComments("")
			setActivityId("")
			setStatusId("")
			loadActivities()
			loadStatuses()
		}
	}, [timeLogModal.isOpen, timeLogModal.duration, loadActivities, loadStatuses])

	function parseHours(input: string): number {
		const regex = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i
		const match = input.match(regex)

		if (!match) {
			const float = parseFloat(input)
			return isNaN(float) ? 0.1 : Math.max(0.1, Math.round(float * 10) / 10)
		}

		const h = parseInt(match[1] || "0", 10)
		const m = parseInt(match[2] || "0", 10)
		const total = h + m / 60
		return Math.max(0.1, Math.round(total * 10) / 10)
	}

	const handleSubmit = async () => {
		if (!selectedTask || !hoursInput.trim() || !comments.trim() || !activityId) return

		const parsedHours = parseHours(hoursInput)

		setIsSubmitting(true)
		try {
			await submitTimeLog({
				issueId: selectedTask.id,
				hours: parsedHours,
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
							value={hoursInput}
							onChange={(e) => setHoursInput(e.target.value)}
							placeholder="Пример: 1.5 или 1h 30m (мин. 0.1 ч)"
						/>
					</div>

					<div className="flex gap-4">
						<div className="flex-1 space-y-2">
							<Label htmlFor="activity">Тип активности *</Label>
							<Select value={activityId} onValueChange={setActivityId}>
								<SelectTrigger id="activity">
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
												? "New"
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

					{userRole === "Other" && (
						<div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
							<div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
								<Shield className="w-3 h-3" />
								<span>{getStatusChangeMessage()}</span>
							</div>
						</div>
					)}

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
						disabled={!hoursInput.trim() || !comments.trim() || !activityId || isSubmitting}
					>
						<Send className="w-4 h-4 mr-2" />
						{isSubmitting ? "Отправка..." : "Отправить лог"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}