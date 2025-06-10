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
	statusId: number
}
export interface Activity {
	id: number
	name: string
}

export interface Status {
	id: number
	name: string
	allowedTransitions?: string[]
}

export interface Role {
	id: number
	name: string
}

export interface Membership {
	id: number
	project: {
		id: number
		name: string
	}
	user: {
		id: number
		name: string
	}
	roles: Role[]
}

// Типы ролей для фильтрации
export type UserRole = "Manager" | "Developer" | "Other"

interface RedmineStore {
	// Configuration
	redmineUrl: string
	apiKey: string
	isConfigured: boolean

	// Tasks
	tasks: RedmineTask[]
	selectedTask: RedmineTask | null
	isLoading: boolean

	// Activities
	activities: Activity[]

	statuses: Status[]

	// User roles
	userRoles: Role[]
	userRole: UserRole
	currentUserId: number | null

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
	loadStatuses: () => Promise<void>
	loadUserRoles: (projectId: number) => Promise<void>
	loadCurrentUser: () => Promise<void>
	selectTask: (task: RedmineTask) => void
	startTimer: (taskId: number) => void
	pauseTimer: (taskId: number) => void
	finishTimer: (taskId: number) => void
	canStartTask: (taskId: number) => boolean
	submitTimeLog: (data: TimeLogData) => Promise<void>
	closeTimeLogModal: () => void

	// Role-based filtering
	getFilteredStatuses: (currentStatusName: string) => Status[]
	determineUserRole: (roles: Role[]) => UserRole
	canChangeStatus: (currentStatusName: string, userRole: UserRole) => boolean

	// Progress calculation helpers
	getElapsedSeconds: (taskId: number) => number
	getProgressPercentage: (taskId: number, estimatedHours?: number) => number

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
			statuses: [],
			userRoles: [],
			userRole: "Other",
			currentUserId: null,
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
					userRoles: [],
					userRole: "Other",
					currentUserId: null,
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

			// Загрузка информации о текущем пользователе
			loadCurrentUser: async () => {
				const { redmineUrl, apiKey } = get()
				if (!redmineUrl || !apiKey) return

				try {
					const response = await fetch("/api/redmine/current-user", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: redmineUrl, apiKey }),
					})

					if (response.ok) {
						const data = await response.json()
						set({ currentUserId: data.user?.id })
					}
				} catch (error) {
					console.error("Ошибка загрузки текущего пользователя:", error)
				}
			},

			// Tasks actions
			loadTasks: async () => {
				const { redmineUrl, apiKey, loadCurrentUser } = get()
				if (!redmineUrl || !apiKey) return

				set({ isLoading: true })
				try {
					// Загружаем информацию о текущем пользователе
					await loadCurrentUser()

					const response = await fetch("/api/redmine/issues", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: redmineUrl, apiKey }),
					})

					if (response.ok) {
						const data = await response.json()
						// set({ tasks: data.issues || [] })
						const tasks = data.issues || []
						set({ tasks })

						// Если есть задачи, загружаем роли для первого проекта
						if (tasks.length > 0 && tasks[0].project?.id) {
							const { loadUserRoles } = get()
							await loadUserRoles(tasks[0].project.id)
						}
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

			// Statuses actions
			loadStatuses: async () => {
				const { redmineUrl, apiKey } = get()
				if (!redmineUrl || !apiKey) return

				try {
					const response = await fetch("/api/redmine/statuses", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: redmineUrl, apiKey }),
					})

					if (response.ok) {
						const data = await response.json()
						set({ statuses: data.issue_statuses || [] })
					}
				} catch (error) {
					console.error("Ошибка загрузки статусов:", error)
				}
			},

			// User roles actions
			loadUserRoles: async (projectId: number) => {
				const { redmineUrl, apiKey, currentUserId, determineUserRole } = get()
				if (!redmineUrl || !apiKey) return

				try {
					const response = await fetch("/api/redmine/memberships", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: redmineUrl, apiKey, projectId }),
					})

					if (response.ok) {
						const data = await response.json()
						const memberships: Membership[] = data.memberships || []

						// Находим текущего пользователя по ID
						let currentUserMembership = null
						if (currentUserId) {
							currentUserMembership = memberships.find((membership) => membership.user.id === currentUserId)
						}

						// Если не нашли по ID, берем первого (fallback)
						if (!currentUserMembership && memberships.length > 0) {
							currentUserMembership = memberships[0]
						}

						if (currentUserMembership) {
							const roles = currentUserMembership.roles
							const userRole = determineUserRole(roles)

							set({
								userRoles: roles,
								userRole,
							})

							console.log("Загружены роли пользователя:", {
								userId: currentUserMembership.user.id,
								userName: currentUserMembership.user.name,
								roles: roles.map((r) => r.name),
								determinedRole: userRole,
							})
						}
					}
				} catch (error) {
					console.error("Ошибка загрузки ролей пользователя:", error)
				}
			},

			// Определение роли пользователя
			determineUserRole: (roles: Role[]): UserRole => {
				const roleNames = roles.map((role) => role.name)

				console.log("Определение роли для:", roleNames)

				if (roleNames.includes("Manager")) {
					return "Manager"
				} else if (roleNames.includes("Developer")) {
					return "Developer"
				} else {
					return "Other"
				}
			},

			// Проверка возможности изменения статуса
			canChangeStatus: (currentStatusName: string, userRole: UserRole): boolean => {
				// Менеджер может изменять любые статусы
				if (userRole === "Manager") {
					return true
				}

				// Разработчик может изменять статусы согласно правилам
				if (userRole === "Developer") {
					switch (currentStatusName.toLowerCase()) {
						case "new":
							// Если статус New - изменять нельзя
							return false
						case "to review":
							// Если статус To Review - можно изменить
							return true
						default:
							// Остальные статусы - можно изменять
							return true
					}
				}

				// Остальные роли не могут изменять статусы
				return false
			},

			// Фильтрация статусов по роли и текущему статусу
			getFilteredStatuses: (currentStatusName: string): Status[] => {
				const { statuses, userRole, canChangeStatus } = get()

				// Проверяем, может ли пользователь изменять статус
				if (!canChangeStatus(currentStatusName, userRole)) {
					return []
				}

				switch (userRole) {
					case "Manager":
						// Менеджер видит все статусы, кроме текущего
						return statuses.filter((status) => status.name.toLowerCase() !== currentStatusName.toLowerCase())

					case "Developer":
						switch (currentStatusName.toLowerCase()) {
							case "new":
								// Если статус New - нет доступных статусов для изменения
								return []

							case "to review":
								// Если статус To Review - можно только на On merge
								return statuses.filter((status) => status.name.toLowerCase() === "on merge")

							default:
								// Для остальных статусов - показываем разрешенные статусы
								const allowedStatusNames = ["new", "to review", "on merge"]
								return statuses.filter(
									(status) =>
										allowedStatusNames.includes(status.name.toLowerCase()) &&
										status.name.toLowerCase() !== currentStatusName.toLowerCase(),
								)
						}

					case "Other":
					default:
						// Остальные роли не видят статусы
						return []
				}
			},

			selectTask: (task: RedmineTask) => {
				const { loadUserRoles } = get()
				set({ selectedTask: task })

				// Загружаем роли пользователя для проекта задачи (если проект изменился)
				if (task.project?.id) {
					loadUserRoles(task.project.id)
				}
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
				})
			},


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

			// Progress calculation helpers
			getElapsedSeconds: (taskId: number) => {
				const { sessions } = get()
				const session = sessions.find((s) => s.taskId === taskId)

				if (!session) return 0

				let elapsed = session.totalElapsed

				// Если сессия активна, добавляем текущий интервал
				if (session.isRunning && session.currentIntervalStart) {
					elapsed += Date.now() - session.currentIntervalStart
				}

				// Конвертируем из миллисекунд в секунды
				return Math.floor(elapsed / 1000)
			},

			getProgressPercentage: (taskId: number, estimatedHours?: number) => {
				if (!estimatedHours || estimatedHours <= 0) return 0

				const elapsedSeconds = get().getElapsedSeconds(taskId)
				const totalSeconds = estimatedHours * 3600

				return Math.min(Math.round((elapsedSeconds / totalSeconds) * 100), 100)
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
								status_id: data.statusId
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
				currentUserId: state.currentUserId, // Сохраняем ID пользователя
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