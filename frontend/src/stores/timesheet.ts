import { defineStore, storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { api } from "@/api";
import type {
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  Project,
} from "@/types";
import { useProjectStore } from "./projects";

// Grouped Data Interface for View
export interface DailyTimeGroup {
  date: string;
  totalSeconds: number;
  entries: (TimeEntry & { project?: Project })[];
}

export const useTimesheetStore = defineStore("timesheet", () => {
  const entries = ref<TimeEntry[]>([]);
  const loading = ref(false);
  const projectStore = useProjectStore();
  const { projects } = storeToRefs(projectStore);

  // Actions
  async function fetchTimesheet(projectId?: number) {
    loading.value = true;
    try {
      // Ensure we have project data for joining
      if (projects.value.length === 0) {
        await projectStore.fetchProjects();
      }
      entries.value = await api.timeEntries.list(projectId);
    } catch (error) {
      console.error("Failed to fetch timesheet", error);
    } finally {
      loading.value = false;
    }
  }

  async function createTimeEntry(input: CreateTimeEntryInput) {
    loading.value = true;
    try {
      await api.timeEntries.create(input);
      await fetchTimesheet();
    } finally {
      loading.value = false;
    }
  }

  async function updateTimeEntry(input: UpdateTimeEntryInput) {
    loading.value = true;
    try {
      await api.timeEntries.update(input);
      await fetchTimesheet();
    } finally {
      loading.value = false;
    }
  }

  async function deleteTimeEntry(id: number) {
    loading.value = true;
    try {
      await api.timeEntries.delete(id);
      await fetchTimesheet();
    } finally {
      loading.value = false;
    }
  }

  // Getters (Computed)

  // Enriched Entry type for views that need project info
  type EnrichedTimeEntry = TimeEntry & { project?: Project };

  // Enriched Entries (Join with Project)
  const enrichedEntries = computed<EnrichedTimeEntry[]>(() => {
    return entries.value.map((entry): EnrichedTimeEntry => {
      const proj = projects.value.find((p) => p.id === entry.projectId);
      return { ...entry, project: proj };
    });
  });

  // Group by Date for Linear/Journal View
  const groupedByDay = computed<DailyTimeGroup[]>(() => {
    const groups: Record<string, DailyTimeGroup> = {};

    enrichedEntries.value.forEach((entry) => {
      if (!groups[entry.date]) {
        groups[entry.date] = { date: entry.date, totalSeconds: 0, entries: [] };
      }
      // Non-null assertion safe: we just created the group above if it didn't exist
      const group = groups[entry.date]!;
      group.entries.push(entry);
      group.totalSeconds += entry.durationSeconds;
    });

    // Sort descending by date
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  });

  const totalHours = computed(() => {
    const totalSecs = entries.value.reduce(
      (acc, curr) => acc + curr.durationSeconds,
      0
    );
    return (totalSecs / 3600).toFixed(1);
  });

  return {
    entries,
    groupedByDay,
    totalHours,
    loading,
    fetchTimesheet,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
});
