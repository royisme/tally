import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Invoices from "@/views/Invoices.vue";
import type { Invoice, Client, TimeEntry } from "@/types";
import { mountView } from "@/test-utils/mount";

const mockApi = vi.hoisted(() => ({
  invoices: {
    list: vi.fn<[], Promise<Invoice[]>>(),
    create: vi.fn<[Omit<Invoice, "id">], Promise<Invoice>>(),
    update: vi.fn<[Invoice], Promise<Invoice>>(),
    delete: vi.fn<[number], Promise<void>>(),
    generatePdf: vi.fn<[number, string], Promise<string>>(),
    getDefaultMessage: vi.fn<[number], Promise<string>>(),
    setTimeEntries: vi.fn<[number, number[]], Promise<void>>(),
  },
  clients: {
    list: vi.fn<[], Promise<Client[]>>(),
  },
  projects: {
    list: vi.fn<[], Promise<unknown[]>>(),
  },
  timeEntries: {
    list: vi.fn<[], Promise<TimeEntry[]>>(),
  },
  statusBar: {
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock InvoiceFormModal component
vi.mock("@/components/InvoiceFormModal.vue", () => ({
  default: {
    name: "InvoiceFormModal",
    props: ["show", "invoice", "clients", "projects"],
    emits: ["update:show", "create", "update"],
    template:
      '<div class="n-modal" v-if="show"><button @click="$emit(\'update:show\', false)">Close</button></div>',
  },
}));

// Mock PageContainer component
vi.mock("@/components/PageContainer.vue", () => ({
  default: {
    name: "PageContainer",
    props: ["title", "subtitle"],
    template: '<div class="page-container"><h1>{{title}}</h1><slot /></div>',
  },
}));

describe("Invoices view", () => {
  const mockClients: Client[] = [
    {
      id: 1,
      name: "Client A",
      email: "a@example.com",
      userId: 1,
      createdAt: "",
      updatedAt: "",
    },
  ];

  const mockTimeEntries: TimeEntry[] = [
    {
      id: 1,
      projectId: 1,
      description: "Test Entry",
      durationSeconds: 3600,
      date: "2025-12-11",
      startTime: "09:00",
      endTime: "10:00",
      billable: true,
      invoiced: false,
      userId: 1,
      createdAt: "",
      updatedAt: "",
    },
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 1,
      number: "INV-001",
      clientId: 1,
      issueDate: "2025-12-11",
      dueDate: "2026-01-11",
      subtotal: 100,
      tax: 10,
      total: 110,
      taxRate: 10,
      status: "draft",
      itemsJson: JSON.stringify([]),
      timeEntryIds: [],
      userId: 1,
      createdAt: "",
      updatedAt: "",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.clients.list.mockResolvedValue(mockClients);
    mockApi.projects.list.mockResolvedValue([]);
    mockApi.timeEntries.list.mockResolvedValue(mockTimeEntries);
    mockApi.invoices.list.mockResolvedValue(mockInvoices);
  });

  it("fetches invoices and related data on mount", async () => {
    const wrapper = mountView(Invoices);

    await flushPromises();

    expect(mockApi.invoices.list).toHaveBeenCalled();
    expect(mockApi.clients.list).toHaveBeenCalled();
    expect(mockApi.timeEntries.list).toHaveBeenCalled();
    expect(wrapper.text()).toContain("invoices.title");
  });
});
