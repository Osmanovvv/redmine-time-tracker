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
}


export interface TimeSession {
	taskId: number
	startTime: number
	totalElapsed: number // Total time accumulated from previous intervals
	currentIntervalStart: number | null // Start time of current running interval
	isRunning: boolean
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

	// Activities
	activities: Activity[]

	// Time tracking
	currentSession: TimeSession | null

	// Modal
	timeLogModal: {
		isOpen: boolean
		duration?: number
	}

	// Timer
	timerInterval: NodeJS.Timeout | null

	// Actions
	saveConfig: (url: string, apiKey: string) => void
	clearConfig: () => void
	loadConfig: () => void
	testConnection: (url: string, apiKey: string) => Promise<boolean>
	loadTasks: () => Promise<void>
	loadActivities: () => Promise<void>
	selectTask: (task: RedmineTask) => void
	startTimer: (taskId: number) => void
	pauseTimer: () => void
	finishTimer: () => void
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
			currentSession: null,
			timeLogModal: { isOpen: false },
			timerInterval: null,

			// Configuration actions
			saveConfig: (url: string, apiKey: string) => {
				set({
					redmineUrl: url.replace(/\/$/, ""), // Remove trailing slash
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
					currentSession: null,
				})
			},

			loadConfig: () => {
				const state = get()
				if (state.redmineUrl && state.apiKey) {
					set({ isConfigured: true })
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
				const { currentSession, timerInterval } = get()
				const now = Date.now()

				// Clear existing interval if any
				if (timerInterval) {
					clearInterval(timerInterval)
				}

				if (currentSession?.taskId === taskId && !currentSession.isRunning) {
					// Resume existing session
					set({
						currentSession: {
							...currentSession,
							currentIntervalStart: now,
							isRunning: true,
						},
					})
				} else {
					// Start new session
					set({
						currentSession: {
							taskId,
							startTime: now,
							totalElapsed: 0,
							currentIntervalStart: now,
							isRunning: true,
						},
					})
				}

				// Start the timer interval
				const interval = setInterval(() => {
					const state = get()
					if (state.currentSession?.isRunning && state.currentSession.taskId === taskId) {
						// Force re-render by updating the session
						set({
							currentSession: { ...state.currentSession },
						})
					}
				}, 1000)

				set({ timerInterval: interval })
			},

			pauseTimer: () => {
				const { currentSession, timerInterval } = get()
				if (!currentSession?.isRunning || !currentSession.currentIntervalStart) return

				const now = Date.now()
				const intervalDuration = now - currentSession.currentIntervalStart

				// Clear the interval
				if (timerInterval) {
					clearInterval(timerInterval)
					set({ timerInterval: null })
				}

				set({
					currentSession: {
						...currentSession,
						totalElapsed: currentSession.totalElapsed + intervalDuration,
						currentIntervalStart: null,
						isRunning: false,
					},
				})
			},

			finishTimer: () => {
				const { currentSession, pauseTimer } = get()
				if (!currentSession) return

				// Calculate final time including current running interval
				let finalTime = currentSession.totalElapsed
				if (currentSession.isRunning && currentSession.currentIntervalStart) {
					finalTime += Date.now() - currentSession.currentIntervalStart
				}

				// Pause if running
				if (currentSession.isRunning) {
					pauseTimer()
				}

				set({
					timeLogModal: {
						isOpen: true,
						duration: finalTime,
					},
				})
			},

			cleanup: () => {
				const { timerInterval } = get()
				if (timerInterval) {
					clearInterval(timerInterval)
					set({ timerInterval: null })
				}
			},

			canStartTask: (taskId: number) => {
				const { currentSession } = get()
				return !currentSession || currentSession.taskId === taskId || !currentSession.isRunning
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
						// Clear current session
						set({ currentSession: null })
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
					currentSession: null,
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
				currentSession: state.currentSession
					? {
						...state.currentSession,
						currentIntervalStart: null, // Don't persist running state
						isRunning: false, // Always start paused after reload
					}
					: null,
			}),
		},
	),
)
