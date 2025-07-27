import { create } from "zustand"
import type { ActivitiesStore, Activity } from "./types/redmine"
import { useConfigStore } from "./config"

export const useActivitiesStore = create<ActivitiesStore>((set) => ({
	activities: [],

	loadActivities: async () => {
		const { redmineUrl, apiKey } = useConfigStore.getState()
		if (!redmineUrl || !apiKey) return

		try {
			const response = await fetch("/api/redmine/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: redmineUrl, apiKey }),
			})

			if (response.ok) {
				const data = await response.json()
				set({ activities: data.time_entry_activities || [] })
			}
		} catch (error) {
			console.error("Ошибка загрузки активностей:", error)
		}
	},
}))
