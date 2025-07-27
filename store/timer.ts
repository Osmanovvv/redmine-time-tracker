import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { TimeSession, Note, TimerStore } from "./types/redmine"
import { useModalStore } from "@/store/modal"

export const useTimerStore = create<TimerStore>()(
	persist(
		(set, get) => ({
			sessions: [],
			timerInterval: {},
			notes: [],
			selectedNote: null,
			currentView: "tasks",

			startTimer: (taskId: number) => {
				const { sessions, timerInterval } = get()
				const now = Date.now()

				const existing = sessions.find((s) => s.taskId === taskId)
				if (!existing && sessions.length >= 3) return

				const updatedSessions = sessions.map((session) => {
					if (
						(session.taskId !== taskId || session.noteId !== undefined) &&
						session.isRunning &&
						session.currentIntervalStart
					) {
						const elapsed = Date.now() - session.currentIntervalStart
						const sessionKey = session.taskId?.toString() || session.noteId || ""
						if (timerInterval[sessionKey]) {
							clearInterval(timerInterval[sessionKey])
						}
						return {
							...session,
							isRunning: false,
							totalElapsed: session.totalElapsed + elapsed,
							currentIntervalStart: null,
						}
					}

					if (session.taskId === taskId) {
						return {
							...session,
							isRunning: true,
							currentIntervalStart: now,
						}
					}

					return session
				})

				if (!existing) {
					updatedSessions.push({
						taskId,
						startTime: now,
						totalElapsed: 0,
						currentIntervalStart: now,
						isRunning: true,
						isFinished: false,
						type: "task",
					})
				}

				Object.entries(timerInterval).forEach(([key, interval]) => {
					clearInterval(interval)
				})

				const interval = setInterval(() => {
					const { sessions } = get()
					const updated = sessions.map((session) => {
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
					timerInterval: { [taskId.toString()]: interval },
				})
			},

			pauseTimer: (taskId: number) => {
				const { sessions, timerInterval } = get()
				const session = sessions.find((s) => s.taskId === taskId)
				if (!session?.isRunning || !session.currentIntervalStart) return

				const now = Date.now()
				const intervalDuration = now - session.currentIntervalStart

				if (timerInterval && timerInterval[taskId]) {
					clearInterval(timerInterval[taskId])
					const { [taskId]: _, ...rest } = timerInterval
					set({ timerInterval: rest })
				}

				set({
					sessions: sessions.map((s) =>
						s.taskId === taskId
							? {
								...s,
								totalElapsed: s.totalElapsed + intervalDuration,
								currentIntervalStart: null,
								isRunning: false,
							}
							: s,
					),
				})
			},

			finishTimer: (taskId: number) => {
				const { sessions, pauseTimer } = get()
				if (!sessions) return

				const session = sessions.find((s) => s.taskId === taskId)
				if (!session) return

				let finalTime = session.totalElapsed
				if (session.isRunning && session.currentIntervalStart) {
					finalTime += Date.now() - session.currentIntervalStart
				}

				if (session.isRunning) {
					pauseTimer(taskId)
				}

				set({
					sessions: sessions.map((session) =>
						session.taskId === taskId
							? {
								...session,
								isRunning: false,
								currentIntervalStart: null,
								isFinished: true,
							}
							: session,
					),
				})

				// 👉 Вызов из другого стора:
				useModalStore.getState().openTimeLogModal(finalTime)
			},

			canStartTask: (taskId: number) => {
				const { sessions } = get()
				const existingSession = sessions.find((s) => s.taskId === taskId)
				const runningSession = sessions.find((s) => s.isRunning)

				if (existingSession) return true
				if (runningSession || sessions.length >= 3) return false
				return true
			},

			getElapsedSeconds: (taskId: number) => {
				const { sessions } = get()
				const session = sessions.find((s) => s.taskId === taskId)
				if (!session) return 0

				let elapsed = session.totalElapsed
				if (session.isRunning && session.currentIntervalStart) {
					elapsed += Date.now() - session.currentIntervalStart
				}

				return Math.floor(elapsed / 1000)
			},

			getProgressPercentage: (taskId: number, estimatedHours?: number) => {
				if (!estimatedHours || estimatedHours <= 0) return 0
				const elapsedSeconds = get().getElapsedSeconds(taskId)
				const totalSeconds = estimatedHours * 3600
				return Math.min(Math.round((elapsedSeconds / totalSeconds) * 100), 100)
			},

			cleanup: () => {
				const { timerInterval } = get()
				if (timerInterval) {
					Object.values(timerInterval).forEach(clearInterval)
					set({ timerInterval: {} })
				}
			},

			// Notes methods
			createNote: (title: string, description: string, category?: string) => {
				const newNote: Note = {
					id: Date.now().toString(),
					title,
					description,
					category,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					totalTimeSpent: 0,
				}

				set((state) => ({
					notes: [...state.notes, newNote],
				}))
			},

			updateNote: (id: string, updates: Partial<Note>) => {
				set((state) => ({
					notes: state.notes.map((note) =>
						note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note,
					),
					selectedNote:
						state.selectedNote?.id === id
							? { ...state.selectedNote, ...updates, updatedAt: new Date().toISOString() }
							: state.selectedNote,
				}))
			},

			deleteNote: (id: string) => {
				const { timerInterval } = get()

				if (timerInterval[id]) {
					clearInterval(timerInterval[id])
					const { [id]: _, ...rest } = timerInterval
					set({ timerInterval: rest })
				}

				set((state) => ({
					notes: state.notes.filter((note) => note.id !== id),
					selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
					sessions: state.sessions.filter((session) => session.noteId !== id),
				}))
			},

			selectNote: (note: Note) => {
				set({ selectedNote: note })
			},

			startNoteTimer: (noteId: string) => {
				const { sessions, timerInterval } = get()
				const now = Date.now()

				const existing = sessions.find((s) => s.noteId === noteId)
				if (!existing && sessions.length >= 3) return

				const updatedSessions = sessions.map((session) => {
					if (
						(session.noteId !== noteId || session.taskId !== undefined) &&
						session.isRunning &&
						session.currentIntervalStart
					) {
						const elapsed = Date.now() - session.currentIntervalStart
						const sessionKey = session.taskId?.toString() || session.noteId || ""
						if (timerInterval[sessionKey]) {
							clearInterval(timerInterval[sessionKey])
						}
						return {
							...session,
							isRunning: false,
							totalElapsed: session.totalElapsed + elapsed,
							currentIntervalStart: null,
						}
					}

					if (session.noteId === noteId) {
						return {
							...session,
							isRunning: true,
							currentIntervalStart: now,
						}
					}

					return session
				})

				if (!existing) {
					updatedSessions.push({
						noteId,
						startTime: now,
						totalElapsed: 0,
						currentIntervalStart: now,
						isRunning: true,
						isFinished: false,
						type: "note",
					})
				}

				// Остановить все интервалы
				Object.entries(timerInterval).forEach(([key, interval]) => {
					clearInterval(interval)
				})

				// Новый интервал
				const interval = setInterval(() => {
					const { sessions } = get()
					const updated = sessions.map((session) => {
						if (session.noteId === noteId && session.isRunning && session.currentIntervalStart) {
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
					timerInterval: {
						[noteId]: interval,
					},
				})
			},

			pauseNoteTimer: (noteId: string) => {
				const { sessions, timerInterval, notes, updateNote } = get()
				const session = sessions.find((s) => s.noteId === noteId)
				if (!session?.isRunning || !session.currentIntervalStart) return

				const now = Date.now()
				const intervalDuration = now - session.currentIntervalStart

				if (timerInterval && timerInterval[noteId]) {
					clearInterval(timerInterval[noteId])
					const { [noteId]: _, ...rest } = timerInterval
					set({ timerInterval: rest })
				}

				const note = notes.find((n) => n.id === noteId)
				if (note) {
					updateNote(note.id, {
						totalTimeSpent: note.totalTimeSpent + intervalDuration,
					})
				}

				set({
					sessions: sessions.map((s) =>
						s.noteId === noteId
							? {
								...s,
								totalElapsed: s.totalElapsed + intervalDuration,
								currentIntervalStart: null,
								isRunning: false,
							}
							: s,
					),
				})
			},

			finishNoteTimer: (noteId: string) => {
				const { sessions, pauseNoteTimer, notes, updateNote } = get()
				const session = sessions.find((s) => s.noteId === noteId)
				if (!session) return

				let finalTime = session.totalElapsed
				if (session.isRunning && session.currentIntervalStart) {
					finalTime += Date.now() - session.currentIntervalStart
				}

				if (session.isRunning) {
					pauseNoteTimer(noteId)
				}

				const note = notes.find((n) => n.id === noteId)
				if (note) {
					updateNote(note.id, {
						totalTimeSpent: note.totalTimeSpent + finalTime,
					})
				}

				set({
					sessions: sessions.filter((s) => s.noteId !== noteId),
				})
			},

			canStartNote: (noteId: string) => {
				const { sessions } = get()
				const existingSession = sessions.find((s) => s.noteId === noteId)
				const runningCount = sessions.filter((s) => s.isRunning).length

				// Разрешаем запуск, если уже есть сессия для этой заметки
				if (existingSession) return true

				// Можно запускать до 3 сессий одновременно
				return runningCount < 3
			},

			getNoteElapsedSeconds: (noteId: string) => {
				const { sessions, notes } = get()
				const session = sessions.find((s) => s.noteId === noteId)
				const note = notes.find((n) => n.id === noteId)

				let elapsed = note?.totalTimeSpent || 0

				if (session) {
					elapsed += session.totalElapsed
					if (session.isRunning && session.currentIntervalStart) {
						elapsed += Date.now() - session.currentIntervalStart
					}
				}

				return Math.floor(elapsed / 1000)
			},

			setCurrentView: (view: "tasks" | "notes") => {
				set({ currentView: view })
			},
		}),
		{
			name: "redmine-timer",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				notes: state.notes,
				currentView: state.currentView,
				sessions: Array.isArray(state.sessions)
					? state.sessions.map((session) => ({
						...session,
						currentIntervalStart: null,
						isRunning: false,
					}))
					: [],
			}),
		},
	),
)