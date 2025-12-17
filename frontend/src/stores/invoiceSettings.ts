import { defineStore } from "pinia";
import { api } from "@/api";
import { dto } from "@/wailsjs/go/models";

interface InvoiceSettingsState {
  settings: dto.UserInvoiceSettings | null;
  isLoading: boolean;
  error: string | null;
}

export const useInvoiceSettingsStore = defineStore("invoiceSettings", {
  state: (): InvoiceSettingsState => ({
    settings: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchSettings() {
      this.isLoading = true;
      this.error = null;
      try {
        this.settings = await api.userInvoiceSettings.get();
      } catch (err: any) {
        console.error("Failed to fetch invoice settings:", err);
        this.error = err.message || "Failed to load invoice settings";
      } finally {
        this.isLoading = false;
      }
    },

    async saveSettings(input: dto.UserInvoiceSettings) {
      this.isLoading = true;
      this.error = null;
      try {
        const updated = await api.userInvoiceSettings.update(input);
        this.settings = updated;
        return updated;
      } catch (err: any) {
        console.error("Failed to save invoice settings:", err);
        this.error = err.message || "Failed to save invoice settings";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
