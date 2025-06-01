"use client"

import { useEffect } from "react"
import { useRedmineStore } from "@/lib/store"
import { SettingsPage } from "@/components/settings-page"
import { MainInterface } from "@/components/main-interface"

export default function HomePage() {
	const isConfigured = useRedmineStore(s => s.isConfigured)
	const hasHydrated = useRedmineStore(s => s.hasHydrated)
	const loadConfig = useRedmineStore(s => s.loadConfig)

	useEffect(() => {
		loadConfig()
	}, [loadConfig])

	// 💥 Ключевой момент: ничего не рендерим, пока стор не загружен
	if (!hasHydrated) return null

	if (!isConfigured) return <SettingsPage />
	return <MainInterface />
}
