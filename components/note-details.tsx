"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRedmineStore } from "@/lib/store"
import { Play, Pause, Square, Clock, FileText, Edit, Save, X, Trash2, Timer } from "lucide-react"
import { formatTime } from "@/lib/utils"

export function NoteDetails() {
  const {
    selectedNote,
    sessions,
    startNoteTimer,
    pauseNoteTimer,
    finishNoteTimer,
    canStartNote,
    updateNote,
    deleteNote,
    getNoteElapsedSeconds,
  } = useRedmineStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState("")

  if (!selectedNote) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Выберите заметку для просмотра деталей</p>
        </div>
      </div>
    )
  }

  const noteSession = sessions.find((s) => s.noteId === selectedNote.id)
  const isRunning = noteSession?.isRunning || false

  const handleStartEdit = () => {
    setEditTitle(selectedNote.title)
    setEditDescription(selectedNote.description)
    setEditCategory(selectedNote.category || "")
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    updateNote(selectedNote.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory.trim() || undefined,
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle("")
    setEditDescription("")
    setEditCategory("")
  }

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить эту заметку?")) {
      deleteNote(selectedNote.id)
    }
  }

  const handleStart = () => {
    if (!canStartNote(selectedNote.id)) {
      return
    }
    startNoteTimer(selectedNote.id)
  }

  const handlePause = () => {
    pauseNoteTimer(selectedNote.id)
  }

  const handleFinish = () => {
    finishNoteTimer(selectedNote.id)
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-2xl">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Название заметки"
                    className="text-xl font-bold"
                  />
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Категория"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    {selectedNote.category && <Badge variant="outline">{selectedNote.category}</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold">{selectedNote.title}</h1>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={handleStartEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Создано: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span>Потрачено: {formatTime(getNoteElapsedSeconds(selectedNote.id) * 1000)}</span>
            </div>
          </div>

          {(selectedNote.description || isEditing) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Описание</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Описание заметки..."
                    rows={4}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{selectedNote.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Трекинг времени
            </CardTitle>
          </CardHeader>
          <CardContent>
            {noteSession && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Текущая сессия</span>
                  <span className="text-lg font-mono text-green-800">
                    {formatTime(
                      noteSession.totalElapsed +
                        (noteSession.isRunning && noteSession.currentIntervalStart
                          ? Date.now() - noteSession.currentIntervalStart
                          : 0),
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!noteSession ? (
                <Button onClick={handleStart} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Начать работу
                </Button>
              ) : (
                <>
                  {isRunning ? (
                    <Button variant="outline" onClick={handlePause} className="flex items-center gap-2 bg-transparent">
                      <Pause className="w-4 h-4" />
                      Пауза
                    </Button>
                  ) : (
                    <Button onClick={() => startNoteTimer(selectedNote.id)} className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Продолжить
                    </Button>
                  )}
                  <Button variant="destructive" onClick={handleFinish} className="flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Завершить
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
