import { defineStore } from "pinia";
import { api } from "@/api";
import { dto } from "@/wailsjs/go/models";

interface UserTaxSettingsState {
  settings: dto.UserTaxSettings | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserTaxSettingsStore = defineStore("userTaxSettings", {
  state: (): UserTaxSettingsState => ({
    settings: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchSettings() {
      this.isLoading = true;
      this.error = null;
      try {
        this.settings = await api.userTaxSettings.get();
      } catch (err: any) {
        console.error("Failed to fetch tax settings:", err);
        this.error = err.message || "Failed to load tax settings";
      } finally {
        this.isLoading = false;
      }
    },

    async saveSettings(input: dto.UserTaxSettings) {
      this.isLoading = true;
      this.error = null;
      try {
        const updated = await api.userTaxSettings.update(input);
        this.settings = updated;
        return updated;
      } catch (err: any) {
        console.error("Failed to save tax settings:", err);
        this.error = err.message || "Failed to save tax settings";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
