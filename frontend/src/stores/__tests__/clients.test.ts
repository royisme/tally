import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useClientStore } from "../clients";

const mockApi = vi.hoisted(() => ({
  clients: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("useClientStore CRUD", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.clients.list.mockReset();
    mockApi.clients.create.mockReset();
    mockApi.clients.update.mockReset();
    mockApi.clients.delete.mockReset();
  });

  it("fetchClients loads list into state", async () => {
    mockApi.clients.list.mockResolvedValue([
      { id: 1, name: "A", currency: "USD", status: "active" },
    ]);
    const store = useClientStore();
    await store.fetchClients();
    expect(mockApi.clients.list).toHaveBeenCalledTimes(1);
    expect(store.clients.length).toBe(1);
  });

  it("createClient calls api and refreshes list", async () => {
    mockApi.clients.create.mockResolvedValue({ id: 2 });
    mockApi.clients.list.mockResolvedValue([]);
    const store = useClientStore();
    await store.createClient({
      name: "New",
      currency: "USD",
      status: "active",
      email: "",
      website: "",
      contactPerson: "",
      address: "",
      avatar: "",
      notes: "",
    });
    expect(mockApi.clients.create).toHaveBeenCalledTimes(1);
    expect(mockApi.clients.list).toHaveBeenCalledTimes(1);
  });

  it("updateClient calls api and refreshes list", async () => {
    mockApi.clients.update.mockResolvedValue({ id: 1 });
    mockApi.clients.list.mockResolvedValue([]);
    const store = useClientStore();
    await store.updateClient({
      id: 1,
      name: "Upd",
      currency: "USD",
      status: "active",
      email: "",
      website: "",
      contactPerson: "",
      address: "",
      avatar: "",
      notes: "",
    });
    expect(mockApi.clients.update).toHaveBeenCalledTimes(1);
    expect(mockApi.clients.list).toHaveBeenCalledTimes(1);
  });

  it("deleteClient calls api and refreshes list", async () => {
    mockApi.clients.delete.mockResolvedValue(undefined);
    mockApi.clients.list.mockResolvedValue([]);
    const store = useClientStore();
    await store.deleteClient(1);
    expect(mockApi.clients.delete).toHaveBeenCalledWith(1);
    expect(mockApi.clients.list).toHaveBeenCalledTimes(1);
  });
});

