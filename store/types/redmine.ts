//tasks.ts
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
	project?: {
		id: number
		name: string
	}
	fixed_version?: {
		id: number
		name: string
	}
}

export interface Role {
	id: number
	name: string
}

export interface Version {
	id: number
	name: string
	status: string
	project: {
		id: number
		name: string
	}
}

export interface Project {
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



//activities.ts
export interface Activity {
	id: number
	name: string
}

export interface ActivitiesStore {
	activities: Activity[]
	loadActivities: () => Promise<void>
}



//config.ts
export interface ConfigStore {
	redmineUrl: string
	apiKey: string
	isConfigured: boolean
	currentUserId: number | null
	hasHydrated: boolean

	saveConfig: (url: string, apiKey: string) => void
	clearConfig: () => void
	loadConfig: () => void
	testConnection: (url: string, apiKey: string) => Promise<boolean>
	setCurrentUserId: (userId: number | null) => void
	setHasHydrated: (hydrated: boolean) => void
}



//modal.ts
export interface ModalStore {
	timeLogModal: {
		isOpen: boolean
		duration?: number
	}

	openTimeLogModal: (duration: number) => void
	closeTimeLogModal: () => void
}



//statuses.ts
export interface Status {
	id: number
	name: string
	allowedTransitions?: string[]
}

export interface StatusesStore {
	statuses: Status[]

	loadStatuses: () => Promise<void>
	getFilteredStatuses: (currentStatusName: string, userRole: UserRole) => Status[]
	canChangeStatus: (currentStatusName: string, userRole: UserRole) => boolean
}

export type UserRole = "Manager" | "Developer" | "Other"



//tasks.ts
export interface TasksStore {
	tasks: RedmineTask[]
	selectedTask: RedmineTask | null
	isLoading: boolean
	isSearching: boolean
	searchQuery: string
	selectedProjectId: string
	selectedVersionId: string
	filteredTasks: RedmineTask[]
	projects: Project[]
	versions: Version[]
	userRoles: Role[]
	userRole: UserRole

	loadTasks: () => Promise<void>
	searchTasks: (query: string) => Promise<void>
	selectTask: (task: RedmineTask) => void
	setSearchQuery: (query: string) => void
	setSelectedProjectId: (projectId: string) => void
	setSelectedVersionId: (versionId: string) => void
	filterTasks: () => void
	loadVersions: () => Promise<void>
	loadUserRoles: (projectId: number) => Promise<void>
	loadCurrentUser: () => Promise<void>
	determineUserRole: (roles: Role[]) => UserRole
}



//timeLog.ts
export interface TimeLogStore {
	submitTimeLog: (data: TimeLogData) => Promise<void>
}

export interface TimeLogData {
	issueId: number
	hours: number
	comments: string
	spentOn: string
	activityId: number
	statusId: number
}



//timer.ts
export interface TimerStore {
	sessions: TimeSession[]
	timerInterval: Record<string, ReturnType<typeof setInterval>>
	notes: Note[]
	selectedNote: Note | null
	currentView: "tasks" | "notes"

	startTimer: (taskId: number) => void
	pauseTimer: (taskId: number) => void
	finishTimer: (taskId: number) => void
	canStartTask: (taskId: number) => boolean
	getElapsedSeconds: (taskId: number) => number
	getProgressPercentage: (taskId: number, estimatedHours?: number) => number
	cleanup: () => void

	// Notes
	createNote: (title: string, description: string, category?: string) => void
	updateNote: (id: string, updates: Partial<Note>) => void
	deleteNote: (id: string) => void
	selectNote: (note: Note) => void
	startNoteTimer: (noteId: string) => void
	pauseNoteTimer: (noteId: string) => void
	finishNoteTimer: (noteId: string) => void
	canStartNote: (noteId: string) => boolean
	getNoteElapsedSeconds: (noteId: string) => number
	setCurrentView: (view: "tasks" | "notes") => void
}

export interface Note {
	id: string
	title: string
	description: string
	createdAt: string
	updatedAt: string
	category?: string
	totalTimeSpent: number // в миллисекундах
}

export interface TimeSession {
	taskId?: number
	noteId?: string
	startTime: number
	totalElapsed: number
	currentIntervalStart: number | null
	isRunning: boolean
	isFinished: boolean
	type: "task" | "note"
}