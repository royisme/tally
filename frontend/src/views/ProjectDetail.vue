<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    NButton, NCard, NSpace, NTag, NText, NDescriptions, NDescriptionsItem,
    NIcon, NDataTable, NSpin, NBreadcrumb, NBreadcrumbItem, type DataTableColumns, useMessage
} from 'naive-ui'
import PageContainer from '@/components/PageContainer.vue'
import ProjectFormModal from '@/components/ProjectFormModal.vue'
import { useProjectStore } from '@/stores/projects'
import { useClientStore } from '@/stores/clients'
import { useTimesheetStore } from '@/stores/timesheet'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { Project, Client, TimeEntry } from '@/types'
import { ArrowLeftOutlined, EditOutlined } from '@vicons/antd'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { t } = useI18n()

const projectStore = useProjectStore()
const clientStore = useClientStore()
const timesheetStore = useTimesheetStore()
const { projects, loading: projectLoading } = storeToRefs(projectStore)
const { clients } = storeToRefs(clientStore)
const { entries: timeEntries, loading: entriesLoading } = storeToRefs(timesheetStore)

// Modal state
const showModal = ref(false)

// Computed: Current project
const projectId = computed(() => Number(route.params.id))
const project = computed<Project | undefined>(() =>
    projects.value.find(p => p.id === projectId.value)
)
const client = computed<Client | undefined>(() =>
    project.value ? clients.value.find(c => c.id === project.value!.clientId) : undefined
)

// Computed: Time entries for this project
const projectTimeEntries = computed<TimeEntry[]>(() =>
    timeEntries.value.filter(e => e.projectId === projectId.value)
)
const totalHours = computed(() =>
    projectTimeEntries.value.reduce((sum, e) => sum + (e.durationSeconds / 3600), 0).toFixed(1)
)

const loading = computed(() => projectLoading.value || entriesLoading.value)

// Data fetch
onMounted(() => {
    projectStore.fetchProjects()
    clientStore.fetchClients()
    timesheetStore.fetchTimesheet()
})

function handleBack() {
    router.push('/projects')
}

function handleEdit() {
    showModal.value = true
}

async function handleSubmitProject(projectData: Omit<Project, 'id'> | Project) {
    try {
        if ('id' in projectData) {
            await projectStore.updateProject(projectData)
            message.success(t('projects.updateSuccess'))
        }
    } catch (error) {
        message.error(t('projects.saveError'))
    }
}

// Time entries table columns
const entryColumns: DataTableColumns<TimeEntry> = [
    {
        title: t('timesheet.columns.date'),
        key: 'date',
        width: 120
    },
    {
        title: t('timesheet.columns.task'),
        key: 'description',
    },
    {
        title: t('timesheet.columns.hours'),
        key: 'durationSeconds',
        width: 100,
        render(row) {
            return `${(row.durationSeconds / 3600).toFixed(1)}h`
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
            }, { default: () => row.billable ? t('timesheet.entries.billable') : t('timesheet.entries.nonBillable') })
        }
    }
]
</script>

<template>
    <PageContainer fill>
        <n-spin :show="loading" class="detail-root">
            <template v-if="project">
                <!-- Secondary Page Header: Back + Breadcrumb -->
                <n-space align="center" :size="8" style="margin-bottom: 12px;">
                    <n-button quaternary size="small" @click="handleBack">
                        <template #icon>
                            <n-icon>
                                <ArrowLeftOutlined />
                            </n-icon>
                        </template>
                    </n-button>
                    <n-breadcrumb>
                        <n-breadcrumb-item @click="handleBack" style="cursor: pointer;">
                            {{ t('nav.projects') }}
                        </n-breadcrumb-item>
                        <n-breadcrumb-item>{{ project.name }}</n-breadcrumb-item>
                    </n-breadcrumb>
                </n-space>

                <ProjectFormModal v-model:show="showModal" :project="project" :clients="clients"
                    @submit="handleSubmitProject" />

                <div class="detail-content">
                    <!-- Project Info Card: Compact 3-column with Edit in header -->
                    <n-card size="small" :content-style="{ padding: '12px 16px' }">
                        <template #header>
                            <n-space align="center" justify="space-between" style="width: 100%;">
                                <span>{{ t('projects.detail.info') }}</span>
                                <n-button size="small" type="primary" @click="handleEdit">
                                    <template #icon>
                                        <n-icon>
                                            <EditOutlined />
                                        </n-icon>
                                    </template>
                                    {{ t('common.edit') }}
                                </n-button>
                            </n-space>
                        </template>
                        <n-descriptions :column="3" label-placement="top" size="small">
                            <n-descriptions-item :label="t('form.project.client')">
                                {{ client?.name || '-' }}
                            </n-descriptions-item>
                            <n-descriptions-item :label="t('form.project.status')">
                                <n-tag
                                    :type="project.status === 'active' ? 'success' : (project.status === 'archived' ? 'warning' : 'default')"
                                    size="small" bordered round>
                                    {{ t(`projects.status.${project.status}`) }}
                                </n-tag>
                            </n-descriptions-item>
                            <n-descriptions-item :label="t('form.project.hourlyRate')">
                                {{ project.currency }} ${{ project.hourlyRate }}/hr
                            </n-descriptions-item>
                            <n-descriptions-item :label="t('form.project.deadline')">
                                {{ project.deadline || t('projects.columns.noDeadline') }}
                            </n-descriptions-item>
                            <n-descriptions-item :label="t('projects.detail.totalHours')">
                                {{ totalHours }}h
                            </n-descriptions-item>
                            <n-descriptions-item :label="t('form.project.description')">
                                {{ project.description || '-' }}
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-card>

                    <!-- Time Entries: Using flex-height with calc() for native DataTable scrolling -->
                    <n-card size="small" :content-style="{ padding: '12px' }">
                        <template #header>{{ t('projects.detail.timeEntries') }}</template>
                        <n-data-table :columns="entryColumns" :data="projectTimeEntries" :bordered="false"
                            :loading="entriesLoading" size="small" flex-height
                            :style="{ height: 'calc(100vh - 340px)', minHeight: '150px' }" />
                    </n-card>
                </div>
            </template>

            <template v-else-if="!loading">
                <n-space vertical align="center" style="padding: 48px;">
                    <n-text depth="3">{{ t('projects.detail.notFound') }}</n-text>
                    <n-button @click="handleBack">{{ t('nav.projects') }}</n-button>
                </n-space>
            </template>
        </n-spin>
    </PageContainer>
</template>

<style scoped>
.detail-root {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 0;
}
</style>
