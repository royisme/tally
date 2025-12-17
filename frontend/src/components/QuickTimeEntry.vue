<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Calendar, Clock, DollarSign } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'
import {
    parseDate,
    type DateValue,
} from '@internationalized/date'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface Props {
    projects: Project[]
}

interface Emits {
    (e: 'submit', entry: { projectId: number; description: string; durationSeconds: number; date: string; billable: boolean }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Form State
const description = ref('')
const projectId = ref<number | null>(null)
const durationInput = ref('')
const date = ref<string>(new Date().toLocaleDateString('en-CA'))
const isBillable = ref(true)

// Computed
const projectOptions = computed(() =>
    props.projects.map(p => ({ label: p.name, value: p.id }))
)

// Date helper
const dateValue = computed({
    get: (): DateValue | undefined => {
        if (!date.value) return undefined
        try {
            return parseDate(date.value)
        } catch {
            return undefined
        }
    },
    set: (val: DateValue | undefined) => {
        date.value = val ? val.toString() : new Date().toLocaleDateString('en-CA')
    }
})

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
        toast.warning(t('timesheet.quickEntry.selectProject'))
        return
    }

    const durationSeconds = parseDuration(durationInput.value)
    if (!durationSeconds) {
        toast.warning(t('timesheet.quickEntry.invalidDuration'))
        return
    }

    if (!description.value.trim()) {
        toast.warning(t('timesheet.quickEntry.enterDescription'))
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

    toast.success(t('timesheet.quickEntry.loggedMsg'))
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
    <div
        class="flex items-center gap-0 bg-card border border-border rounded-lg px-3 py-2 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
        <!-- Date Picker with Calendar Icon -->
        <div class="flex items-center px-3 min-w-[140px]">
            <Calendar class="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <Popover>
                <PopoverTrigger as-child>
                    <Button variant="ghost" size="sm"
                        :class="cn('h-8 px-2 font-normal', !dateValue && 'text-muted-foreground')">
                        {{ dateValue ? dateValue.toString() : t('common.pickDate') }}
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                    <CalendarPicker v-model="dateValue" mode="single" />
                </PopoverContent>
            </Popover>
        </div>

        <div class="w-px h-6 bg-border shrink-0" />

        <!-- Project Selector -->
        <div class="flex items-center px-3 min-w-[140px]">
            <Select :model-value="projectId?.toString()" @update:model-value="(v) => projectId = Number(v)">
                <SelectTrigger class="h-8 border-0 shadow-none focus:ring-0 bg-transparent">
                    <SelectValue :placeholder="t('timesheet.entries.selectProject')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="p in projectOptions" :key="p.value" :value="p.value.toString()">
                        {{ p.label }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="w-px h-6 bg-border shrink-0" />

        <!-- Description Input -->
        <div class="flex-1 flex items-center px-3 min-w-[120px]">
            <Input v-model="description" :placeholder="t('timesheet.entries.describeTask')"
                class="h-8 border-0 shadow-none focus-visible:ring-0 bg-transparent" @keydown="handleKeydown" />
        </div>

        <div class="w-px h-6 bg-border shrink-0" />

        <!-- Duration Input with Clock Icon -->
        <div class="flex items-center px-3 min-w-[100px]">
            <Clock class="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <Input v-model="durationInput" placeholder="0:00"
                class="h-8 w-16 border-0 shadow-none focus-visible:ring-0 bg-transparent" @keydown="handleKeydown" />
        </div>

        <div class="w-px h-6 bg-border shrink-0" />

        <!-- Billable Toggle -->
        <div class="flex items-center px-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button :variant="isBillable ? 'default' : 'ghost'" size="icon" class="size-8 rounded-full"
                            @click="toggleBillable">
                            <DollarSign class="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {{ isBillable ? t('timesheet.entries.billable') : t('timesheet.entries.nonBillable') }}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        <!-- Add Entry Button -->
        <Button :disabled="!isValid" @click="handleSubmit" size="sm" class="ml-2 shrink-0">
            <Plus class="size-4 mr-1" />
            {{ t('timesheet.entries.addEntry') }}
        </Button>
    </div>
</template>
