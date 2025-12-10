import { defineStore } from "pinia";
import { ref } from "vue";

export type Theme = "light" | "dark";
export type Locale = "zh-CN" | "en-US";

export const useAppStore = defineStore("app", () => {
  const theme = ref<Theme>("light");
  const locale = ref<Locale>("zh-CN");

  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale;
  }

  return {
    theme,
    locale,
    toggleTheme,
    setLocale,
  };
});
