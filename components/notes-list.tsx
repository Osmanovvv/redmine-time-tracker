"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { useRedmineStore } from "@/lib/store"
import { useTimerStore } from "@/store/timer"
import { cn, formatTime } from "@/lib/utils"
import { Clock, Play, Search, Plus, FileText, Timer } from "lucide-react"
import { CreateNoteModal } from "./create-note-modal"

export function NotesList() {
	const { notes, selectedNote, selectNote, sessions, deleteNote, getNoteElapsedSeconds } = useTimerStore()

	const [searchQuery, setSearchQuery] = useState("")
	const [showCreateModal, setShowCreateModal] = useState(false)
	// const [, forceUpdate] = useState(0)

	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		forceUpdate((n) => n + 1)
	// 	}, 1000)
	// 	return () => clearInterval(interval)
	// }, [])

	// Фильтрация заметок по поисковому запросу
	const filteredNotes = notes.filter(
		(note) =>
			note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(note.category && note.category.toLowerCase().includes(searchQuery.toLowerCase())),
	)

	// Функция для получения активной сессии заметки
	const getNoteSession = (noteId: string) => {
		return sessions.find((s) => s.noteId === noteId)
	}

	return (
		<div className="p-4 h-full overflow-auto">
			<div className="space-y-4 mb-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Заметки</h2>
					<Button onClick={() => setShowCreateModal(true)} size="sm">
						<Plus className="w-4 h-4 mr-2" />
						Создать заметку
					</Button>
				</div>

				{/* Поиск */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder="Поиск по заметкам..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			<div className="space-y-3">
				{filteredNotes.map((note) => {
					const noteSession = getNoteSession(note.id)
					const isRunning = noteSession?.isRunning || false

					return (
						<Card
							key={note.id}
							// className={cn(
							// 	"cursor-pointer transition-colors hover:bg-muted/50",
							// 	selectedNote?.id === note.id && "ring-2 ring-primary",
							// 	isRunning && "bg-green-50 border-green-200",
							// )}
							className={cn(
								"relative cursor-pointer transition-colors hover:bg-muted/50 pl-2",
								selectedNote?.id === note.id && "ring-2 ring-primary",
								isRunning && "bg-green-50 border-green-200"
							)}
							onClick={() => selectNote(note)}
						>
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<FileText className="w-4 h-4 text-muted-foreground" />
											{isRunning && (
												<div className="flex items-center gap-1 text-green-600">
													<Play className="w-3 h-3" />
													<Clock className="w-3 h-3" />
												</div>
											)}
										</div>
										<h3 className="font-medium text-sm leading-tight line-clamp-1">{note.title}</h3>

										{note.description && (
											<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.description}</p>
										)}

										<div className="flex items-center gap-2 mt-2">
											{note.category && (
												<Badge variant="outline" className="text-xs">
													{note.category}
												</Badge>
											)}

											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Timer className="w-3 h-3" />
												<span>{formatTime(getNoteElapsedSeconds(note.id) * 1000)}</span>
											</div>
										</div>

										<div className="text-xs text-muted-foreground mt-1">
											Создано: {new Date(note.createdAt).toLocaleDateString()}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}

				{filteredNotes.length === 0 && (
					<div className="text-center text-muted-foreground py-8">
						<FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>{searchQuery ? "Заметки не найдены" : "Нет заметок"}</p>
						{searchQuery && <p className="text-sm mt-2">Попробуйте изменить критерии поиска</p>}
						{!searchQuery && (
							<Button onClick={() => setShowCreateModal(true)} variant="outline" className="mt-4">
								<Plus className="w-4 h-4 mr-2" />
								Создать первую заметку
							</Button>
						)}
					</div>
				)}
			</div>

			<CreateNoteModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
		</div>
	)
}
