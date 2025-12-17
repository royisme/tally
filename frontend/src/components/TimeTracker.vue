<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { PlayCircle, PauseCircle, XCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import type { Project } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Props {
    projects: Project[]
}

interface Emits {
    (e: 'stop', entry: { projectId: number; description: string; durationSeconds: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

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
        toast.warning(t('timesheet.timer.selectProjectFirst'))
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
        description: description.value || t('timesheet.timer.noDescription'),
        durationSeconds: elapsedSeconds.value
    })

    // Reset
    isRunning.value = false
    startedAt.value = null
    elapsedSeconds.value = 0
    description.value = ''
    projectId.value = null
    saveToStorage()

    toast.success(t('timesheet.timer.loggedMsg'))
}

function handleDiscard() {
    stopInterval()
    isRunning.value = false
    startedAt.value = null
    elapsedSeconds.value = 0
    description.value = ''
    projectId.value = null
    saveToStorage()
    toast.info(t('timesheet.timer.discardedMsg'))
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
    <div class="rounded-2xl p-4 mb-6 border transition-all duration-300 shadow-sm" :class="[
        isRunning
            ? 'border-primary shadow-lg shadow-primary/15 bg-linear-to-r from-card to-primary/5'
            : 'border-border bg-linear-to-r from-card to-primary/5'
    ]">
        <div class="flex items-center gap-3">
            <!-- Description Input -->
            <Input v-model="description" :placeholder="t('timesheet.timer.placeholder')" class="flex-1 min-w-[200px]"
                :disabled="isRunning && elapsedSeconds > 0" />

            <!-- Project Selector -->
            <Select :model-value="projectId?.toString()" @update:model-value="(v) => projectId = Number(v)"
                :disabled="isRunning && elapsedSeconds > 0">
                <SelectTrigger class="w-[180px]">
                    <SelectValue :placeholder="t('timesheet.timer.selectProject')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="p in projectOptions" :key="p.value" :value="p.value.toString()">
                        {{ p.label }}
                    </SelectItem>
                </SelectContent>
            </Select>

            <!-- Timer Display -->
            <div class="min-w-[100px] text-center font-mono text-xl px-4 py-2 rounded-lg transition-all duration-300 relative overflow-hidden group"
                :class="[
                    isRunning
                        ? 'bg-primary text-primary-foreground animate-pulse'
                        : 'bg-muted'
                ]">
                <div :class="[
                    'absolute inset-0 opacity-10 transition-opacity duration-1000',
                    isRunning ? 'bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse' : 'opacity-0'
                ]" />
                <div :class="[
                    'absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer',
                    isRunning ? 'hidden' : 'block'
                ]" />
                <span class="font-bold relative z-10">{{ formattedTime }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
                <Button v-if="!isRunning" size="icon" class="size-12 rounded-full" @click="handleStart">
                    <PlayCircle class="size-6" />
                </Button>

                <template v-else>
                    <Button variant="destructive" size="icon" class="size-12 rounded-full" @click="handleStop">
                        <PauseCircle class="size-6" />
                    </Button>

                    <Button variant="ghost" size="icon" class="size-8 rounded-full"
                        :title="t('timesheet.timer.discard')" @click="handleDiscard">
                        <XCircle class="size-5" />
                    </Button>
                </template>
            </div>
        </div>
    </div>
</template>
