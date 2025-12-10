<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NDatePicker, NTimePicker, NCheckbox, NButton, NSpace, useMessage } from 'naive-ui'
import type { TimeEntry, Project } from '@/types'
import type { FormInst, FormRules } from 'naive-ui'

interface Props {
  show: boolean
  entry?: TimeEntry | null
  projects: Project[]
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', entry: Omit<TimeEntry, 'id'> | TimeEntry): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const formValue = ref<Omit<TimeEntry, 'id'>>({
  projectId: 0,
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  durationSeconds: 0,
  description: '',
  invoiced: false
})

const rules: FormRules = {
  projectId: [{ required: true, type: 'number', message: 'Please select a project', trigger: ['blur', 'change'] }],
  date: [{ required: true, message: 'Please select date', trigger: ['blur', 'change'] }],
  durationSeconds: [{ required: true, type: 'number', message: 'Please enter duration', trigger: ['blur', 'change'] }],
  description: [{ required: true, message: 'Please enter description', trigger: ['blur', 'input'] }]
}

// Convert seconds to hours for input
const durationHours = computed({
  get: () => formValue.value.durationSeconds / 3600,
  set: (val: number) => { formValue.value.durationSeconds = Math.round(val * 3600) }
})

watch(() => props.entry, (newEntry) => {
  if (newEntry) {
    formValue.value = {
      projectId: newEntry.projectId,
      date: newEntry.date,
      startTime: newEntry.startTime || '',
      endTime: newEntry.endTime || '',
      durationSeconds: newEntry.durationSeconds,
      description: newEntry.description,
      invoiced: newEntry.invoiced
    }
  } else {
    formValue.value = {
      projectId: 0,
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      durationSeconds: 0,
      description: '',
      invoiced: false
    }
  }
}, { immediate: true })

function handleClose() {
  emit('update:show', false)
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (props.entry) {
        emit('submit', { ...formValue.value, id: props.entry.id } as TimeEntry)
      } else {
        emit('submit', formValue.value)
      }
      handleClose()
    } else {
      message.error('Please fix form errors')
    }
  })
}
</script>

<template>
  <n-modal :show="show" @update:show="handleClose" preset="card" :style="{ width: '600px' }" :title="entry ? 'Edit Time Entry' : 'Log Time'">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" require-mark-placement="right-hanging">
      <n-form-item label="Project" path="projectId">
        <n-select 
          v-model:value="formValue.projectId" 
          :options="projects.map(p => ({ label: p.name, value: p.id }))" 
          placeholder="Select project"
        />
      </n-form-item>

      <n-form-item label="Date" path="date">
        <n-date-picker v-model:formatted-value="formValue.date" type="date" value-format="yyyy-MM-dd" style="width: 100%;" />
      </n-form-item>

      <n-form-item label="Duration (Hours)" path="durationSeconds">
        <n-input-number v-model:value="durationHours" :min="0" :step="0.25" placeholder="0.00" style="width: 100%;" />
      </n-form-item>

      <n-form-item label="Description" path="description">
        <n-input v-model:value="formValue.description" type="textarea" placeholder="What did you work on?" :rows="3" />
      </n-form-item>

      <n-form-item label="Time Range (Optional)">
        <n-space>
          <n-time-picker v-model:formatted-value="formValue.startTime" value-format="HH:mm" format="HH:mm" placeholder="Start time" />
          <span>to</span>
          <n-time-picker v-model:formatted-value="formValue.endTime" value-format="HH:mm" format="HH:mm" placeholder="End time" />
        </n-space>
      </n-form-item>

      <n-form-item>
        <n-checkbox v-model:checked="formValue.invoiced">Already invoiced</n-checkbox>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">Cancel</n-button>
        <n-button type="primary" @click="handleSubmit">
          {{ entry ? 'Update' : 'Log Time' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
