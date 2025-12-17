<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import {
    DateFormatter,
    getLocalTimeZone,
    type DateValue,
} from '@internationalized/date'
import { useI18n } from 'vue-i18n'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

type DateRange = {
    start: DateValue | undefined
    end: DateValue | undefined
}

const props = defineProps<{
    modelValue?: DateRange
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', payload: DateRange): void
}>()

const { t, locale } = useI18n()

const df = computed(() => new DateFormatter(locale.value, { dateStyle: 'medium' }))

const value = ref<DateRange | undefined>(props.modelValue)

watch(() => props.modelValue, (v) => {
    value.value = v
})

watch(value, (v) => {
    if (v) emit('update:modelValue', v)
})
</script>

<template>
    <div :class="cn('grid gap-2', $attrs.class as string)">
        <Popover>
            <PopoverTrigger as-child>
                <Button variant="outline" :class="cn(
                    'w-[260px] justify-start text-left font-normal',
                    !value && 'text-muted-foreground',
                )">
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    <template v-if="value?.start">
                        <template v-if="value.end">
                            {{ df.value.format(value.start.toDate(getLocalTimeZone())) }} - {{
                                df.value.format(value.end.toDate(getLocalTimeZone())) }}
                        </template>
                        <template v-else>
                            {{ df.value.format(value.start.toDate(getLocalTimeZone())) }}
                        </template>
                    </template>
                    <template v-else>
                        <span>{{ t('common.pickDateRange') }}</span>
                    </template>
                </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
                <RangeCalendar v-model="value" initial-focus :number-of-months="2" />
            </PopoverContent>
        </Popover>
    </div>
</template>
