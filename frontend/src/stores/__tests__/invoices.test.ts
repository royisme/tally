import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useInvoiceStore } from "../invoices";

const mockApi = vi.hoisted(() => ({
  invoices: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setTimeEntries: vi.fn(),
    getDefaultMessage: vi.fn(),
    generatePdf: vi.fn(),
    sendEmail: vi.fn(),
  },
  clients: {
    list: vi.fn(),
  },
  statusBar: {
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("useInvoiceStore CRUD", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.invoices.list.mockReset();
    mockApi.invoices.create.mockReset();
    mockApi.invoices.update.mockReset();
    mockApi.invoices.delete.mockReset();
    mockApi.invoices.setTimeEntries.mockReset();
    mockApi.clients.list.mockReset();
  });

  it("fetchInvoices loads clients if empty and sets invoices", async () => {
    mockApi.clients.list.mockResolvedValue([
      { id: 1, name: "C", currency: "USD", status: "active" },
    ]);
    mockApi.invoices.list.mockResolvedValue([
      {
        id: 1,
        clientId: 1,
        number: "INV-1",
        issueDate: "2025-01-01",
        dueDate: "2025-01-10",
        status: "draft",
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
        items: [],
      },
    ]);
    const store = useInvoiceStore();
    await store.fetchInvoices();
    expect(mockApi.clients.list).toHaveBeenCalledTimes(1);
    expect(mockApi.invoices.list).toHaveBeenCalledTimes(1);
    expect(store.invoices.length).toBe(1);
    expect(store.enrichedInvoices[0]?.clientName).toBe("C");
  });

  it("createInvoice calls api and refreshes list", async () => {
    mockApi.invoices.create.mockResolvedValue({ id: 2 });
    mockApi.invoices.list.mockResolvedValue([]);
    mockApi.clients.list.mockResolvedValue([]);
    const store = useInvoiceStore();
    await store.createInvoice({
      clientId: 1,
      number: "INV-2",
      issueDate: "2025-01-01",
      dueDate: "2025-01-10",
      status: "draft",
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      items: [],
    });
    expect(mockApi.invoices.create).toHaveBeenCalledTimes(1);
    expect(mockApi.invoices.list).toHaveBeenCalledTimes(1);
  });

  it("updateInvoice calls api and refreshes list", async () => {
    mockApi.invoices.update.mockResolvedValue({ id: 1 });
    mockApi.invoices.list.mockResolvedValue([]);
    mockApi.clients.list.mockResolvedValue([]);
    const store = useInvoiceStore();
    await store.updateInvoice({
      id: 1,
      clientId: 1,
      number: "INV-1",
      issueDate: "2025-01-01",
      dueDate: "2025-01-10",
      status: "sent",
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      items: [],
    });
    expect(mockApi.invoices.update).toHaveBeenCalledTimes(1);
    expect(mockApi.invoices.list).toHaveBeenCalledTimes(1);
  });

  it("deleteInvoice calls api and refreshes list", async () => {
    mockApi.invoices.delete.mockResolvedValue(undefined);
    mockApi.invoices.list.mockResolvedValue([]);
    mockApi.clients.list.mockResolvedValue([]);
    const store = useInvoiceStore();
    await store.deleteInvoice(1);
    expect(mockApi.invoices.delete).toHaveBeenCalledWith(1);
    expect(mockApi.invoices.list).toHaveBeenCalledTimes(1);
  });

  it("setTimeEntries calls api and refreshes list", async () => {
    mockApi.invoices.setTimeEntries.mockResolvedValue({ id: 1 });
    mockApi.invoices.list.mockResolvedValue([]);
    mockApi.clients.list.mockResolvedValue([]);
    const store = useInvoiceStore();
    await store.setTimeEntries(1, [10, 11]);
    expect(mockApi.invoices.setTimeEntries).toHaveBeenCalledWith({
      invoiceId: 1,
      timeEntryIds: [10, 11],
    });
    expect(mockApi.invoices.list).toHaveBeenCalledTimes(1);
  });
});
