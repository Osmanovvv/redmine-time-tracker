"use client"

import { useEffect } from "react"
import { useRedmineStore } from "@/lib/store"
import { TaskList } from "@/components/task-list"
import { TaskDetails } from "@/components/task-details"
import { NotesList } from "@/components/notes-list"
import { NoteDetails } from "@/components/note-details"
import { Header } from "@/components/header"
import { TimeLogModal } from "@/components/time-log-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, FileText } from "lucide-react"

export function MainInterface() {
	const { loadTasks, isLoading, userRole, currentView, setCurrentView } = useRedmineStore()

	useEffect(() => {
		loadTasks()
	}, [loadTasks])

	const showNotesTab = userRole === "Manager"

	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* Navigation tabs for managers */}
			{showNotesTab && (
				<div className="border-b bg-background">
					<div className="flex items-center gap-2 px-6 py-2">
						<Button
							variant={currentView === "tasks" ? "default" : "ghost"}
							size="sm"
							onClick={() => setCurrentView("tasks")}
							className="flex items-center gap-2"
						>
							<CheckSquare className="w-4 h-4" />
							Задачи
						</Button>
						<Button
							variant={currentView === "notes" ? "default" : "ghost"}
							size="sm"
							onClick={() => setCurrentView("notes")}
							className="flex items-center gap-2"
						>
							<FileText className="w-4 h-4" />
							Заметки
						</Button>
						<Badge variant="outline" className="ml-2 text-xs">
							Режим менеджера
						</Badge>
					</div>
				</div>
			)}

			<div
				className="flex h-[calc(100vh-4rem)]"
				style={{ height: showNotesTab ? "calc(100vh-8rem)" : "calc(100vh-4rem)" }}
			>
				<div className="w-1/3 border-r">{currentView === "tasks" ? <TaskList /> : <NotesList />}</div>
				<div className="flex-1">{currentView === "tasks" ? <TaskDetails /> : <NoteDetails />}</div>
			</div>
			<TimeLogModal />
		</div>
	)
}
