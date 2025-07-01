"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRedmineStore } from "@/lib/store"
import { Plus } from "lucide-react"

interface CreateNoteModalProps {
	isOpen: boolean
	onClose: () => void
}

export function CreateNoteModal({ isOpen, onClose }: CreateNoteModalProps) {
	const { createNote } = useRedmineStore()

	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")
	const [category, setCategory] = useState("")

	const handleSubmit = () => {
		if (!title.trim()) return

		createNote(title.trim(), description.trim(), category.trim() || undefined)

		// Очищаем форму
		setTitle("")
		setDescription("")
		setCategory("")
		onClose()
	}

	const handleClose = () => {
		setTitle("")
		setDescription("")
		setCategory("")
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Plus className="w-5 h-5" />
						Создать заметку
					</DialogTitle>
					<DialogDescription>Создайте новую заметку для трекинга времени</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Название *</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Введите название заметки"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="category">Категория</Label>
						<Input
							id="category"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							placeholder="Например: Встречи, Планирование, Анализ"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Описание</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Опишите содержание заметки..."
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleClose}>
						Отмена
					</Button>
					<Button onClick={handleSubmit} disabled={!title.trim()}>
						<Plus className="w-4 h-4 mr-2" />
						Создать
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
