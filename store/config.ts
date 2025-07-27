import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ConfigStore } from "./types/redmine"

export const useConfigStore = create<ConfigStore>()(
	persist(
		(set, get) => ({
			redmineUrl: "",
			apiKey: "",
			isConfigured: false,
			currentUserId: null,
			hasHydrated: false,

			saveConfig: (url: string, apiKey: string) => {
				const cleanedUrl = url.replace(/\/$/, "")
				localStorage.setItem("redmineUrl", cleanedUrl)
				localStorage.setItem("redmineApiKey", apiKey)

				set({
					redmineUrl: cleanedUrl,
					apiKey,
					isConfigured: true,
				})
			},

			clearConfig: () => {
				localStorage.removeItem("redmineUrl")
				localStorage.removeItem("redmineApiKey")

				set({
					redmineUrl: "",
					apiKey: "",
					isConfigured: false,
					currentUserId: null,
				})
			},

			loadConfig: () => {
				const url = localStorage.getItem("redmineUrl")
				const apiKey = localStorage.getItem("redmineApiKey")

				if (url && apiKey) {
					set({
						redmineUrl: url,
						apiKey,
						isConfigured: true,
					})
				}
			},

			testConnection: async (url: string, apiKey: string) => {
				try {
					const response = await fetch("/api/redmine/test", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ url: url.replace(/\/$/, ""), apiKey }),
					})
					return response.ok
				} catch {
					return false
				}
			},

			setCurrentUserId: (userId: number | null) => {
				set({ currentUserId: userId })
			},

			setHasHydrated: (hydrated: boolean) => {
				set({ hasHydrated: hydrated })
			},
		}),
		{
			name: "redmine-config",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				redmineUrl: state.redmineUrl,
				apiKey: state.apiKey,
				isConfigured: state.isConfigured,
				currentUserId: state.currentUserId,
			}),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error("Ошибка при гидратации config стора:", error)
				} else if (state) {
					setTimeout(() => {
						state.setHasHydrated(true)
					}, 0)
				}
			},
		},
	),
)
