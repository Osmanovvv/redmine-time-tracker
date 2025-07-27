import { create } from "zustand"
import type { RedmineTask, Project, Version, Role, UserRole, Membership, TasksStore } from "./types/redmine"
import { useConfigStore } from "./config"

export const useTasksStore = create<TasksStore>((set, get) => ({
	tasks: [],
	selectedTask: null,
	isLoading: false,
	isSearching: false,
	searchQuery: "",
	selectedProjectId: "",
	selectedVersionId: "",
	filteredTasks: [],
	projects: [],
	versions: [],
	userRoles: [],
	userRole: "Other",

	loadCurrentUser: async () => {
		const { redmineUrl, apiKey, setCurrentUserId } = useConfigStore.getState()
		if (!redmineUrl || !apiKey) return

		try {
			const response = await fetch("/api/redmine/current-user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: redmineUrl, apiKey }),
			})

			if (response.ok) {
				const data = await response.json()
				setCurrentUserId(data.user?.id)
			}
		} catch (error) {
			console.error("Ошибка загрузки текущего пользователя:", error)
		}
	},

	loadTasks: async () => {
		const { redmineUrl, apiKey } = useConfigStore.getState()
		if (!redmineUrl || !apiKey) return

		set({ isLoading: true })
		try {
			await get().loadCurrentUser()

			const response = await fetch("/api/redmine/issues", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: redmineUrl, apiKey }),
			})

			if (response.ok) {
				const data = await response.json()
				const tasks = data.issues || []
				set({ tasks, filteredTasks: tasks })

				// Извлекаем уникальные проекты из задач
				const uniqueProjects = tasks.reduce((acc: Project[], task: RedmineTask) => {
					if (task.project && !acc.find((p) => p.id === task.project!.id)) {
						acc.push(task.project)
					}
					return acc
				}, [])
				set({ projects: uniqueProjects })

				await get().loadVersions()

				// Если есть задачи, загружаем роли для первого проекта
				if (tasks.length > 0 && tasks[0].project?.id) {
					await get().loadUserRoles(tasks[0].project.id)
				}
			}
		} catch (error) {
			console.error("Ошибка загрузки задач:", error)
		} finally {
			set({ isLoading: false })
		}
	},

	searchTasks: async (query: string) => {
		const { redmineUrl, apiKey } = useConfigStore.getState()
		if (!redmineUrl || !apiKey) return

		if (!query.trim()) {
			get().loadTasks()
			return
		}

		set({ isSearching: true })
		try {
			const response = await fetch("/api/redmine/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					url: redmineUrl,
					apiKey,
					query: query.trim(),
					limit: 50,
				}),
			})

			if (response.ok) {
				const data = await response.json()
				const searchResults = data.issues || []

				set({
					filteredTasks: searchResults,
					tasks: get().tasks.length === 0 ? searchResults : get().tasks,
				})

				// Извлекаем проекты из результатов поиска
				const uniqueProjects = searchResults.reduce((acc: Project[], task: RedmineTask) => {
					if (task.project && !acc.find((p) => p.id === task.project!.id)) {
						acc.push(task.project)
					}
					return acc
				}, [])

				const existingProjects = get().projects
				const allProjects = [...existingProjects]
				uniqueProjects.forEach((project: Project) => {
					if (!allProjects.find((p) => p.id === project.id)) {
						allProjects.push(project)
					}
				})
				set({ projects: allProjects })
			} else {
				set({ filteredTasks: [] })
			}
		} catch (error) {
			console.error("Ошибка поиска задач:", error)
			set({ filteredTasks: [] })
		} finally {
			set({ isSearching: false })
		}
	},

	selectTask: (task: RedmineTask) => {
		set({ selectedTask: task })
		if (task.project?.id) {
			get().loadUserRoles(task.project.id)
		}
	},

	setSearchQuery: (query: string) => {
		set({ searchQuery: query })
	},

	setSelectedProjectId: (projectId: string) => {
		set({ selectedProjectId: projectId })
		get().filterTasks()
	},

	setSelectedVersionId: (versionId: string) => {
		set({ selectedVersionId: versionId })
		get().filterTasks()
	},

	filterTasks: () => {
		const { filteredTasks, selectedProjectId, selectedVersionId } = get()
		let filtered = filteredTasks

		if (selectedProjectId && selectedProjectId !== "all") {
			filtered = filtered.filter((task) => task.project?.id.toString() === selectedProjectId)
		}

		if (selectedVersionId && selectedVersionId !== "all") {
			if (selectedVersionId === "none") {
				filtered = filtered.filter((task) => !task.fixed_version)
			} else {
				filtered = filtered.filter((task) => task.fixed_version?.id.toString() === selectedVersionId)
			}
		}

		set({ filteredTasks: filtered })
	},

	loadVersions: async () => {
		const { redmineUrl, apiKey } = useConfigStore.getState()
		if (!redmineUrl || !apiKey) return

		try {
			const response = await fetch("/api/redmine/versions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: redmineUrl, apiKey }),
			})

			if (response.ok) {
				const data = await response.json()
				set({ versions: data.versions || [] })
			}
		} catch (error) {
			console.error("Ошибка загрузки версий:", error)
		}
	},

	loadUserRoles: async (projectId: number) => {
		const { redmineUrl, apiKey, currentUserId } = useConfigStore.getState()
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

				let currentUserMembership = null
				if (currentUserId) {
					currentUserMembership = memberships.find((membership) => membership.user.id === currentUserId)
				}

				if (!currentUserMembership && memberships.length > 0) {
					currentUserMembership = memberships[0]
				}

				if (currentUserMembership) {
					const roles = currentUserMembership.roles
					const userRole = get().determineUserRole(roles)

					set({
						userRoles: roles,
						userRole,
					})
				}
			}
		} catch (error) {
			console.error("Ошибка загрузки ролей пользователя:", error)
		}
	},

	determineUserRole: (roles: Role[]): UserRole => {
		const roleNames = roles.map((role) => role.name)

		if (roleNames.includes("Manager")) {
			return "Manager"
		} else if (roleNames.includes("Developer")) {
			return "Developer"
		} else {
			return "Other"
		}
	},
}))
