import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatTime(milliseconds: number): string {
	const totalSeconds = Math.floor(milliseconds / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
	}
	return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export interface TimeSession {
	totalElapsed: number
	isRunning: boolean
	currentIntervalStart: number | null
}

export function getCurrentElapsed(session: TimeSession | null): number {
	if (!session) return 0

	let elapsed = session.totalElapsed // должно быть в **секундах**

	if (session.isRunning && session.currentIntervalStart) {
		elapsed += Math.floor((Date.now() - session.currentIntervalStart) / 1000)
	}

	return elapsed
}
