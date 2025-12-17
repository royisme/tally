import { defineStore } from "pinia";
import { computed } from "vue";
import { useUserPreferencesStore } from "./userPreferences";
import { useUserTaxSettingsStore } from "./userTaxSettings";
import { useInvoiceSettingsStore } from "./invoiceSettings";
import { dto } from "@/wailsjs/go/models";

export type Theme = "light" | "dark";
export type Locale = "zh-CN" | "en-US";

const DEFAULT_LOCALE: Locale = "en-US";
const DEFAULT_THEME: Theme = "light";

export const useAppStore = defineStore("app", () => {
  const preferencesStore = useUserPreferencesStore();
  const taxSettingsStore = useUserTaxSettingsStore();
  const invoiceSettingsStore = useInvoiceSettingsStore();

  const theme = computed(
    () => (preferencesStore.preferences?.theme as Theme) || DEFAULT_THEME
  );
  const locale = computed(
    () => (preferencesStore.preferences?.language as Locale) || DEFAULT_LOCALE
  );

  // Load settings from backend
  async function loadUserSettings(_userId: number) {
    // Stores use authStore to get ID, but authStore calls this after setting currentUser.
    // So fetches should work.
    try {
      await Promise.all([
        preferencesStore.fetchPreferences(),
        taxSettingsStore.fetchSettings(),
        invoiceSettingsStore.fetchSettings(),
      ]);
    } catch (e) {
      console.error("Failed to load user settings:", e);
      // Stores handle their own errors/defaults usually, but we can log here.
    }
  }

  // Reset to defaults (for logout/guest)
  function resetToDefaults() {
    preferencesStore.$reset();
    taxSettingsStore.$reset();
    invoiceSettingsStore.$reset();
  }

  // Toggle theme and sync to backend
  async function toggleTheme() {
    const newTheme = theme.value === "light" ? "dark" : "light";
    await setTheme(newTheme);
  }

  // Set theme and sync to backend
  async function setTheme(newTheme: Theme) {
    if (!preferencesStore.preferences) return;
    const updated = new dto.UserPreferences({
      ...preferencesStore.preferences,
      theme: newTheme,
    });
    await preferencesStore.savePreferences(updated);
  }

  // Set locale and sync to backend
  async function setLocale(newLocale: Locale) {
    if (!preferencesStore.preferences) return;
    const updated = new dto.UserPreferences({
      ...preferencesStore.preferences,
      language: newLocale,
    });
    await preferencesStore.savePreferences(updated);
  }

  return {
    theme,
    locale,
    toggleTheme,
    setTheme,
    setLocale,
    loadUserSettings,
    resetToDefaults,
  };
});
