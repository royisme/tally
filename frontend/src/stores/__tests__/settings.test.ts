import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSettingsStore } from "../settings";

const mockApi = vi.hoisted(() => ({
  settings: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("useSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.settings.get.mockReset();
    mockApi.settings.update.mockReset();
  });

  it("fetches settings and sets them in state", async () => {
    const mockSettings = {
      currency: "USD",
      defaultTaxRate: 0.1,
      language: "en-US",
      theme: "light",
      dateFormat: "2006-01-02",
      timezone: "America/New_York",
      senderName: "John Doe",
      senderCompany: "ACME Inc",
      senderAddress: "123 Main St",
      senderPhone: "+1234567890",
      senderEmail: "john@example.com",
      senderPostalCode: "12345",
      invoiceTerms: "Due upon receipt",
      defaultMessageTemplate: "Thank you for your business.",
    };
    mockApi.settings.get.mockResolvedValue(mockSettings);

    const store = useSettingsStore();
    await store.fetchSettings();

    expect(mockApi.settings.get).toHaveBeenCalledTimes(1);
    expect(store.settings?.currency).toBe("USD");
    expect(store.settings?.timezone).toBe("America/New_York");
    expect(store.settings?.defaultTaxRate).toBe(0.1);
  });

  it("updates settings via API", async () => {
    const updatedSettings = {
      currency: "EUR",
      defaultTaxRate: 0.2,
      language: "de-DE",
      theme: "dark",
      dateFormat: "DD/MM/YYYY",
      timezone: "Europe/Berlin",
      senderName: "Max Mustermann",
      senderCompany: "GmbH",
      senderAddress: "Hauptstraße 1",
      senderPhone: "+49123456789",
      senderEmail: "max@example.com",
      senderPostalCode: "54321",
      invoiceTerms: "Net 30",
      defaultMessageTemplate: "Vielen Dank für Ihr Geschäft.",
    };
    mockApi.settings.update.mockResolvedValue(updatedSettings);

    const store = useSettingsStore();
    await store.saveSettings(updatedSettings);

    expect(mockApi.settings.update).toHaveBeenCalledTimes(1);
    expect(mockApi.settings.update).toHaveBeenCalledWith(updatedSettings);
    expect(store.settings?.currency).toBe("EUR");
  });

  it("handles fetch errors gracefully", async () => {
    mockApi.settings.get.mockRejectedValue(new Error("API error"));

    const store = useSettingsStore();
    try {
      await store.fetchSettings();
    } catch {
      // Expected to throw
    }

    expect(mockApi.settings.get).toHaveBeenCalledTimes(1);
    expect(store.error).toBe("API error");
  });

  it("handles update errors gracefully", async () => {
    const testSettings = {
      currency: "USD",
      defaultTaxRate: 0.1,
      language: "en-US",
      theme: "light",
      dateFormat: "2006-01-02",
      timezone: "America/New_York",
      senderName: "",
      senderCompany: "",
      senderAddress: "",
      senderPhone: "",
      senderEmail: "",
      senderPostalCode: "",
      invoiceTerms: "Due upon receipt",
      defaultMessageTemplate: "Thank you for your business.",
    };
    mockApi.settings.update.mockRejectedValue(new Error("Update failed"));

    const store = useSettingsStore();
    try {
      await store.saveSettings(testSettings);
    } catch {
      // Expected to throw
    }

    expect(mockApi.settings.update).toHaveBeenCalledTimes(1);
    expect(store.error).toBe("Update failed");
  });

  it("sets loading state during fetch", async () => {
    mockApi.settings.get.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = useSettingsStore();
    const fetchPromise = store.fetchSettings();

    expect(store.isLoading).toBe(true);

    await fetchPromise;
    expect(store.isLoading).toBe(false);
  });

  it("sets loading state during update", async () => {
    const testSettings = {
      currency: "USD",
      defaultTaxRate: 0.1,
      language: "en-US",
      theme: "light",
      dateFormat: "2006-01-02",
      timezone: "UTC",
      senderName: "",
      senderCompany: "",
      senderAddress: "",
      senderPhone: "",
      senderEmail: "",
      senderPostalCode: "",
      invoiceTerms: "Due upon receipt",
      defaultMessageTemplate: "Thank you.",
    };
    mockApi.settings.update.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = useSettingsStore();
    const updatePromise = store.saveSettings(testSettings);

    expect(store.isLoading).toBe(true);

    await updatePromise;
    expect(store.isLoading).toBe(false);
  });
});
