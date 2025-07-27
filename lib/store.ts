// "use client"

// import { create } from "zustand"
// import { persist, createJSONStorage } from "zustand/middleware"

// export interface RedmineTask {
// 	id: number
// 	subject: string
// 	description?: string
// 	status: {
// 		id: number
// 		name: string
// 	}
// 	assigned_to?: {
// 		id: number
// 		name: string
// 	}
// 	created_on: string
// 	updated_on: string
// 	estimated_hours?: number
// 	done_ratio?: number
// 	priority: {
// 		id: number
// 		name: string
// 	}
// 	project?: {
// 		id: number
// 		name: string
// 	}
// 	fixed_version?: {
// 		id: number
// 		name: string
// 	}
// }

// export interface Note {
// 	id: string
// 	title: string
// 	description: string
// 	createdAt: string
// 	updatedAt: string
// 	category?: string
// 	totalTimeSpent: number // в миллисекундах
// }

// export interface TimeSession {
// 	taskId?: number
// 	noteId?: string
// 	startTime: number
// 	totalElapsed: number
// 	currentIntervalStart: number | null
// 	isRunning: boolean
// 	isFinished: boolean
// 	type: "task" | "note"
// }

// export interface TimeLogData {
// 	issueId: number
// 	hours: number
// 	comments: string
// 	spentOn: string
// 	activityId: number
// 	statusId: number
// }
// export interface Activity {
// 	id: number
// 	name: string
// }

// export interface Status {
// 	id: number
// 	name: string
// 	allowedTransitions?: string[]
// }

// export interface Role {
// 	id: number
// 	name: string
// }

// export interface Version {
// 	id: number
// 	name: string
// 	status: string
// 	project: {
// 		id: number
// 		name: string
// 	}
// }

// export interface Project {
// 	id: number
// 	name: string
// }
// export interface Membership {
// 	id: number
// 	project: {
// 		id: number
// 		name: string
// 	}
// 	user: {
// 		id: number
// 		name: string
// 	}
// 	roles: Role[]
// }

// // Типы ролей для фильтрации
// export type UserRole = "Manager" | "Developer" | "Other"

// interface RedmineStore {
// 	// Configuration
// 	redmineUrl: string
// 	apiKey: string
// 	isConfigured: boolean

// 	// Tasks
// 	tasks: RedmineTask[]
// 	selectedTask: RedmineTask | null
// 	isLoading: boolean
// 	isSearching: boolean

// 	// Activities
// 	activities: Activity[]

// 	// Statuses
// 	statuses: Status[]

// 	// Versions/Sprints
// 	versions: Version[]

// 	// Projects
// 	projects: Project[]

// 	// User roles
// 	userRoles: Role[]
// 	userRole: UserRole
// 	currentUserId: number | null

// 	// Time tracking
// 	sessions: TimeSession[]

// 	// Modal
// 	timeLogModal: {
// 		isOpen: boolean
// 		duration?: number
// 	}

// 	// Timer
// 	timerInterval: Record<string, ReturnType<typeof setInterval>>

// 	// Search and filter functionality
// 	searchQuery: string
// 	selectedProjectId: string
// 	selectedVersionId: string
// 	filteredTasks: RedmineTask[]

// 	hasHydrated: boolean

// 	// Notes
// 	notes: Note[]
// 	selectedNote: Note | null
// 	currentView: "tasks" | "notes"

// 	// Actions
// 	saveConfig: (url: string, apiKey: string) => void
// 	clearConfig: () => void
// 	loadConfig: () => void
// 	testConnection: (url: string, apiKey: string) => Promise<boolean>
// 	loadTasks: () => Promise<void>
// 	searchTasks: (query: string) => Promise<void>
// 	loadActivities: () => Promise<void>
// 	loadStatuses: () => Promise<void>
// 	loadVersions: () => Promise<void>
// 	loadUserRoles: (projectId: number) => Promise<void>
// 	loadCurrentUser: () => Promise<void>
// 	selectTask: (task: RedmineTask) => void
// 	startTimer: (taskId: number) => void
// 	pauseTimer: (taskId: number) => void
// 	finishTimer: (taskId: number) => void
// 	canStartTask: (taskId: number) => boolean
// 	submitTimeLog: (data: TimeLogData) => Promise<void>
// 	closeTimeLogModal: () => void

// 	// Role-based filtering
// 	getFilteredStatuses: (currentStatusName: string) => Status[]
// 	determineUserRole: (roles: Role[]) => UserRole
// 	canChangeStatus: (currentStatusName: string, userRole: UserRole) => boolean

// 	// Progress calculation helpers
// 	getElapsedSeconds: (taskId: number) => number
// 	getProgressPercentage: (taskId: number, estimatedHours?: number) => number

// 	// Add cleanup action
// 	cleanup: () => void

// 	// Actions для поиска и фильтрации
// 	setSearchQuery: (query: string) => void
// 	setSelectedProjectId: (projectId: string) => void
// 	setSelectedVersionId: (versionId: string) => void
// 	filterTasks: () => void

// 	// Notes actions
// 	createNote: (title: string, description: string, category?: string) => void
// 	updateNote: (id: string, updates: Partial<Note>) => void
// 	deleteNote: (id: string) => void
// 	selectNote: (note: Note) => void
// 	startNoteTimer: (noteId: string) => void
// 	pauseNoteTimer: (noteId: string) => void
// 	finishNoteTimer: (noteId: string) => void
// 	canStartNote: (noteId: string) => boolean

// 	// View actions
// 	setCurrentView: (view: "tasks" | "notes") => void

// 	// Helper for notes
// 	getNoteElapsedSeconds: (noteId: string) => number
// }

// export const useRedmineStore = create<RedmineStore>()(
// 	persist(
// 		(set, get) => ({
// 			// Initial state
// 			redmineUrl: "",
// 			apiKey: "",
// 			isConfigured: false,
// 			tasks: [],
// 			selectedTask: null,
// 			isLoading: false,
// 			isSearching: false,
// 			activities: [],
// 			statuses: [],
// 			versions: [],
// 			projects: [],
// 			userRoles: [],
// 			userRole: "Other",
// 			currentUserId: null,
// 			sessions: [],
// 			timeLogModal: { isOpen: false },
// 			timerInterval: {},
// 			isFinished: false,
// 			hasHydrated: false,
// 			searchQuery: "",
// 			selectedProjectId: "",
// 			selectedVersionId: "",
// 			filteredTasks: [],
// 			notes: [],
// 			selectedNote: null,
// 			currentView: "tasks",

// 			// Configuration actions
// 			saveConfig: (url: string, apiKey: string) => {
// 				const cleanedUrl = url.replace(/\/$/, "")
// 				localStorage.setItem("redmineUrl", cleanedUrl)
// 				localStorage.setItem("redmineApiKey", apiKey)

// 				set({
// 					redmineUrl: cleanedUrl,
// 					apiKey,
// 					isConfigured: true,
// 				})
// 			},

// 			clearConfig: () => {
// 				set({
// 					redmineUrl: "",
// 					apiKey: "",
// 					isConfigured: false,
// 					tasks: [],
// 					selectedTask: null,
// 					sessions: [],
// 					userRoles: [],
// 					userRole: "Other",
// 					currentUserId: null,
// 					searchQuery: "",
// 					selectedProjectId: "",
// 					selectedVersionId: "",
// 					filteredTasks: [],
// 					versions: [],
// 					projects: [],
// 					// notes: [],
// 					// selectedNote: null,
// 					// currentView: "tasks",
// 				})
// 			},

// 			loadConfig: () => {
// 				const url = localStorage.getItem("redmineUrl")
// 				const apiKey = localStorage.getItem("redmineApiKey")

// 				if (url && apiKey) {
// 					set({
// 						redmineUrl: url,
// 						apiKey,
// 						isConfigured: true,
// 					})
// 				}
// 			},

// 			testConnection: async (url: string, apiKey: string) => {
// 				try {
// 					const response = await fetch("/api/redmine/test", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: url.replace(/\/$/, ""), apiKey }),
// 					})
// 					return response.ok
// 				} catch {
// 					return false
// 				}
// 			},

// 			// Загрузка информации о текущем пользователе
// 			loadCurrentUser: async () => {
// 				const { redmineUrl, apiKey } = get()
// 				if (!redmineUrl || !apiKey) return

// 				try {
// 					const response = await fetch("/api/redmine/current-user", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: redmineUrl, apiKey }),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						set({ currentUserId: data.user?.id })
// 					}
// 				} catch (error) {
// 					console.error("Ошибка загрузки текущего пользователя:", error)
// 				}
// 			},

// 			// Tasks actions
// 			loadTasks: async () => {
// 				const { redmineUrl, apiKey, loadCurrentUser, loadVersions } = get()
// 				if (!redmineUrl || !apiKey) return

// 				set({ isLoading: true })
// 				try {
// 					// Загружаем информацию о текущем пользователе
// 					await loadCurrentUser()

// 					const response = await fetch("/api/redmine/issues", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: redmineUrl, apiKey }),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						const tasks = data.issues || []
// 						set({ tasks, filteredTasks: tasks })

// 						// Извлекаем уникальные проекты из задач
// 						const uniqueProjects = tasks.reduce((acc: Project[], task: RedmineTask) => {
// 							if (task.project && !acc.find((p) => p.id === task.project!.id)) {
// 								acc.push(task.project)
// 							}
// 							return acc
// 						}, [])
// 						set({ projects: uniqueProjects })

// 						// Загружаем версии/спринты
// 						await loadVersions()

// 						// // Инициализируем filteredTasks с полным списком задач
// 						// set({ filteredTasks: tasks })
// 						// // Затем применяем фильтры если есть поисковый запрос или фильтры
// 						// if (get().searchQuery.trim() || get().selectedProjectId || get().selectedVersionId) {
// 						// 	get().filterTasks()
// 						// }

// 						// Если есть задачи, загружаем роли для первого проекта
// 						if (tasks.length > 0 && tasks[0].project?.id) {
// 							const { loadUserRoles } = get()
// 							await loadUserRoles(tasks[0].project.id)
// 						}
// 					}
// 				} catch (error) {
// 					console.error("Ошибка загрузки задач:", error)
// 				} finally {
// 					set({ isLoading: false })
// 				}
// 			},

// 			// Поиск задач через API
// 			searchTasks: async (query: string) => {
// 				const { redmineUrl, apiKey } = get()
// 				if (!redmineUrl || !apiKey) return

// 				// Если запрос пустой, загружаем все задачи
// 				if (!query.trim()) {
// 					get().loadTasks()
// 					return
// 				}

// 				// Минимальная длина запроса для поиска
// 				if (query.trim().length < 2) {
// 					set({ filteredTasks: [] })
// 					return
// 				}

// 				set({ isSearching: true })
// 				try {
// 					const response = await fetch("/api/redmine/search", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({
// 							url: redmineUrl,
// 							apiKey,
// 							query: query.trim(),
// 							limit: 50,
// 						}),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						const searchResults = data.issues || []

// 						set({
// 							filteredTasks: searchResults,
// 							// Обновляем основной список задач только если это первый поиск
// 							tasks: get().tasks.length === 0 ? searchResults : get().tasks,
// 						})

// 						// Извлекаем проекты из результатов поиска
// 						const uniqueProjects = searchResults.reduce((acc: Project[], task: RedmineTask) => {
// 							if (task.project && !acc.find((p) => p.id === task.project!.id)) {
// 								acc.push(task.project)
// 							}
// 							return acc
// 						}, [])

// 						// Объединяем с существующими проектами
// 						const existingProjects = get().projects
// 						const allProjects = [...existingProjects]
// 						uniqueProjects.forEach((project: Project) => {
// 							if (!allProjects.find((p) => p.id === project.id)) {
// 								allProjects.push(project)
// 							}
// 						})
// 						set({ projects: allProjects })
// 					} else {
// 						console.error("Ошибка поиска задач")
// 						set({ filteredTasks: [] })
// 					}
// 				} catch (error) {
// 					console.error("Ошибка поиска задач:", error)
// 					set({ filteredTasks: [] })
// 				} finally {
// 					set({ isSearching: false })
// 				}
// 			},

// 			// Activities actions
// 			loadActivities: async () => {
// 				const { redmineUrl, apiKey } = get()
// 				if (!redmineUrl || !apiKey) return

// 				try {
// 					const response = await fetch("/api/redmine/activities", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: redmineUrl, apiKey }),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						set({ activities: data.time_entry_activities || [] })
// 					}
// 				} catch (error) {
// 					console.error("Ошибка загрузки активностей:", error)
// 				}
// 			},

// 			// Statuses actions
// 			loadStatuses: async () => {
// 				const { redmineUrl, apiKey } = get()
// 				if (!redmineUrl || !apiKey) return

// 				try {
// 					const response = await fetch("/api/redmine/statuses", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: redmineUrl, apiKey }),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						set({ statuses: data.issue_statuses || [] })
// 					}
// 				} catch (error) {
// 					console.error("Ошибка загрузки статусов:", error)
// 				}
// 			},

// 			// Versions actions
// 			loadVersions: async () => {
// 				const { redmineUrl, apiKey } = get()
// 				if (!redmineUrl || !apiKey) return

// 				try {
// 					const response = await fetch("/api/redmine/versions", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: redmineUrl, apiKey }),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						set({ versions: data.versions || [] })
// 					}
// 				} catch (error) {
// 					console.error("Ошибка загрузки версий:", error)
// 				}
// 			},

// 			// User roles actions
// 			loadUserRoles: async (projectId: number) => {
// 				const { redmineUrl, apiKey, currentUserId, determineUserRole } = get()
// 				if (!redmineUrl || !apiKey) return

// 				try {
// 					const response = await fetch("/api/redmine/memberships", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({ url: redmineUrl, apiKey, projectId }),
// 					})

// 					if (response.ok) {
// 						const data = await response.json()
// 						const memberships: Membership[] = data.memberships || []

// 						// Находим текущего пользователя по ID
// 						let currentUserMembership = null
// 						if (currentUserId) {
// 							currentUserMembership = memberships.find((membership) => membership.user.id === currentUserId)
// 						}

// 						// Если не нашли по ID, берем первого (fallback)
// 						if (!currentUserMembership && memberships.length > 0) {
// 							currentUserMembership = memberships[0]
// 						}

// 						if (currentUserMembership) {
// 							const roles = currentUserMembership.roles
// 							const userRole = determineUserRole(roles)

// 							set({
// 								userRoles: roles,
// 								userRole,
// 							})

// 							console.log("Загружены роли пользователя:", {
// 								userId: currentUserMembership.user.id,
// 								userName: currentUserMembership.user.name,
// 								roles: roles.map((r) => r.name),
// 								determinedRole: userRole,
// 							})
// 						}
// 					}
// 				} catch (error) {
// 					console.error("Ошибка загрузки ролей пользователя:", error)
// 				}
// 			},

// 			// Определение роли пользователя
// 			determineUserRole: (roles: Role[]): UserRole => {
// 				const roleNames = roles.map((role) => role.name)

// 				console.log("Определение роли для:", roleNames)

// 				if (roleNames.includes("Manager")) {
// 					return "Manager"
// 				} else if (roleNames.includes("Developer")) {
// 					return "Developer"
// 				} else {
// 					return "Other"
// 				}
// 			},

// 			// Проверка возможности изменения статуса
// 			canChangeStatus: (currentStatusName: string, userRole: UserRole): boolean => {
// 				// Менеджер может изменять любые статусы
// 				if (userRole === "Manager") {
// 					return true
// 				}

// 				// Разработчик может изменять статусы согласно правилам
// 				if (userRole === "Developer") {
// 					switch (currentStatusName.toLowerCase()) {
// 						case "new":
// 							// Если статус New - изменять нельзя
// 							return false
// 						case "to review":
// 							// Если статус To Review - можно изменить
// 							return true
// 						default:
// 							// Остальные статусы - можно изменять
// 							return true
// 					}
// 				}

// 				// Остальные роли не могут изменять статусы
// 				return false
// 			},

// 			// Фильтрация статусов по роли и текущему статусу
// 			getFilteredStatuses: (currentStatusName: string): Status[] => {
// 				const { statuses, userRole, canChangeStatus } = get()

// 				// Проверяем, может ли пользователь изменять статус
// 				if (!canChangeStatus(currentStatusName, userRole)) {
// 					return []
// 				}

// 				switch (userRole) {
// 					case "Manager":
// 						// Менеджер видит все статусы, кроме текущего
// 						return statuses.filter((status) => status.name.toLowerCase() !== currentStatusName.toLowerCase())

// 					case "Developer":
// 						switch (currentStatusName.toLowerCase()) {
// 							case "new":
// 								// Если статус New - нет доступных статусов для изменения
// 								return []

// 							case "to review":
// 								// Если статус To Review - можно только на On merge
// 								return statuses.filter((status) => status.name.toLowerCase() === "on merge")

// 							default:
// 								// Для остальных статусов - показываем разрешенные статусы
// 								const allowedStatusNames = ["new", "to review", "on merge"]
// 								return statuses.filter(
// 									(status) =>
// 										allowedStatusNames.includes(status.name.toLowerCase()) &&
// 										status.name.toLowerCase() !== currentStatusName.toLowerCase(),
// 								)
// 						}

// 					case "Other":
// 					default:
// 						// Остальные роли не видят статусы
// 						return []
// 				}
// 			},

// 			selectTask: (task: RedmineTask) => {
// 				const { loadUserRoles } = get()
// 				set({ selectedTask: task })

// 				// Загружаем роли пользователя для проекта задачи (если проект изменился)
// 				if (task.project?.id) {
// 					loadUserRoles(task.project.id)
// 				}
// 			},

// 			// Timer actions
// 			startTimer: (taskId: number) => {
// 				const { sessions, timerInterval } = get()
// 				const now = Date.now()

// 				// Найти сессию для этой задачи
// 				const existing = sessions.find((s) => s.taskId === taskId)

// 				// Если задача новая и уже есть 3 сессии - не разрешаем
// 				if (!existing && sessions.length >= 3) return

// 				const updatedSessions = sessions.map((session) => {
// 					// Автоматически ставим все другие сессии на паузу
// 					if (
// 						(session.taskId !== taskId || session.noteId !== undefined) &&
// 						session.isRunning &&
// 						session.currentIntervalStart
// 					) {
// 						const elapsed = Date.now() - session.currentIntervalStart
// 						const sessionKey = session.taskId?.toString() || session.noteId || ""
// 						if (timerInterval[sessionKey]) {
// 							clearInterval(timerInterval[sessionKey])
// 						}
// 						return {
// 							...session,
// 							isRunning: false,
// 							totalElapsed: session.totalElapsed + elapsed,
// 							currentIntervalStart: null,
// 						}
// 					}

// 					// Обновляем текущую задачу — запускаем, если она существует
// 					if (session.taskId === taskId) {
// 						return {
// 							...session,
// 							isRunning: true,
// 							currentIntervalStart: now,
// 						}
// 					}

// 					return session
// 				})

// 				// Если задача новая — добавляем
// 				if (!existing) {
// 					updatedSessions.push({
// 						taskId,
// 						startTime: now,
// 						totalElapsed: 0,
// 						currentIntervalStart: now,
// 						isRunning: true,
// 						isFinished: false,
// 						type: "task",
// 					})
// 				}

// 				// Очищаем все предыдущие интервалы
// 				Object.entries(timerInterval).forEach(([key, interval]) => {
// 					clearInterval(interval)
// 				})

// 				// Создаём новый только для этой задачи
// 				const interval = setInterval(() => {
// 					const { sessions } = get()
// 					const updated = sessions.map((session) => {
// 						if (session.taskId === taskId && session.isRunning && session.currentIntervalStart) {
// 							const now = Date.now()
// 							const delta = now - session.currentIntervalStart
// 							return {
// 								...session,
// 								totalElapsed: session.totalElapsed + delta,
// 								currentIntervalStart: now,
// 							}
// 						}
// 						return session
// 					})
// 					set({ sessions: updated })
// 				}, 1000)

// 				set({
// 					sessions: updatedSessions,
// 					timerInterval: { [taskId.toString()]: interval },
// 				})
// 			},

// 			pauseTimer: (taskId: number) => {
// 				const { sessions, timerInterval } = get()
// 				const session = sessions.find((s) => s.taskId === taskId)
// 				if (!session?.isRunning || !session.currentIntervalStart) return

// 				const now = Date.now()
// 				const intervalDuration = now - session.currentIntervalStart

// 				// Очистить только таймер для этой задачи
// 				if (timerInterval && timerInterval[taskId]) {
// 					clearInterval(timerInterval[taskId])
// 					// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 					const { [taskId]: _, ...rest } = timerInterval
// 					set({ timerInterval: rest })
// 				}

// 				set({
// 					sessions: sessions.map((s) =>
// 						s.taskId === taskId
// 							? {
// 								...s,
// 								totalElapsed: s.totalElapsed + intervalDuration,
// 								currentIntervalStart: null,
// 								isRunning: false,
// 							}
// 							: s,
// 					),
// 				})
// 			},

// 			finishTimer: (taskId: number) => {
// 				// const { sessions, pauseTimer, markTaskAsFinished } = get()
// 				const { sessions, pauseTimer } = get()
// 				if (!sessions) return

// 				const session = sessions.find((s) => s.taskId === taskId)
// 				if (!session) return

// 				// Calculate final time including current running interval
// 				let finalTime = session.totalElapsed
// 				if (session.isRunning && session.currentIntervalStart) {
// 					finalTime += Date.now() - session.currentIntervalStart
// 				}

// 				// Pause if running
// 				if (session.isRunning) {
// 					pauseTimer(taskId)
// 				}

// 				set({
// 					sessions: sessions.map((session) =>
// 						session.taskId === taskId
// 							? {
// 								...session,
// 								isRunning: false,
// 								currentIntervalStart: null,
// 								isFinished: true,
// 							}
// 							: session,
// 					),
// 					timeLogModal: {
// 						isOpen: true,
// 						duration: finalTime,
// 					},
// 				})
// 			},

// 			cleanup: () => {
// 				const { timerInterval } = get()

// 				if (timerInterval) {
// 					Object.values(timerInterval).forEach(clearInterval)
// 					set({ timerInterval: {} }) // очищаем объект
// 				}
// 			},

// 			canStartTask: (taskId: number) => {
// 				const { sessions } = get()

// 				// Проверяем, есть ли сессия для этой задачи
// 				const existingSession = sessions.find((s) => s.taskId === taskId)

// 				// Проверяем, есть ли запущенная сессия
// 				const runningSession = sessions.find((s) => s.isRunning)

// 				// Если это существующая задача - можно запустить (возобновить)
// 				if (existingSession) {
// 					return true
// 				}

// 				// Если это новая задача:
// 				// - нельзя запустить, если есть активная сессия
// 				// - нельзя запустить, если уже есть 3 сессии
// 				if (runningSession || sessions.length >= 3) {
// 					return false
// 				}

// 				// Новую задачу можно запустить только если нет активных сессий и меньше 3 сессий
// 				return true
// 			},

// 			// Progress calculation helpers
// 			getElapsedSeconds: (taskId: number) => {
// 				const { sessions } = get()
// 				const session = sessions.find((s) => s.taskId === taskId)

// 				if (!session) return 0

// 				let elapsed = session.totalElapsed

// 				// Если сессия активна, добавляем текущий интервал
// 				if (session.isRunning && session.currentIntervalStart) {
// 					elapsed += Date.now() - session.currentIntervalStart
// 				}

// 				// Конвертируем из миллисекунд в секунды
// 				return Math.floor(elapsed / 1000)
// 			},

// 			getProgressPercentage: (taskId: number, estimatedHours?: number) => {
// 				if (!estimatedHours || estimatedHours <= 0) return 0

// 				const elapsedSeconds = get().getElapsedSeconds(taskId)
// 				const totalSeconds = estimatedHours * 3600

// 				return Math.min(Math.round((elapsedSeconds / totalSeconds) * 100), 100)
// 			},

// 			submitTimeLog: async (data: TimeLogData) => {
// 				const { redmineUrl, apiKey } = get()

// 				try {
// 					const response = await fetch("/api/redmine/time-entries", {
// 						method: "POST",
// 						headers: { "Content-Type": "application/json" },
// 						body: JSON.stringify({
// 							url: redmineUrl,
// 							apiKey,
// 							timeEntry: {
// 								issue_id: data.issueId,
// 								hours: data.hours,
// 								comments: data.comments,
// 								spent_on: data.spentOn,
// 								activity_id: data.activityId,
// 								status_id: data.statusId,
// 							},
// 						}),
// 					})
// 					if (response.ok) {
// 						const { sessions } = get()
// 						const activeSessions = sessions.filter((s) => !s.isFinished)
// 						set({ sessions: activeSessions })
// 					} else {
// 						throw new Error("Ошибка отправки лога")
// 					}
// 				} catch (error) {
// 					console.error("Ошибка отправки лога времени:", error)
// 					throw error
// 				}
// 			},

// 			closeTimeLogModal: () => {
// 				set({
// 					timeLogModal: { isOpen: false },
// 				})
// 			},

// 			// Search and filter
// 			setSearchQuery: (query: string) => {
// 				set({ searchQuery: query })
// 			},

// 			setSelectedProjectId: (projectId: string) => {
// 				set({ selectedProjectId: projectId })
// 				get().filterTasks()
// 			},

// 			setSelectedVersionId: (versionId: string) => {
// 				set({ selectedVersionId: versionId })
// 				get().filterTasks()
// 			},

// 			filterTasks: () => {
// 				const { filteredTasks, selectedProjectId, selectedVersionId } = get()

// 				let filtered = filteredTasks

// 				// Фильтр по проекту
// 				if (selectedProjectId && selectedProjectId !== "all") {
// 					filtered = filtered.filter((task) => task.project?.id.toString() === selectedProjectId)
// 				}

// 				// Фильтр по версии/спринту
// 				if (selectedVersionId && selectedVersionId !== "all") {
// 					if (selectedVersionId === "none") {
// 						filtered = filtered.filter((task) => !task.fixed_version)
// 					} else {
// 						filtered = filtered.filter((task) => task.fixed_version?.id.toString() === selectedVersionId)
// 					}
// 				}

// 				set({ filteredTasks: filtered })
// 			},

// 			// Notes actions
// 			createNote: (title: string, description: string, category?: string) => {
// 				const newNote: Note = {
// 					id: Date.now().toString(),
// 					title,
// 					description,
// 					category,
// 					createdAt: new Date().toISOString(),
// 					updatedAt: new Date().toISOString(),
// 					totalTimeSpent: 0,
// 				}

// 				set((state) => ({
// 					notes: [...state.notes, newNote],
// 				}))
// 			},

// 			updateNote: (id: string, updates: Partial<Note>) => {
// 				set((state) => ({
// 					notes: state.notes.map((note) =>
// 						note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note,
// 					),
// 					selectedNote:
// 						state.selectedNote?.id === id
// 							? { ...state.selectedNote, ...updates, updatedAt: new Date().toISOString() }
// 							: state.selectedNote,
// 				}))
// 			},

// 			deleteNote: (id: string) => {

// 				const { timerInterval } = get()

// 				// Очищаем таймер для удаляемой заметки
// 				if (timerInterval[id]) {
// 					clearInterval(timerInterval[id])
// 					const { [id]: _, ...rest } = timerInterval
// 					set({ timerInterval: rest })
// 				}

// 				set((state) => ({
// 					notes: state.notes.filter((note) => note.id !== id),
// 					selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
// 					sessions: state.sessions.filter((session) => session.noteId !== id),
// 				}))
// 			},

// 			selectNote: (note: Note) => {
// 				set({ selectedNote: note, selectedTask: null })
// 			},

// 			startNoteTimer: (noteId: string) => {
// 				const { sessions, timerInterval } = get()
// 				const now = Date.now()

// 				console.log("Запуск таймера заметки:", noteId)

// 				// Найти сессию для этой заметки
// 				const existing = sessions.find((s) => s.noteId === noteId)

// 				// Если нет существующей сессии и уже есть 3 сессии, не разрешаем создавать новую
// 				if (!existing && sessions.length >= 3) return

// 				// Останавливаем все другие активные сессии
// 				const updatedSessions = sessions.map((session) => {
// 					// Автоматически ставим все другие сессии на паузу
// 					// if (
// 					// 	(session.taskId !== undefined || session.noteId !== noteId) &&
// 					// 	session.isRunning &&
// 					// 	session.currentIntervalStart
// 					// ) {
// 					if (session.isRunning && session.currentIntervalStart) {
// 						// Если это не наша заметка - останавливаем
// 						if (session.noteId !== noteId && session.taskId !== undefined) {
// 							const elapsed = Date.now() - session.currentIntervalStart
// 							const sessionKey = session.taskId?.toString() || session.noteId || ""
// 							if (timerInterval[sessionKey]) {
// 								clearInterval(timerInterval[sessionKey])
// 							}
// 							return {
// 								...session,
// 								isRunning: false,
// 								totalElapsed: session.totalElapsed + elapsed,
// 								currentIntervalStart: null,
// 							}
// 						}
// 					}

// 					// Если это наша заметка - запускаем
// 					if (session.noteId === noteId) {
// 						return {
// 							...session,
// 							isRunning: true,
// 							currentIntervalStart: now,
// 						}
// 					}

// 					return session
// 				})

// 				// Если заметка новая — добавляем
// 				if (!existing) {
// 					updatedSessions.push({
// 						noteId,
// 						startTime: now,
// 						totalElapsed: 0,
// 						currentIntervalStart: now,
// 						isRunning: true,
// 						isFinished: false,
// 						type: "note",
// 					})
// 				}

// 				// Очищаем все предыдущие интервалы
// 				Object.entries(timerInterval).forEach(([key, interval]) => {
// 					if (key !== noteId) {
// 						console.log("Очищаем интервал:", key)
// 						clearInterval(interval)
// 					}
// 				})

// 				// Создаём новый только для этой заметки
// 				const interval = setInterval(() => {
// 					const { sessions } = get()
// 					const updated = sessions.map((session) => {
// 						if (session.noteId === noteId && session.isRunning && session.currentIntervalStart) {
// 							const now = Date.now()
// 							const delta = now - session.currentIntervalStart
// 							return {
// 								...session,
// 								totalElapsed: session.totalElapsed + delta,
// 								currentIntervalStart: now,
// 							}
// 						}
// 						return session
// 					})
// 					set({ sessions: updated })
// 				}, 1000)

// 				set({
// 					sessions: updatedSessions,
// 					timerInterval: {
// 						...Object.fromEntries(Object.entries(timerInterval).filter(([key]) => key === noteId)),
// 						[noteId]: interval,
// 					},
// 				})
// 			},

// 			pauseNoteTimer: (noteId: string) => {
// 				const { sessions, timerInterval, notes, updateNote } = get()
// 				const session = sessions.find((s) => s.noteId === noteId)
// 				if (!session?.isRunning || !session.currentIntervalStart) return

// 				const now = Date.now()
// 				const intervalDuration = now - session.currentIntervalStart

// 				// Очистить только таймер для этой заметки
// 				if (timerInterval && timerInterval[noteId]) {
// 					clearInterval(timerInterval[noteId])
// 					const { [noteId]: _, ...rest } = timerInterval
// 					set({ timerInterval: rest })
// 				}

// 				// Обновляем время заметки при паузе
// 				const note = notes.find((n) => n.id === noteId)
// 				if (note) {
// 					updateNote(note.id, {
// 						totalTimeSpent: note.totalTimeSpent + intervalDuration,
// 					})
// 				}

// 				set({
// 					sessions: sessions.map((s) =>
// 						s.noteId === noteId
// 							? {
// 								...s,
// 								totalElapsed: s.totalElapsed + intervalDuration,
// 								currentIntervalStart: null,
// 								isRunning: false,
// 							}
// 							: s,
// 					),
// 				})
// 			},

// 			finishNoteTimer: (noteId: string) => {
// 				const { sessions, pauseNoteTimer, notes, updateNote } = get()
// 				const session = sessions.find((s) => s.noteId === noteId)
// 				if (!session) return

// 				// Calculate final time including current running interval
// 				let finalTime = session.totalElapsed
// 				if (session.isRunning && session.currentIntervalStart) {
// 					finalTime += Date.now() - session.currentIntervalStart
// 				}

// 				// Pause if running
// 				if (session.isRunning) {
// 					pauseNoteTimer(noteId)
// 				}

// 				// Update note with spent time - находим заметку в массиве
// 				const note = notes.find((n) => n.id === noteId)
// 				if (note) {
// 					updateNote(note.id, {
// 						totalTimeSpent: note.totalTimeSpent + finalTime,
// 					})
// 				}

// 				// Remove finished session
// 				set({
// 					sessions: sessions.filter((s) => s.noteId !== noteId),
// 				})
// 			},

// 			canStartNote: (noteId: string) => {
// 				const { sessions } = get()

// 				// Проверяем, есть ли сессия для этой заметки
// 				const existingSession = sessions.find((s) => s.noteId === noteId)

// 				// Проверяем, есть ли запущенная сессия
// 				const runningSession = sessions.find((s) => s.isRunning)

// 				// Если это существующая заметка - можно запустить (возобновить)
// 				if (existingSession) {
// 					return true
// 				}

// 				// Если это новая заметка:
// 				// - нельзя запустить, если есть активная сессия
// 				// - нельзя запустить, если уже есть 3 сессии
// 				if (runningSession || sessions.length >= 3) {
// 					return false
// 				}

// 				// Новую заметку можно запустить только если нет активных сессий и меньше 3 сессий
// 				return true
// 			},

// 			// View actions
// 			setCurrentView: (view: "tasks" | "notes") => {
// 				set({ currentView: view })
// 			},

// 			getNoteElapsedSeconds: (noteId: string) => {
// 				const { sessions, notes } = get()
// 				const session = sessions.find((s) => s.noteId === noteId)
// 				const note = notes.find((n) => n.id === noteId)

// 				// Начинаем с сохраненного времени заметки
// 				let elapsed = note?.totalTimeSpent || 0

// 				// Добавляем время текущей сессии если она есть
// 				if (session) {
// 					elapsed += session.totalElapsed

// 					// Если сессия активна, добавляем текущий интервал
// 					if (session.isRunning && session.currentIntervalStart) {
// 						elapsed += Date.now() - session.currentIntervalStart
// 					}
// 				}

// 				// Конвертируем из миллисекунд в секунды
// 				return Math.floor(elapsed / 1000)
// 			},
// 		}),
// 		{
// 			name: "redmine-store",
// 			storage: createJSONStorage(() => localStorage),
// 			partialize: (state) => ({
// 				redmineUrl: state.redmineUrl,
// 				apiKey: state.apiKey,
// 				isConfigured: state.isConfigured,
// 				currentUserId: state.currentUserId,
// 				notes: state.notes, // Сохраняем заметки
// 				currentView: state.currentView, // Сохраняем текущий вид
// 				sessions: Array.isArray(state.sessions)
// 					? state.sessions.map((session) => ({
// 						...session,
// 						currentIntervalStart: null,
// 						isRunning: false,
// 					}))
// 					: [],
// 			}),
// 			onRehydrateStorage: () => (state, error) => {
// 				if (error) {
// 					console.error("Ошибка при гидратации стора:", error)
// 				} else {
// 					// выставляем после успешной гидратации
// 					setTimeout(() => {
// 						useRedmineStore.setState({ hasHydrated: true })
// 					}, 0)
// 				}
// 			},
// 		},
// 	),
// )
