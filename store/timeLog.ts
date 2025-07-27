import { create } from "zustand"
import type { TimeLogData, TimeLogStore } from "./types/redmine"
import { useConfigStore } from "./config"
import { useTimerStore } from "./timer"
import { useModalStore } from "./modal"

export const useTimeLogStore = create<TimeLogStore>(() => ({
	submitTimeLog: async (data: TimeLogData) => {
		const { redmineUrl, apiKey } = useConfigStore.getState()

		try {
			const response = await fetch("/api/redmine/time-entries", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					url: redmineUrl,
					apiKey,
					timeEntry: {
						issue_id: data.issueId,
						hours: data.hours,
						comments: data.comments,
						spent_on: data.spentOn,
						activity_id: data.activityId,
						status_id: data.statusId,
					},
				}),
			})

			if (response.ok) {
				// Завершаем сессию
				useTimerStore.getState().finishTimer(data.issueId)

				// Закрываем модалку
				useModalStore.getState().closeTimeLogModal()

				// Удаляем завершённую сессию
				const { sessions } = useTimerStore.getState()
				useTimerStore.setState({
					sessions: sessions.filter((s) => s.taskId !== data.issueId),
				})
			} else {
				throw new Error("Ошибка отправки лога")
			}
		} catch (error) {
			console.error("Ошибка отправки лога времени:", error)
			throw error
		}
	},
}))
