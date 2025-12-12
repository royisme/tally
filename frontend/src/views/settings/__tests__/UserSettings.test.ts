import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import UserSettings from "@/views/settings/UserSettings.vue";
import type { UserSettings as UserSettingsType } from "@/types";

vi.mock("naive-ui", async () => {
  const actual = await vi.importActual<typeof import("naive-ui")>("naive-ui");
  return {
    ...actual,
    useMessage: () => ({
      success: vi.fn(),
      error: vi.fn(),
    }),
  };
});

const mockApi = vi.hoisted(() => ({
  settings: {
    get: vi.fn<[], Promise<UserSettingsType>>(),
    update: vi.fn<[UserSettingsType], Promise<UserSettingsType>>(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("UserSettings view", () => {
  const base: UserSettingsType = {
    currency: "USD",
    defaultTaxRate: 0,
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
    defaultMessageTemplate: "Thank you for your business.",
  };

  beforeEach(() => {
    mockApi.settings.get.mockResolvedValue(base);
    mockApi.settings.update.mockResolvedValue(base);
  });

  it("loads settings and saves on submit", async () => {
    const wrapper = mount(UserSettings, {
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(mockApi.settings.get).toHaveBeenCalledTimes(1);

    // Stub validate to pass in test environment.
    const vm = wrapper.vm as unknown as {
      formRef: { validate: () => Promise<void> } | null;
    };
    vm.formRef = { validate: async () => undefined };

    const buttons = wrapper.findAll("button");
    const save = buttons.find((b) => b.text() === "Save");
    await save?.trigger("click");
    await flushPromises();

    expect(mockApi.settings.update).toHaveBeenCalledTimes(1);
  });
});
