"use client"

import { useEffect } from "react"
import { useRedmineStore } from "@/lib/store"
import { TaskList } from "@/components/task-list"
import { TaskDetails } from "@/components/task-details"
import { Header } from "@/components/header"
import { TimeLogModal } from "@/components/time-log-modal"

export function MainInterface() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { loadTasks, isLoading } = useRedmineStore()

	useEffect(() => {
		loadTasks()
	}, [loadTasks])

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="flex h-[calc(100vh-4rem)]">
				<div className="w-1/3 border-r">
					<TaskList />
				</div>
				<div className="flex-1">
					<TaskDetails />
				</div>
			</div>
			<TimeLogModal />
		</div>
	)
}
