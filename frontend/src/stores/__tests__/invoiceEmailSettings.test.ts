import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useInvoiceEmailSettingsStore } from "../invoiceEmailSettings";

const mockApi = vi.hoisted(() => ({
  invoiceEmailSettings: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("useInvoiceEmailSettingsStore CRUD", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.invoiceEmailSettings.get.mockReset();
    mockApi.invoiceEmailSettings.update.mockReset();
  });

  it("fetchSettings loads settings into state", async () => {
    mockApi.invoiceEmailSettings.get.mockResolvedValue({
      provider: "mailto",
      subjectTemplate: "Invoice {{number}}",
      bodyTemplate: "",
      signature: "",
    });
    const store = useInvoiceEmailSettingsStore();
    await store.fetchSettings();
    expect(mockApi.invoiceEmailSettings.get).toHaveBeenCalledTimes(1);
    expect(store.settings?.provider).toBe("mailto");
  });

  it("saveSettings calls update and stores result", async () => {
    const input = {
      provider: "mailto",
      subjectTemplate: "S",
      bodyTemplate: "B",
      signature: "Sig",
    };
    mockApi.invoiceEmailSettings.update.mockResolvedValue(input);
    const store = useInvoiceEmailSettingsStore();
    await store.saveSettings(input);
    expect(mockApi.invoiceEmailSettings.update).toHaveBeenCalledWith(input);
    expect(store.settings?.subjectTemplate).toBe("S");
  });
});

