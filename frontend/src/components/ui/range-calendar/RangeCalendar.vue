<script lang="ts" setup>
import type { RangeCalendarRootEmits, RangeCalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import {
    RangeCalendarRoot,
    RangeCalendarHeader,
    RangeCalendarHeading,
    RangeCalendarPrev,
    RangeCalendarNext,
    RangeCalendarGrid,
    RangeCalendarGridHead,
    RangeCalendarGridBody,
    RangeCalendarGridRow,
    RangeCalendarHeadCell,
    RangeCalendarCell,
    RangeCalendarCellTrigger,
    useForwardPropsEmits
} from "reka-ui"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const props = defineProps<RangeCalendarRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props
    return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
    <RangeCalendarRoot v-slot="{ grid, weekDays }" :class="cn('p-3', props.class)" v-bind="forwarded">
        <RangeCalendarHeader class="relative flex w-full items-center justify-between pt-1">
            <RangeCalendarPrev :class="cn(
                buttonVariants({ variant: 'outline' }),
                'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            )">
                <ChevronLeft class="size-4" />
            </RangeCalendarPrev>
            <RangeCalendarHeading class="text-sm font-medium" />
            <RangeCalendarNext :class="cn(
                buttonVariants({ variant: 'outline' }),
                'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            )">
                <ChevronRight class="size-4" />
            </RangeCalendarNext>
        </RangeCalendarHeader>
        <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()"
            class="mt-4 w-full border-collapse select-none space-y-1">
            <RangeCalendarGridHead>
                <RangeCalendarGridRow class="flex">
                    <RangeCalendarHeadCell v-for="day in weekDays" :key="day"
                        class="w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground">
                        {{ day }}
                    </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
            </RangeCalendarGridHead>
            <RangeCalendarGridBody>
                <RangeCalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`"
                    class="mt-2 flex w-full">
                    <RangeCalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate"
                        class="relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-accent first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md [&:has([data-selected][data-outside-view])]:bg-accent/50 [&:has([data-selected][data-selection-end])]:rounded-r-md [&:has([data-selected][data-selection-start])]:rounded-l-md">
                        <RangeCalendarCellTrigger :day="weekDate" :month="month.value" :class="cn(
                            buttonVariants({ variant: 'ghost' }),
                            'size-8 p-0 font-normal',
                            '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
                            '[&[data-outside-view][data-selected]]:bg-accent/50 [&[data-outside-view][data-selected]]:text-muted-foreground [&[data-outside-view][data-selected]]:opacity-30',

                        )" />
                    </RangeCalendarCell>
                </RangeCalendarGridRow>
            </RangeCalendarGridBody>
        </RangeCalendarGrid>
    </RangeCalendarRoot>
</template>
