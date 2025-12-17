import { defineStore } from "pinia";
import { api } from "@/api";
import { dto } from "@/wailsjs/go/models";

interface UserPreferencesState {
  preferences: dto.UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserPreferencesStore = defineStore("userPreferences", {
  state: (): UserPreferencesState => ({
    preferences: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchPreferences() {
      this.isLoading = true;
      this.error = null;
      try {
        this.preferences = await api.userPreferences.get();
      } catch (err: any) {
        console.error("Failed to fetch user preferences:", err);
        this.error = err.message || "Failed to load preferences";
      } finally {
        this.isLoading = false;
      }
    },

    async savePreferences(input: dto.UserPreferences) {
      this.isLoading = true;
      this.error = null;
      try {
        const updated = await api.userPreferences.update(input);
        this.preferences = updated;
        return updated;
      } catch (err: any) {
        console.error("Failed to save user preferences:", err);
        this.error = err.message || "Failed to save preferences";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
