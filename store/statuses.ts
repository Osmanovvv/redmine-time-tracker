import { create } from "zustand"
import type { Status, UserRole, StatusesStore } from "./types/redmine"
import { useConfigStore } from "./config"

export const useStatusesStore = create<StatusesStore>((set, get) => ({
	statuses: [],

	loadStatuses: async () => {
		const { redmineUrl, apiKey } = useConfigStore.getState()
		if (!redmineUrl || !apiKey) return

		try {
			const response = await fetch("/api/redmine/statuses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: redmineUrl, apiKey }),
			})

			if (response.ok) {
				const data = await response.json()
				set({ statuses: data.issue_statuses || [] })
			}
		} catch (error) {
			console.error("Ошибка загрузки статусов:", error)
		}
	},

	canChangeStatus: (currentStatusName: string, userRole: UserRole): boolean => {
		if (userRole === "Manager") return true

		if (userRole === "Developer") {
			switch (currentStatusName.toLowerCase()) {
				case "new":
					return false
				case "to review":
					return true
				default:
					return true
			}
		}

		return false
	},

	getFilteredStatuses: (currentStatusName: string, userRole: UserRole): Status[] => {
		const { statuses, canChangeStatus } = get()

		if (!canChangeStatus(currentStatusName, userRole)) {
			return []
		}

		switch (userRole) {
			case "Manager":
				return statuses.filter((status) => status.name.toLowerCase() !== currentStatusName.toLowerCase())

			case "Developer":
				switch (currentStatusName.toLowerCase()) {
					case "new":
						return []
					case "to review":
						return statuses.filter((status) => status.name.toLowerCase() === "on merge")
					default:
						const allowedStatusNames = ["new", "to review", "on merge"]
						return statuses.filter(
							(status) =>
								allowedStatusNames.includes(status.name.toLowerCase()) &&
								status.name.toLowerCase() !== currentStatusName.toLowerCase(),
						)
				}

			case "Other":
			default:
				return []
		}
	},
}))
