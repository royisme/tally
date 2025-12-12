import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/api";
import type { UserSettings } from "@/types";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<UserSettings | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSettings() {
    isLoading.value = true;
    error.value = null;
    try {
      settings.value = await api.settings.get();
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load settings";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function saveSettings(input: UserSettings) {
    isLoading.value = true;
    error.value = null;
    try {
      settings.value = await api.settings.update(input);
      return settings.value;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to save settings";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    saveSettings,
  };
});

