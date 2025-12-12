import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTimesheetStore } from "../timesheet";

const mockApi = vi.hoisted(() => ({
  timeEntries: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  projects: {
    list: vi.fn(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

describe("useTimesheetStore CRUD", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.timeEntries.list.mockReset();
    mockApi.timeEntries.create.mockReset();
    mockApi.timeEntries.update.mockReset();
    mockApi.timeEntries.delete.mockReset();
    mockApi.projects.list.mockReset();
  });

  it("fetchTimesheet loads projects if empty and sets entries", async () => {
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
    mockApi.timeEntries.list.mockResolvedValue([
      {
        id: 1,
        projectId: 1,
        date: "2025-01-01",
        startTime: "",
        endTime: "",
        durationSeconds: 3600,
        description: "work",
        billable: true,
        invoiced: false,
      },
    ]);

    const store = useTimesheetStore();
    await store.fetchTimesheet();
    expect(mockApi.projects.list).toHaveBeenCalledTimes(1);
    expect(mockApi.timeEntries.list).toHaveBeenCalledTimes(1);
    expect(store.entries.length).toBe(1);
    expect(store.enrichedEntries[0]?.project?.name).toBe("P");
  });

  it("createTimeEntry calls api and refreshes list", async () => {
    mockApi.timeEntries.create.mockResolvedValue({ id: 2 });
    mockApi.timeEntries.list.mockResolvedValue([]);
    mockApi.projects.list.mockResolvedValue([]);

    const store = useTimesheetStore();
    await store.createTimeEntry({
      projectId: 1,
      date: "2025-01-01",
      durationSeconds: 60,
      description: "x",
      billable: true,
      invoiced: false,
      startTime: "",
      endTime: "",
    });
    expect(mockApi.timeEntries.create).toHaveBeenCalledTimes(1);
    expect(mockApi.timeEntries.list).toHaveBeenCalledTimes(1);
  });

  it("updateTimeEntry calls api and refreshes list", async () => {
    mockApi.timeEntries.update.mockResolvedValue({ id: 1 });
    mockApi.timeEntries.list.mockResolvedValue([]);
    mockApi.projects.list.mockResolvedValue([]);

    const store = useTimesheetStore();
    await store.updateTimeEntry({
      id: 1,
      projectId: 1,
      date: "2025-01-01",
      durationSeconds: 120,
      description: "y",
      billable: false,
      invoiced: false,
      startTime: "",
      endTime: "",
    });
    expect(mockApi.timeEntries.update).toHaveBeenCalledTimes(1);
    expect(mockApi.timeEntries.list).toHaveBeenCalledTimes(1);
  });

  it("deleteTimeEntry calls api and refreshes list", async () => {
    mockApi.timeEntries.delete.mockResolvedValue(undefined);
    mockApi.timeEntries.list.mockResolvedValue([]);
    mockApi.projects.list.mockResolvedValue([]);

    const store = useTimesheetStore();
    await store.deleteTimeEntry(1);
    expect(mockApi.timeEntries.delete).toHaveBeenCalledWith(1);
    expect(mockApi.timeEntries.list).toHaveBeenCalledTimes(1);
  });
});
