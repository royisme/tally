<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { NInput, NSelect, NButton, NIcon, NSpace, NText, useMessage } from 'naive-ui'
import { PlayCircleOutlined, PauseCircleOutlined, CloseCircleOutlined } from '@vicons/antd'
import type { Project } from '@/types'

interface Props {
    projects: Project[]
}

interface Emits {
    (e: 'stop', entry: { projectId: number; description: string; durationSeconds: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()

// Timer State
const isRunning = ref(false)
const startedAt = ref<number | null>(null)
const description = ref('')
const projectId = ref<number | null>(null)
const elapsedSeconds = ref(0)

let timerInterval: ReturnType<typeof setInterval> | null = null

// Computed
const projectOptions = computed(() =>
    props.projects.map(p => ({ label: p.name, value: p.id }))
)

const formattedTime = computed(() => {
    const h = Math.floor(elapsedSeconds.value / 3600)
    const m = Math.floor((elapsedSeconds.value % 3600) / 60)
    const s = elapsedSeconds.value % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// Persistence
const STORAGE_KEY = 'freelanceflow_timer'

function saveToStorage() {
    if (isRunning.value && startedAt.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            startedAt: startedAt.value,
            description: description.value,
            projectId: projectId.value
        }))
    } else {
        localStorage.removeItem(STORAGE_KEY)
    }
}

function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            const data = JSON.parse(stored)
            startedAt.value = data.startedAt
            description.value = data.description || ''
            projectId.value = data.projectId
            isRunning.value = true
            updateElapsed()
            startInterval()
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        }
    }
}

// Timer Logic
function updateElapsed() {
    if (startedAt.value) {
        elapsedSeconds.value = Math.floor((Date.now() - startedAt.value) / 1000)
    }
}

function startInterval() {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(updateElapsed, 1000)
}

function stopInterval() {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
}

// Actions
function handleStart() {
    if (!projectId.value) {
        message.warning('Please select a project first')
        return
    }

    isRunning.value = true
    startedAt.value = Date.now()
    elapsedSeconds.value = 0
    startInterval()
    saveToStorage()
}

function handleStop() {
    if (!isRunning.value || elapsedSeconds.value === 0) return

    stopInterval()

    emit('stop', {
        projectId: projectId.value!,
        description: description.value || 'No description',
        durationSeconds: elapsedSeconds.value
    })

    // Reset
    isRunning.value = false
    startedAt.value = null
    elapsedSeconds.value = 0
    description.value = ''
    projectId.value = null
    saveToStorage()

    message.success('Time logged successfully!')
}

function handleDiscard() {
    stopInterval()
    isRunning.value = false
    startedAt.value = null
    elapsedSeconds.value = 0
    description.value = ''
    projectId.value = null
    saveToStorage()
    message.info('Timer discarded')
}

// Lifecycle
onMounted(() => {
    loadFromStorage()
})

onUnmounted(() => {
    stopInterval()
})

// Save on state change
watch([description, projectId], () => {
    if (isRunning.value) {
        saveToStorage()
    }
})
</script>

<template>
    <div class="time-tracker" :class="{ 'is-running': isRunning }">
        <div class="tracker-content">
            <!-- Description Input -->
            <n-input v-model:value="description" placeholder="What are you working on?" class="description-input"
                :disabled="isRunning && elapsedSeconds > 0" />

            <!-- Project Selector -->
            <n-select v-model:value="projectId" :options="projectOptions" placeholder="Select project"
                class="project-select" :disabled="isRunning && elapsedSeconds > 0" filterable />

            <!-- Timer Display -->
            <div class="timer-display" :class="{ 'running': isRunning }">
                <n-text strong>{{ formattedTime }}</n-text>
            </div>

            <!-- Actions -->
            <n-space :size="8">
                <n-button v-if="!isRunning" type="primary" circle size="large" @click="handleStart">
                    <template #icon>
                        <n-icon>
                            <PlayCircleOutlined />
                        </n-icon>
                    </template>
                </n-button>

                <template v-else>
                    <n-button type="error" circle size="large" @click="handleStop">
                        <template #icon>
                            <n-icon>
                                <PauseCircleOutlined />
                            </n-icon>
                        </template>
                    </n-button>

                    <n-button quaternary circle size="small" @click="handleDiscard" title="Discard timer">
                        <template #icon>
                            <n-icon>
                                <CloseCircleOutlined />
                            </n-icon>
                        </template>
                    </n-button>
                </template>
            </n-space>
        </div>
    </div>
</template>

<style scoped>
.time-tracker {
    background: linear-gradient(135deg, var(--n-card-color) 0%, rgba(var(--n-primary-color-rgb), 0.05) 100%);
    border: 1px solid var(--n-border-color);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.time-tracker.is-running {
    border-color: var(--n-primary-color);
    box-shadow: 0 4px 16px rgba(var(--n-primary-color-rgb), 0.15);
}

.tracker-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.description-input {
    flex: 1;
    min-width: 200px;
}

.project-select {
    width: 180px;
}

.timer-display {
    min-width: 100px;
    text-align: center;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 1.25rem;
    padding: 8px 16px;
    background: var(--n-action-color);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.timer-display.running {
    background: linear-gradient(135deg, var(--n-primary-color) 0%, var(--n-primary-color-hover) 100%);
    color: white;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.85;
    }
}

@media (max-width: 768px) {
    .tracker-content {
        flex-wrap: wrap;
    }

    .description-input {
        width: 100%;
    }

    .project-select {
        flex: 1;
    }
}
</style>
</template>
