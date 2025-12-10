<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NDatePicker, NButton, NSpace, NDynamicTags, useMessage } from 'naive-ui'
import type { Project, Client } from '@/types'
import type { FormInst, FormRules } from 'naive-ui'

interface Props {
  show: boolean
  project?: Project | null
  clients: Client[]
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', project: Omit<Project, 'id'> | Project): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const formValue = ref<Omit<Project, 'id'>>({
  clientId: 0,
  name: '',
  description: '',
  hourlyRate: 0,
  currency: 'USD',
  status: 'active',
  deadline: '',
  tags: []
})

const rules: FormRules = {
  name: [{ required: true, message: 'Please enter project name', trigger: ['blur', 'input'] }],
  clientId: [{ required: true, type: 'number', message: 'Please select a client', trigger: ['blur', 'change'] }],
  hourlyRate: [{ required: true, type: 'number', message: 'Please enter hourly rate', trigger: ['blur', 'change'] }],
  currency: [{ required: true, message: 'Please select currency', trigger: ['blur', 'change'] }]
}

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'CAD', value: 'CAD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Completed', value: 'completed' }
]

watch(() => props.project, (newProject) => {
  if (newProject) {
    formValue.value = {
      clientId: newProject.clientId,
      name: newProject.name,
      description: newProject.description || '',
      hourlyRate: newProject.hourlyRate,
      currency: newProject.currency,
      status: newProject.status,
      deadline: newProject.deadline || '',
      tags: newProject.tags || []
    }
  } else {
    formValue.value = {
      clientId: 0,
      name: '',
      description: '',
      hourlyRate: 0,
      currency: 'USD',
      status: 'active',
      deadline: '',
      tags: []
    }
  }
}, { immediate: true })

function handleClose() {
  emit('update:show', false)
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (props.project) {
        emit('submit', { ...formValue.value, id: props.project.id } as Project)
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
  <n-modal :show="show" @update:show="handleClose" preset="card" :style="{ width: '600px' }" :title="project ? 'Edit Project' : 'New Project'">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" require-mark-placement="right-hanging">
      <n-form-item label="Client" path="clientId">
        <n-select 
          v-model:value="formValue.clientId" 
          :options="clients.map(c => ({ label: c.name, value: c.id }))" 
          placeholder="Select client"
        />
      </n-form-item>

      <n-form-item label="Project Name" path="name">
        <n-input v-model:value="formValue.name" placeholder="Enter project name" />
      </n-form-item>

      <n-form-item label="Description" path="description">
        <n-input v-model:value="formValue.description" type="textarea" placeholder="Project description" :rows="2" />
      </n-form-item>

      <n-space>
        <n-form-item label="Hourly Rate" path="hourlyRate" style="flex: 1;">
          <n-input-number v-model:value="formValue.hourlyRate" :min="0" placeholder="0.00" style="width: 100%;" />
        </n-form-item>

        <n-form-item label="Currency" path="currency" style="flex: 1;">
          <n-select v-model:value="formValue.currency" :options="currencyOptions" />
        </n-form-item>
      </n-space>

      <n-space>
        <n-form-item label="Status" path="status" style="flex: 1;">
          <n-select v-model:value="formValue.status" :options="statusOptions" />
        </n-form-item>

        <n-form-item label="Deadline" path="deadline" style="flex: 1;">
          <n-date-picker v-model:formatted-value="formValue.deadline" type="date" value-format="yyyy-MM-dd" style="width: 100%;" />
        </n-form-item>
      </n-space>

      <n-form-item label="Tags" path="tags">
        <n-dynamic-tags v-model:value="formValue.tags" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">Cancel</n-button>
        <n-button type="primary" @click="handleSubmit">
          {{ project ? 'Update' : 'Create' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
