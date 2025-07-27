// Экспортируем все сторы из одного места для удобства
import { useTimerStore } from "./timer"
export { useConfigStore } from "./config"
export { useTasksStore } from "./tasks"
export { useActivitiesStore } from "./activities"
export { useModalStore } from "./modal"
export { useTimeLogStore } from "./timeLog"
export { useStatusesStore } from "./statuses"

// Экспортируем типы
export type * from "./types/redmine"

// Хук для получения текущей активной сессии
export const useCurrentSession = () => {
	const sessions = useTimerStore((state) => state.sessions)
	return sessions.find((s) => s.isRunning) || null
}
