<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { 
  NButton, NCard, NTag, NSpace, NText, NTime, NEmpty, NIcon, NStatistic,
  useMessage 
} from 'naive-ui'
import PageContainer from '@/components/PageContainer.vue'
import TimesheetFormModal from '@/components/TimesheetFormModal.vue'
import { useTimesheetStore } from '@/stores/timesheet'
import { useProjectStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import type { TimeEntry } from '@/types'
import { PlusOutlined, ClockCircleOutlined, CalendarOutlined } from '@vicons/antd'

const message = useMessage()
const timesheetStore = useTimesheetStore()
const projectStore = useProjectStore()
const { groupedByDay, totalHours, loading } = storeToRefs(timesheetStore)
const { projects } = storeToRefs(projectStore)

const showModal = ref(false)
const editingEntry = ref<TimeEntry | null>(null)

function handleLogTime() {
  editingEntry.value = null
  showModal.value = true
}

async function handleSubmitEntry(entry: Omit<TimeEntry, 'id'> | TimeEntry) {
  try {
    if ('id' in entry) {
      await timesheetStore.updateTimeEntry(entry)
      message.success('Time entry updated successfully')
    } else {
      await timesheetStore.createTimeEntry(entry)
      message.success('Time logged successfully')
    }
  } catch (error) {
    message.error('Failed to save time entry')
  }
}

onMounted(() => {
  timesheetStore.fetchTimesheet()
  projectStore.fetchProjects()
})

// Helper to format duration
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

// Helper to format date header
function formatDateHeader(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(date)
}
</script>

<template>
  <PageContainer 
    title="Timesheet" 
    subtitle="Log and track your billable hours"
  >
    <template #extra>
      <n-button type="primary" @click="handleLogTime">
        <template #icon>
          <n-icon><PlusOutlined /></n-icon>
        </template>
        Log Time
      </n-button>
    </template>

    <TimesheetFormModal 
      v-model:show="showModal" 
      :entry="editingEntry" 
      :projects="projects"
      @submit="handleSubmitEntry" 
    />

    <template #headerContent>
       <n-space size="large" style="margin-top: 16px;">
          <n-card size="small" :bordered="false" class="stat-card">
            <n-statistic label="Total Hours (This Week)">
              {{ totalHours }}
              <template #prefix>
                <n-icon><ClockCircleOutlined /></n-icon>
              </template>
            </n-statistic>
          </n-card>
       </n-space>
    </template>

    <div v-if="loading" class="loading-state">
      <!-- Simple loading state -->
      <n-text depth="3">Loading timesheet...</n-text>
    </div>

    <div v-else-if="groupedByDay.length === 0" class="empty-state">
      <n-empty description="No time entries found">
        <template #extra>
          <n-button size="small" @click="timesheetStore.fetchTimesheet">
            Refresh
          </n-button>
        </template>
      </n-empty>
    </div>

    <div v-else class="timesheet-journal">
      <div v-for="day in groupedByDay" :key="day.date" class="day-group">
        <!-- Date Header -->
        <div class="day-header">
          <n-text strong class="day-title">{{ formatDateHeader(day.date) }}</n-text>
          <n-text depth="3" class="day-total">{{ formatDuration(day.totalSeconds) }}</n-text>
        </div>

        <!-- Entries List -->
        <n-card class="day-card" size="small" hoverable>
          <div v-for="(entry, index) in day.entries" :key="entry.id" class="entry-row" :class="{ 'last-row': index === day.entries.length - 1 }">
            
            <!-- 1. Project Info -->
            <div class="entry-project">
              <n-tag :bordered="false" size="small" type="default" style="margin-right: 12px;">
                {{ entry.project?.name || 'No Project' }}
              </n-tag>
              <n-text width="200">{{ entry.description }}</n-text>
            </div>

            <!-- 2. Time & Actions -->
            <div class="entry-meta">
              <n-tag v-if="entry.invoiced" type="success" size="tiny" bordered round style="margin-right: 12px;">
                Invoiced
              </n-tag>
              <n-text strong style="color: var(--n-primary-color)">
                {{ formatDuration(entry.durationSeconds) }}
              </n-text>
              <span class="time-range" v-if="entry.startTime">
                ({{ entry.startTime }} - {{ entry.endTime }})
              </span>
            </div>

          </div>
        </n-card>
      </div>
    </div>

  </PageContainer>
</template>

<style scoped>
.stat-card {
  background: var(--n-card-color);
  min-width: 200px;
}

.timesheet-journal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  padding: 0 4px;
}

.day-title {
  font-size: 1.1rem;
  color: var(--n-text-color-2);
}

.day-card {
  border-radius: 12px;
}

.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid var(--n-divider-color);
}

.entry-row.last-row {
  border-bottom: none;
}

.entry-project {
  display: flex;
  align-items: center;
}

.entry-meta {
  display: flex;
  align-items: center;
}

.time-range {
  margin-left: 8px;
  font-size: 0.85rem;
  color: var(--n-text-color-3);
}
</style>
