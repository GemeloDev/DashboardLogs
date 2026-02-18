import { defineStore } from "pinia";

export const useConsoleFiltersStore = defineStore('consoleFilters', {
  state: () => ({
    consoleOpen: false,
    pendingSelection: null, // { fieldKey, value, ts }
  }),
  actions: {
    openConsole() {
      this.consoleOpen = true
    },
    closeConsole() {
      this.consoleOpen = false
      this.pendingSelection = null
    },
    selectFromChart(fieldKey, value) {
      this.consoleOpen = true
      this.pendingSelection = { fieldKey, value, ts: Date.now() }
    },
    clearPending() {
      this.pendingSelection = null
    }
  }
})
