<script lang="ts" setup>
import type { RangeCalendarRootEmits, RangeCalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { RangeCalendarRoot, useForwardPropsEmits } from "reka-ui"
import { CalendarCellTrigger, CalendarGrid, CalendarGridBody, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader, CalendarHeading, CalendarNextButton, CalendarPrevButton } from "@/components/ui/calendar"
import RangeCalendarCell from "./RangeCalendarCell.vue"
import { cn } from "@/lib/utils"

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
        <CalendarHeader>
            <CalendarPrevButton />
            <CalendarHeading />
            <CalendarNextButton />
        </CalendarHeader>
        <CalendarGrid v-for="month in grid" :key="month.value.toString()">
            <CalendarGridHead>
                <CalendarGridRow>
                    <CalendarHeadCell v-for="day in weekDays" :key="day">
                        {{ day }}
                    </CalendarHeadCell>
                </CalendarGridRow>
            </CalendarGridHead>
            <CalendarGridBody>
                <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`"
                    class="mt-2 w-full">
                    <RangeCalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
                        <CalendarCellTrigger :day="weekDate" :month="month.value" />
                    </RangeCalendarCell>
                </CalendarGridRow>
            </CalendarGridBody>
        </CalendarGrid>
    </RangeCalendarRoot>
</template>
