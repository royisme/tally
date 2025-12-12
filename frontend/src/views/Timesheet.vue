<script setup lang="ts">
import { onMounted, ref, computed, h } from 'vue'
import {
  NButton, NCard, NTag, NSpace, NText, NEmpty, NIcon,
  NPopconfirm, NTooltip, NDataTable,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import PageContainer from '@/components/PageContainer.vue'
import TimeTracker from '@/components/TimeTracker.vue'
import QuickTimeEntry from '@/components/QuickTimeEntry.vue'
import TimesheetFormModal from '@/components/TimesheetFormModal.vue'
import { useTimesheetStore } from '@/stores/timesheet'
import { useProjectStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { TimeEntry } from '@/types'
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  LeftOutlined,
  RightOutlined,
  DownloadOutlined
} from '@vicons/antd'

const message = useMessage()
const timesheetStore = useTimesheetStore()
const projectStore = useProjectStore()
const { entries, loading } = storeToRefs(timesheetStore)
const { projects } = storeToRefs(projectStore)
const { t, locale } = useI18n()

const showModal = ref(false)
const editingEntry = ref<TimeEntry | null>(null)

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const checkedRowKeys = ref<number[]>([])

// Computed: paginated entries
const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return entries.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(entries.value.length / pageSize.value) || 1)
const showingFrom = computed(() => entries.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1)
const showingTo = computed(() => Math.min(currentPage.value * pageSize.value, entries.value.length))

// Table columns
const columns = computed<DataTableColumns<TimeEntry & { project?: { name: string } }>>(() => [
  {
    type: 'selection',
    width: 40
  },
  {
    title: t('timesheet.columns.date'),
    key: 'date',
    width: 120,
    render(row) {
      return formatDate(row.date)
    }
  },
  {
    title: t('timesheet.columns.project'),
    key: 'project',
    width: 180,
    render(row) {
      const projectName = row.project?.name || t('timesheet.entry.noProject')
      const projectColor = getProjectColor(row.projectId)
      return h('div', { class: 'project-cell' }, [
        h('span', { class: 'project-dot', style: { backgroundColor: projectColor } }),
        h('span', {}, projectName)
      ])
    }
  },
  {
    title: t('timesheet.columns.task'),
    key: 'description',
    ellipsis: { tooltip: true },
    render(row) {
      return row.description || '-'
    }
  },
  {
    title: t('timesheet.columns.status'),
    key: 'billable',
    width: 100,
    render(row) {
      return h(NTag, {
        type: row.billable ? 'success' : 'default',
        size: 'small',
        bordered: false,
        round: true
      }, () => row.billable ? t('timesheet.entries.billable') : t('timesheet.entries.nonBillable'))
    }
  },
  {
    title: t('timesheet.columns.hours'),
    key: 'durationSeconds',
    width: 80,
    align: 'right',
    render(row) {
      return formatHours(row.durationSeconds)
    }
  },
  {
    title: t('timesheet.columns.billable'),
    key: 'billableAmount',
    width: 100,
    align: 'right',
    render(row) {
      if (!row.billable) return h('span', { class: 'text-muted' }, '-')
      const rate = getProjectRate(row.projectId)
      const hours = row.durationSeconds / 3600
      const amount = (rate * hours).toFixed(2)
      return h('span', { class: 'billable-amount' }, `$${amount}`)
    }
  },
  {
    title: '',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h('div', { class: 'action-buttons' }, [
        h(NTooltip, { trigger: 'hover' }, {
          trigger: () => h(NButton, {
            quaternary: true,
            circle: true,
            size: 'tiny',
            onClick: () => handleContinueTimer(row)
          }, {
            icon: () => h(NIcon, { size: 14 }, () => h(PlayCircleOutlined))
          }),
          default: () => t('timesheet.entry.continueTimer')
        }),
        h(NTooltip, { trigger: 'hover' }, {
          trigger: () => h(NButton, {
            quaternary: true,
            circle: true,
            size: 'tiny',
            onClick: () => handleEdit(row)
          }, {
            icon: () => h(NIcon, { size: 14 }, () => h(EditOutlined))
          }),
          default: () => t('timesheet.entry.editEntry')
        }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row.id)
        }, {
          trigger: () => h(NButton, {
            quaternary: true,
            circle: true,
            size: 'tiny',
            type: 'error'
          }, {
            icon: () => h(NIcon, { size: 14 }, () => h(DeleteOutlined))
          }),
          default: () => t('timesheet.entry.deleteConfirm')
        })
      ])
    }
  }
])

// Helpers
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function formatHours(seconds: number): string {
  const hours = seconds / 3600
  return hours.toFixed(hours % 1 === 0 ? 0 : 1)
}

function getProjectColor(projectId: number): string {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return colors[0]!
  return colors[projectId % colors.length]!
}

function getProjectRate(projectId: number): number {
  const project = projects.value.find(p => p.id === projectId)
  return project?.hourlyRate || 0
}

// Pagination handlers
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Entry actions
function handleEdit(entry: TimeEntry) {
  editingEntry.value = entry
  showModal.value = true
}

async function handleDelete(id: number) {
  try {
    await timesheetStore.deleteTimeEntry(id)
    message.success(t('timesheet.entry.deletedMsg'))
  } catch {
    message.error('Failed to delete entry')
  }
}

async function handleContinueTimer(entry: TimeEntry & { project?: { name: string } }) {
  try {
    await timesheetStore.continueTimer(entry)
    message.success(`Started tracking: ${entry.project?.name || 'Unknown project'}`)
  } catch {
    message.error('Failed to start timer')
  }
}

// Form handlers
async function handleSubmitEntry(entry: Omit<TimeEntry, 'id'> | TimeEntry) {
  try {
    if ('id' in entry) {
      await timesheetStore.updateTimeEntry(entry)
      message.success(t('timesheet.entry.updatedMsg'))
    } else {
      await timesheetStore.createTimeEntry(entry)
      message.success('Time logged')
    }
  } catch {
    message.error('Failed to save time entry')
  }
}

async function handleTimerStop(data: { projectId: number; description: string; durationSeconds: number }) {
  try {
    await timesheetStore.createTimeEntry({
      projectId: data.projectId,
      description: data.description,
      durationSeconds: data.durationSeconds,
      date: new Date().toISOString().split('T')[0]!,
      startTime: '',
      endTime: '',
      billable: true,
      invoiced: false
    })
  } catch {
    message.error('Failed to save timer entry')
  }
}

async function handleQuickEntry(data: { projectId: number; description: string; durationSeconds: number; date: string; billable: boolean }) {
  try {
    await timesheetStore.createTimeEntry({
      projectId: data.projectId,
      description: data.description,
      durationSeconds: data.durationSeconds,
      date: data.date,
      startTime: '',
      endTime: '',
      billable: data.billable,
      invoiced: false
    })
  } catch {
    message.error('Failed to save entry')
  }
}

function handleExportCSV() {
  try {
    timesheetStore.exportToCSV(timesheetStore.enrichedEntries)
    message.success('CSV exported successfully')
  } catch {
    message.error('Failed to export CSV')
  }
}

function handleCheckedRowKeysChange(keys: Array<string | number>) {
  checkedRowKeys.value = keys as number[]
}

onMounted(() => {
  timesheetStore.fetchTimesheet()
  projectStore.fetchProjects()
})
</script>

<template>
  <PageContainer :title="t('timesheet.title')" :subtitle="t('timesheet.subtitle')">
    <!-- Timer Bar -->
    <TimeTracker :projects="projects" @stop="handleTimerStop" />

    <!-- Time Entries Section -->
    <n-card class="entries-section" :bordered="true" size="small">
      <!-- Section Header -->
      <template #header>
        <div class="section-header">
          <n-text strong class="section-title">{{ t('timesheet.entries.title') }}</n-text>
          <n-button quaternary size="small" @click="handleExportCSV">
            <template #icon>
              <n-icon>
                <DownloadOutlined />
              </n-icon>
            </template>
            {{ t('timesheet.entries.exportCSV') }}
          </n-button>
        </div>
      </template>

      <!-- Compact Entry Bar -->
      <QuickTimeEntry :projects="projects" @submit="handleQuickEntry" />

      <!-- Edit Modal -->
      <TimesheetFormModal v-model:show="showModal" :entry="editingEntry" :projects="projects"
        @submit="handleSubmitEntry" />

      <!-- Data Table -->
      <div v-if="loading" class="loading-state">
        <n-text depth="3">{{ t('common.loading') }}</n-text>
      </div>

      <div v-else-if="entries.length === 0" class="empty-state">
        <n-empty :description="t('timesheet.noEntries')">
          <template #icon>
            <n-icon size="48" color="var(--n-text-color-3)">
              <ClockCircleOutlined />
            </n-icon>
          </template>
          <template #extra>
            <n-space vertical align="center">
              <n-text depth="3">
                {{ t('timesheet.noEntriesHint') }}
              </n-text>
            </n-space>
          </template>
        </n-empty>
      </div>

      <template v-else>
        <n-data-table :columns="columns" :data="paginatedEntries" :row-key="(row: TimeEntry) => row.id"
          :checked-row-keys="checkedRowKeys" @update:checked-row-keys="handleCheckedRowKeysChange" size="small"
          class="entries-table" />

        <!-- Pagination -->
        <div class="pagination-bar">
          <n-text depth="3" class="pagination-info">
            {{ t('timesheet.entries.showingResults', { from: showingFrom, to: showingTo, total: entries.length }) }}
          </n-text>
          <div class="pagination-controls">
            <n-button quaternary size="small" :disabled="currentPage === 1" @click="prevPage">
              <template #icon>
                <n-icon>
                  <LeftOutlined />
                </n-icon>
              </template>
            </n-button>
            <n-text class="page-indicator">
              {{ t('timesheet.entries.pageInfo', { current: currentPage, total: totalPages }) }}
            </n-text>
            <n-button quaternary size="small" :disabled="currentPage === totalPages" @click="nextPage">
              <template #icon>
                <n-icon>
                  <RightOutlined />
                </n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </template>
    </n-card>

  </PageContainer>
</template>

<style scoped>
/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.section-title {
  font-size: 1rem;
}

/* Entries Section */
.entries-section {
  margin-top: 16px;
}

.entries-section :deep(.n-card__content) {
  padding: 16px;
}

/* Table Styling */
.entries-table {
  margin-top: 16px;
}

.entries-table :deep(.n-data-table-th) {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--n-text-color-3);
}

.entries-table :deep(.n-data-table-td) {
  font-size: 0.875rem;
}

/* Project Cell */
.project-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Billable Amount */
.billable-amount {
  color: var(--n-primary-color);
  font-weight: 500;
}

.text-muted {
  color: var(--n-text-color-3);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.entries-table :deep(.n-data-table-tr:hover) .action-buttons {
  opacity: 1;
}

/* Pagination Bar */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--n-divider-color);
}

.pagination-info {
  font-size: 0.8rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-indicator {
  font-size: 0.85rem;
  min-width: 100px;
  text-align: center;
}

/* Empty & Loading States */
.empty-state,
.loading-state {
  padding: 48px 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .pagination-bar {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    opacity: 1;
  }
}
</style>
