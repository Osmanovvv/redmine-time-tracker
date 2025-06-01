"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface RedmineTask {
	id: number
	subject: string
	description?: string
	status: {
		id: number
		name: string
	}
	assigned_to?: {
		id: number
		name: string
	}
	created_on: string
	updated_on: string
	estimated_hours?: number
	done_ratio?: number
	priority: {
		id: number
		name: string
	}
	project: {
		id: number
		name: string
	}
}


export interface TimeSession {
	taskId: number
	startTime: number
	totalElapsed: number
	currentIntervalStart: number | null
	isRunning: boolean,
	isFinished: boolean
}

export interface TimeLogData {
	issueId: number
	hours: number
	comments: string
	spentOn: string
	activityId: number
}

export interface Activity {
	id: number
	name: string
}

interface RedmineStore {
	// Configuration
	redmineUrl: string
	apiKey: string
	isConfigured: boolean

	// Tasks
	tasks: RedmineTask[]
	selectedTask: RedmineTask | null
	isLoading: boolean
	// isFinished: boolean,

	// Activities
	activities: Activity[]

	// Time tracking
	sessions: TimeSession[],


	// Modal
	timeLogModal: {
		isOpen: boolean
		duration?: number
	}

	// Timer
	timerInterval: Record<number, ReturnType<typeof setInterval>>


	hasHydrated: boolean

	// Actions
	saveConfig: (url: string, apiKey: string) => void
	clearConfig: () => void
	loadConfig: () => void
	testConnection: (url: string, apiKey: string) => Promise<boolean>
	loadTasks: () => Promise<void>
	loadActivities: () => Promise<void>
	selectTask: (task: RedmineTask) => void
	startTimer: (taskId: number) => void
	pauseTimer: (taskId: number) => void
	finishTimer: (taskId: number) => void
	// markTaskAsFinished: () => void
	canStartTask: (taskId: number) => boolean
	submitTimeLog: (data: TimeLogData) => Promise<void>
	closeTimeLogModal: () => void

	// Add cleanup action
	cleanup: () => void
}

export const useRedmineStore = create<RedmineStore>()(
	persist(
		(set, get) => ({
			// Initial state
			redmineUrl: "",
			apiKey: "",
			isConfigured: false,
			tasks: [],
			selectedTask: null,
			isLoading: false,
			activities: [],
			sessions: [],
			timeLogModal: { isOpen: false },
			timerInterval: {},
			isFinished: false,
			hasHydrated: false,

			// Configuration actions
			saveConfig: (url: string, apiKey: string) => {
				const cleanedUrl = url.replace(/\/$/, "")
				localStorage.setItem("redmineUrl", cleanedUrl)
				localStorage.setItem("redmineApiKey", apiKey)

				set({
					redmineUrl: cleanedUrl,
					apiKey,
					isConfigured: true,
				})
			},

			clearConfig: () => {
				set({
					redmineUrl: "",
					apiKey: "",
					isConfigured: false,
					tasks: [],
					selectedTask: null,
					sessions: [],
				})
			},

			loadConfig: () => {
				const url = localStorage.getItem("redmineUrl")
				const apiKey = localStorage.getItem("redmineApiKey")

				if (url && apiKey) {
					set({
						redmineUrl: url,
						apiKey,
						isConfigured: true,
					})
				}
			},

			testConnection: async (url: string, apiKey: string) => {
				try {
					const response = await fetch("/api/redmine/test", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: url.replace(/\/$/, ""), apiKey }),
					})
					return response.ok
				} catch {
					return false
				}
			},

			// Tasks actions
			loadTasks: async () => {
				const { redmineUrl, apiKey } = get()
				if (!redmineUrl || !apiKey) return

				set({ isLoading: true })
				try {
					const response = await fetch("/api/redmine/issues", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: redmineUrl, apiKey }),
					})

					if (response.ok) {
						const data = await response.json()
						set({ tasks: data.issues || [] })
					}
				} catch (error) {
					console.error("Ошибка загрузки задач:", error)
				} finally {
					set({ isLoading: false })
				}
			},

			// Activities actions
			loadActivities: async () => {
				const { redmineUrl, apiKey } = get()
				if (!redmineUrl || !apiKey) return

				try {
					const response = await fetch("/api/redmine/activities", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: redmineUrl, apiKey }),
					})

					if (response.ok) {
						const data = await response.json()
						set({ activities: data.time_entry_activities || [] })
					}
				} catch (error) {
					console.error("Ошибка загрузки активностей:", error)
				}
			},

			selectTask: (task: RedmineTask) => {
				set({ selectedTask: task })
			},

			// Timer actions
			startTimer: (taskId: number) => {
				const { sessions, timerInterval } = get()
				const now = Date.now()

				// Найти сессию для этой задачи
				const existing = sessions.find(s => s.taskId === taskId)

				if (!existing && sessions.length >= 3) return // максимум 3 сессии

				const updatedSessions = sessions.map(session => {
					// Автоматически ставим все другие задачи на паузу
					if (session.taskId !== taskId && session.isRunning && session.currentIntervalStart) {
						const elapsed = Date.now() - session.currentIntervalStart
						clearInterval(timerInterval[session.taskId])
						return {
							...session,
							isRunning: false,
							totalElapsed: session.totalElapsed + elapsed,
							currentIntervalStart: null,
						}
					}

					// Обновляем текущую задачу — запускаем, если она существует
					if (session.taskId === taskId) {
						return {
							...session,
							isRunning: true,
							currentIntervalStart: now,
						}
					}

					return session
				})

				// Если задача новая — добавляем
				if (!existing) {
					updatedSessions.push({
						taskId,
						startTime: now,
						totalElapsed: 0,
						currentIntervalStart: now,
						isRunning: true,
						isFinished: false,
					})
				}

				// Очищаем все предыдущие интервалы
				Object.entries(timerInterval).forEach(([int]) => {
					clearInterval(int)
				})

				// Создаём новый только для этой задачи
				const interval = setInterval(() => {
					const { sessions } = get()
					const updated = sessions.map(session => {
						if (session.taskId === taskId && session.isRunning && session.currentIntervalStart) {
							const now = Date.now()
							const delta = now - session.currentIntervalStart
							return {
								...session,
								totalElapsed: session.totalElapsed + delta,
								currentIntervalStart: now,
							}
						}
						return session
					})
					set({ sessions: updated })
				}, 1000)

				set({
					sessions: updatedSessions,
					timerInterval: { [taskId]: interval },
				})
			},

			pauseTimer: (taskId: number) => {
				const { sessions, timerInterval } = get()
				const session = sessions.find(s => s.taskId === taskId)
				if (!session?.isRunning || !session.currentIntervalStart) return

				const now = Date.now()
				const intervalDuration = now - session.currentIntervalStart

				// Очистить только таймер для этой задачи
				if (timerInterval && timerInterval[taskId]) {
					clearInterval(timerInterval[taskId])
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { [taskId]: _, ...rest } = timerInterval
					set({ timerInterval: rest })
				}

				set({
					sessions: sessions.map(s =>
						s.taskId === taskId
							? {
								...s,
								totalElapsed: s.totalElapsed + intervalDuration,
								currentIntervalStart: null,
								isRunning: false,
							}
							: s
					),
				})
			},

			finishTimer: (taskId: number) => {
				// const { sessions, pauseTimer, markTaskAsFinished } = get()
				const { sessions, pauseTimer } = get()
				if (!sessions) return

				const session = sessions.find(s => s.taskId === taskId)
				if (!session) return

				// Calculate final time including current running interval
				let finalTime = session.totalElapsed
				if (session.isRunning && session.currentIntervalStart) {
					finalTime += Date.now() - session.currentIntervalStart
				}

				// Pause if running
				if (session.isRunning) {
					pauseTimer(taskId)
				}

				set({
					sessions: sessions.map(session =>
						session.taskId === taskId
							? {
								...session,
								isRunning: false,
								currentIntervalStart: null,
								isFinished: true,
							}
							: session
					),
					timeLogModal: {
						isOpen: true,
						duration: finalTime,
					},
					// isFinished: true,
				})

				// markTaskAsFinished()
			},

			// markTaskAsFinished: () => {
			// 	const { selectedTask, tasks } = get()
			// 	if (!selectedTask) return

			// 	const updatedTask: RedmineTask = {
			// 		...selectedTask,
			// 		status: {
			// 			...selectedTask.status,
			// 			name: "Задача завершена",
			// 		},
			// 	}

			// 	set({
			// 		selectedTask: updatedTask,
			// 		tasks: tasks.map(task =>
			// 			task.id === selectedTask.id ? updatedTask : task
			// 		),
			// 	})
			// },

			cleanup: () => {
				const { timerInterval } = get()

				if (timerInterval) {
					Object.values(timerInterval).forEach(clearInterval)
					set({ timerInterval: {} }) // очищаем объект
				}
			},

			canStartTask: (taskId: number) => {
				const { sessions } = get()

				// Проверяем, есть ли уже запущенная сессия с другим taskId
				const runningSession = Array.isArray(sessions)
					? sessions.find(s => s.isRunning)
					: null

				// Разрешить запуск, если:
				// - нет активных сессий вообще
				// - либо активная сессия — это та же задача
				return !runningSession || runningSession.taskId === taskId
			},

			submitTimeLog: async (data: TimeLogData) => {
				const { redmineUrl, apiKey } = get()

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
							},
						}),
					})
					if (response.ok) {
						const { sessions } = get()
						const activeSessions = sessions.filter(s => !s.isFinished)
						set({ sessions: activeSessions })
					} else {
						throw new Error("Ошибка отправки лога")
					}
				} catch (error) {
					console.error("Ошибка отправки лога времени:", error)
					throw error
				}
			},

			closeTimeLogModal: () => {
				set({
					timeLogModal: { isOpen: false },
					// sessions: [],
					// isFinished: false,
				})
			},
		}),
		{
			name: "redmine-store",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				redmineUrl: state.redmineUrl,
				apiKey: state.apiKey,
				isConfigured: state.isConfigured,
				// isFinished: state.isFinished,
				sessions: Array.isArray(state.sessions)
					? state.sessions.map(session => ({
						...session,
						currentIntervalStart: null,
						isRunning: false,
					}))
					: [],
			}),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error("Ошибка при гидратации стора:", error)
				} else {
					// выставляем после успешной гидратации
					setTimeout(() => {
						useRedmineStore.setState({ hasHydrated: true })
					}, 0)
				}
			}

		},
	),
)
