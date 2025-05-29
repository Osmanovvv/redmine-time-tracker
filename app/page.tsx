"use client"

import { useEffect } from "react"
import { useRedmineStore } from "@/lib/store"
import { SettingsPage } from "@/components/settings-page"
import { MainInterface } from "@/components/main-interface"

export default function HomePage() {
	const { isConfigured, loadConfig } = useRedmineStore()

	useEffect(() => {
		loadConfig()
	}, [loadConfig])

	if (!isConfigured) {
		return <SettingsPage />
	}

	return <MainInterface />
}
