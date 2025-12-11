<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NSelect, NDatePicker, NButton, NIcon, NTooltip, useMessage } from 'naive-ui'
import { PlusOutlined, CalendarOutlined, ClockCircleOutlined, DollarOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types'

interface Props {
    projects: Project[]
}

interface Emits {
    (e: 'submit', entry: { projectId: number; description: string; durationSeconds: number; date: string; billable: boolean }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()
const { t } = useI18n()

// Form State
const description = ref('')
const projectId = ref<number | null>(null)
const durationInput = ref('')
const date = ref<string>(new Date().toISOString().split('T')[0]!)
const isBillable = ref(true)

// Computed
const projectOptions = computed(() =>
    props.projects.map(p => ({ label: p.name, value: p.id }))
)

/**
 * Parse duration string to seconds
 * Supports: "1h", "1h 30m", "1.5", "1.5h", "90m", "90", "1:30"
 */
function parseDuration(input: string): number | null {
    if (!input.trim()) return null

    const normalized = input.trim().toLowerCase()

    // Format: "1h 30m" or "1h30m"
    const hhmm = normalized.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?$/)
    if (hhmm) {
        const hours = parseFloat(hhmm[1] ?? '0')
        const mins = hhmm[2] ? parseInt(hhmm[2]) : 0
        return Math.round(hours * 3600 + mins * 60)
    }

    // Format: "30m" or "90m"
    const minsOnly = normalized.match(/^(\d+)\s*m$/)
    if (minsOnly) {
        return parseInt(minsOnly[1] ?? '0') * 60
    }

    // Format: "1:30" (HH:MM)
    const colonFormat = normalized.match(/^(\d+):(\d+)$/)
    if (colonFormat) {
        const hours = parseInt(colonFormat[1] ?? '0')
        const mins = parseInt(colonFormat[2] ?? '0')
        return hours * 3600 + mins * 60
    }

    // Format: plain number (treat as hours) - "1.5" = 1.5h
    const plainNumber = parseFloat(normalized)
    if (!isNaN(plainNumber) && plainNumber > 0) {
        return Math.round(plainNumber * 3600)
    }

    return null
}

const isValid = computed(() =>
    projectId.value &&
    description.value.trim() &&
    parseDuration(durationInput.value) !== null
)

function handleSubmit() {
    if (!projectId.value) {
        message.warning(t('timesheet.quickEntry.selectProject'))
        return
    }

    const durationSeconds = parseDuration(durationInput.value)
    if (!durationSeconds) {
        message.warning(t('timesheet.quickEntry.invalidDuration'))
        return
    }

    if (!description.value.trim()) {
        message.warning(t('timesheet.quickEntry.enterDescription'))
        return
    }

    emit('submit', {
        projectId: projectId.value,
        description: description.value.trim(),
        durationSeconds,
        date: date.value,
        billable: isBillable.value
    })

    // Reset form
    description.value = ''
    durationInput.value = ''
    // Keep projectId and date for convenience

    message.success(t('timesheet.quickEntry.loggedMsg'))
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && isValid.value) {
        handleSubmit()
    }
}

function toggleBillable() {
    isBillable.value = !isBillable.value
}
</script>

<template>
    <div class="compact-entry-bar">
        <!-- Date Picker with Calendar Icon -->
        <div class="entry-cell date-cell">
            <n-icon class="cell-icon" size="16">
                <CalendarOutlined />
            </n-icon>
            <n-date-picker v-model:formatted-value="date" type="date" value-format="yyyy-MM-dd" class="date-picker"
                :is-date-disabled="(ts: number) => ts > Date.now()" size="small" />
        </div>

        <div class="divider" />

        <!-- Project Selector -->
        <div class="entry-cell project-cell">
            <n-select v-model:value="projectId" :options="projectOptions"
                :placeholder="t('timesheet.entries.selectProject')" class="project-select" filterable size="small" />
        </div>

        <div class="divider" />

        <!-- Description Input -->
        <div class="entry-cell description-cell">
            <n-input v-model:value="description" :placeholder="t('timesheet.entries.describeTask')"
                class="description-input" @keydown="handleKeydown" size="small" />
        </div>

        <div class="divider" />

        <!-- Duration Input with Clock Icon -->
        <div class="entry-cell duration-cell">
            <n-icon class="cell-icon" size="16">
                <ClockCircleOutlined />
            </n-icon>
            <n-input v-model:value="durationInput" placeholder="0:00" class="duration-input" @keydown="handleKeydown"
                size="small" />
        </div>

        <div class="divider" />

        <!-- Billable Toggle -->
        <div class="entry-cell billable-cell">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <n-button :type="isBillable ? 'primary' : 'default'" :quaternary="!isBillable" size="small" circle
                        @click="toggleBillable">
                        <template #icon>
                            <n-icon>
                                <DollarOutlined />
                            </n-icon>
                        </template>
                    </n-button>
                </template>
                {{ isBillable ? t('timesheet.entries.billable') : t('timesheet.entries.nonBillable') }}
            </n-tooltip>
        </div>

        <!-- Add Entry Button -->
        <n-button type="success" :disabled="!isValid" @click="handleSubmit" size="small" class="add-entry-btn">
            <template #icon>
                <n-icon>
                    <PlusOutlined />
                </n-icon>
            </template>
            {{ t('timesheet.entries.addEntry') }}
        </n-button>
    </div>
</template>

<style scoped>
.compact-entry-bar {
    display: flex;
    align-items: center;
    background: var(--n-card-color);
    border: 1px solid var(--n-border-color);
    border-radius: 8px;
    padding: 8px 12px;
    gap: 0;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.compact-entry-bar:focus-within {
    border-color: var(--n-primary-color);
    box-shadow: 0 0 0 2px rgba(var(--n-primary-color-rgb), 0.1);
}

.entry-cell {
    display: flex;
    align-items: center;
    padding: 0 12px;
}

.cell-icon {
    color: var(--n-text-color-3);
    margin-right: 6px;
    flex-shrink: 0;
}

.divider {
    width: 1px;
    height: 24px;
    background: var(--n-divider-color);
    flex-shrink: 0;
}

/* Date Cell */
.date-cell {
    min-width: 140px;
}

.date-picker {
    flex: 1;
}

.date-picker :deep(.n-input) {
    --n-border: none !important;
    --n-border-hover: none !important;
    --n-border-focus: none !important;
    background: transparent !important;
}

.date-picker :deep(.n-input__border),
.date-picker :deep(.n-input__state-border) {
    display: none !important;
}

/* Project Cell */
.project-cell {
    min-width: 180px;
}

.project-select {
    flex: 1;
}

.project-select :deep(.n-base-selection) {
    --n-border: none !important;
    --n-border-hover: none !important;
    --n-border-focus: none !important;
    --n-border-active: none !important;
    background: transparent !important;
}

.project-select :deep(.n-base-selection__border),
.project-select :deep(.n-base-selection__state-border) {
    display: none !important;
}

/* Description Cell */
.description-cell {
    flex: 1;
    min-width: 200px;
}

.description-input {
    flex: 1;
}

.description-input :deep(.n-input__border),
.description-input :deep(.n-input__state-border) {
    display: none !important;
}

/* Duration Cell */
.duration-cell {
    min-width: 80px;
}

.duration-input {
    width: 60px;
}

.duration-input :deep(.n-input__border),
.duration-input :deep(.n-input__state-border) {
    display: none !important;
}

/* Billable Cell */
.billable-cell {
    padding: 0 8px;
}

/* Add Entry Button */
.add-entry-btn {
    margin-left: 8px;
    flex-shrink: 0;
}

@media (max-width: 1024px) {
    .compact-entry-bar {
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px;
    }

    .divider {
        display: none;
    }

    .entry-cell {
        padding: 4px 8px;
        border: 1px solid var(--n-divider-color);
        border-radius: 6px;
    }

    .date-cell {
        min-width: 130px;
    }

    .project-cell {
        flex: 1;
        min-width: 150px;
    }

    .description-cell {
        width: 100%;
        order: 10;
    }

    .add-entry-btn {
        margin-left: auto;
    }
}
</style>
