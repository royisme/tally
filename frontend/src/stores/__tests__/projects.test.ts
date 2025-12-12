import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useProjectStore } from "../projects";

const mockApi = vi.hoisted(() => ({
  projects: {
    list: vi.fn(),
    listByClient: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("useProjectStore CRUD", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.projects.list.mockReset();
    mockApi.projects.listByClient.mockReset();
    mockApi.projects.create.mockReset();
    mockApi.projects.update.mockReset();
    mockApi.projects.delete.mockReset();
  });

  it("fetchProjects loads list into state", async () => {
    mockApi.projects.list.mockResolvedValue([
      {
        id: 1,
        clientId: 1,
        name: "P",
        hourlyRate: 10,
        currency: "USD",
        status: "active",
        tags: [],
        deadline: "",
        description: "",
      },
    ]);
    const store = useProjectStore();
    await store.fetchProjects();
    expect(mockApi.projects.list).toHaveBeenCalledTimes(1);
    expect(store.projects.length).toBe(1);
  });

  it("fetchProjectsByClient uses listByClient", async () => {
    mockApi.projects.listByClient.mockResolvedValue([]);
    const store = useProjectStore();
    await store.fetchProjectsByClient(1);
    expect(mockApi.projects.listByClient).toHaveBeenCalledWith(1);
  });

  it("createProject calls api and refreshes list", async () => {
    mockApi.projects.create.mockResolvedValue({ id: 2 });
    mockApi.projects.list.mockResolvedValue([]);
    const store = useProjectStore();
    await store.createProject({
      clientId: 1,
      name: "New",
      hourlyRate: 10,
      currency: "USD",
      status: "active",
      description: "",
      deadline: "",
      tags: [],
    });
    expect(mockApi.projects.create).toHaveBeenCalledTimes(1);
    expect(mockApi.projects.list).toHaveBeenCalledTimes(1);
  });

  it("updateProject calls api and refreshes list", async () => {
    mockApi.projects.update.mockResolvedValue({ id: 1 });
    mockApi.projects.list.mockResolvedValue([]);
    const store = useProjectStore();
    await store.updateProject({
      id: 1,
      clientId: 1,
      name: "Upd",
      hourlyRate: 20,
      currency: "USD",
      status: "active",
      description: "",
      deadline: "",
      tags: [],
    });
    expect(mockApi.projects.update).toHaveBeenCalledTimes(1);
    expect(mockApi.projects.list).toHaveBeenCalledTimes(1);
  });

  it("deleteProject calls api and refreshes list", async () => {
    mockApi.projects.delete.mockResolvedValue(undefined);
    mockApi.projects.list.mockResolvedValue([]);
    const store = useProjectStore();
    await store.deleteProject(1);
    expect(mockApi.projects.delete).toHaveBeenCalledWith(1);
    expect(mockApi.projects.list).toHaveBeenCalledTimes(1);
  });
});

