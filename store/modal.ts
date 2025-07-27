import { create } from "zustand"
import { ModalStore } from "./types/redmine"

export const useModalStore = create<ModalStore>((set) => ({
	timeLogModal: { isOpen: false },

	openTimeLogModal: (duration: number) => {
		set({
			timeLogModal: {
				isOpen: true,
				duration,
			},
		})
	},

	closeTimeLogModal: () => {
		set({
			timeLogModal: { isOpen: false },
		})
	},
}))