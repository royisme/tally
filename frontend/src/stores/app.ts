import { defineStore } from "pinia";
import { ref } from "vue";
import {
  Get as GetSettings,
  Update as UpdateSettings,
} from "../wailsjs/go/services/SettingsService";
import { dto } from "../wailsjs/go/models";

export type Theme = "light" | "dark";
export type Locale = "zh-CN" | "en-US";

const DEFAULT_LOCALE: Locale = "en-US";
const DEFAULT_THEME: Theme = "light";

export const useAppStore = defineStore("app", () => {
  const theme = ref<Theme>(DEFAULT_THEME);
  const locale = ref<Locale>(DEFAULT_LOCALE);
  const currentUserId = ref<number | null>(null);

  // Load settings from backend
  async function loadUserSettings(userId: number) {
    currentUserId.value = userId;
    try {
      const settings = await GetSettings(userId);
      theme.value = (settings.theme as Theme) || DEFAULT_THEME;
      locale.value = (settings.language as Locale) || DEFAULT_LOCALE;
    } catch (e) {
      console.error("Failed to load user settings:", e);
      resetToDefaults();
    }
  }

  // Reset to defaults (for logout/guest)
  function resetToDefaults() {
    currentUserId.value = null;
    theme.value = DEFAULT_THEME;
    locale.value = DEFAULT_LOCALE;
  }

  // Toggle theme and sync to backend
  async function toggleTheme() {
    const newTheme = theme.value === "light" ? "dark" : "light";
    theme.value = newTheme;
    await syncToBackend();
  }

  // Set locale and sync to backend
  async function setLocale(newLocale: Locale) {
    locale.value = newLocale;
    await syncToBackend();
  }

  // Sync current state to backend
  async function syncToBackend() {
    if (!currentUserId.value) return;
    // Check if Wails backend is available
    if (typeof window === "undefined" || !(window as any).go) {
      console.warn("Wails backend not available, skipping sync");
      return;
    }
    try {
      await UpdateSettings(currentUserId.value, {
        theme: theme.value,
        language: locale.value,
      } as dto.UserSettings);
    } catch (e) {
      console.error("Failed to sync settings:", e);
    }
  }

  return {
    theme,
    locale,
    toggleTheme,
    setLocale,
    loadUserSettings,
    resetToDefaults,
  };
});
