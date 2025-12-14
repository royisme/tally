<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NDatePicker, NButton, NSpace, NDynamicTags, useMessage } from 'naive-ui'
import type { Project, Client } from '@/types'
import type { FormInst } from 'naive-ui'
import { useI18n } from 'vue-i18n'

interface Props {
  show: boolean
  project?: Project | null
  clients: Client[]
  initialClientId?: number | null
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', project: Omit<Project, 'id'> | Project): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()
const { t } = useI18n()

// Local form data type that allows null for optional date fields
interface ProjectFormData {
  clientId: number | null
  name: string
  description: string
  hourlyRate: number
  currency: string
  status: string
  deadline: string | null
  tags: string[]
  serviceType: string
}

const formRef = ref<FormInst | null>(null)
const formValue = ref<ProjectFormData>({
  clientId: null,
  name: '',
  description: '',
  hourlyRate: 0,
  currency: 'USD',
  status: 'active',
  deadline: null,
  tags: [],
  serviceType: 'software_development'
})

import { projectSchema } from '@/schemas/project'
import { useZodRule } from '@/utils/validation'

const rules = {
  name: useZodRule(projectSchema.shape.name),
  clientId: useZodRule(projectSchema.shape.clientId),
  hourlyRate: useZodRule(projectSchema.shape.hourlyRate),
  currency: useZodRule(projectSchema.shape.currency),
  status: useZodRule(projectSchema.shape.status),
  // Naive UI validator for tags (array) via Zod
  tags: useZodRule(projectSchema.shape.tags)
}

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'CAD', value: 'CAD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' }
]

const statusOptions = [
  { label: t('projects.status.active'), value: 'active' },
  { label: t('projects.status.archived'), value: 'archived' },
  { label: t('projects.status.completed'), value: 'completed' }
]

const serviceTypeOptions = [
  { label: 'Software Development', value: 'software_development' },
  { label: 'System Maintenance', value: 'system_maintenance' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Design', value: 'design' },
  { label: 'Other', value: 'other' }
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
      deadline: newProject.deadline || null,
      tags: newProject.tags || [],
      serviceType: newProject.serviceType || 'software_development'
    }
  } else {
    formValue.value = {
      clientId: props.initialClientId || null,
      name: '',
      description: '',
      hourlyRate: 0,
      currency: 'USD',
      status: 'active',
      deadline: null,
      tags: [],
      serviceType: 'software_development'
    }
  }
}, { immediate: true })

function handleClose() {
  emit('update:show', false)
}

function handleUpdateShow(value: boolean) {
  emit('update:show', value)
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      // Convert null values to backend-compatible defaults
      const submitData = {
        ...formValue.value,
        clientId: formValue.value.clientId || 0,
        deadline: formValue.value.deadline || ''
      }
      if (props.project) {
        emit('submit', { ...submitData, id: props.project.id } as Project)
      } else {
        emit('submit', submitData as Omit<Project, 'id'>)
      }
      handleClose()
    } else {
      message.error('Please fix form errors')
    }
  })
}
</script>

<template>
  <n-modal :show="show" @update:show="handleUpdateShow" preset="card" :style="{ width: '600px' }"
    :title="project ? t('projects.editProject') : t('projects.newProject')">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top"
      require-mark-placement="right-hanging">
      <n-form-item :label="t('form.project.client')" path="clientId">
        <n-select v-model:value="formValue.clientId" :options="clients.map(c => ({ label: c.name, value: c.id }))"
          :placeholder="t('form.project.clientPlaceholder')" filterable />
      </n-form-item>

      <n-form-item :label="t('form.project.name')" path="name">
        <n-input v-model:value="formValue.name" :placeholder="t('form.project.namePlaceholder')" />
      </n-form-item>

      <n-space style="width: 100%">
        <n-form-item label="Service Type" path="serviceType" style="flex: 1;">
          <n-select v-model:value="formValue.serviceType" :options="serviceTypeOptions" />
        </n-form-item>

        <n-form-item :label="t('form.project.status')" path="status" style="flex: 1;">
          <n-select v-model:value="formValue.status" :options="statusOptions" />
        </n-form-item>
      </n-space>

      <n-form-item :label="t('form.project.description')" path="description">
        <n-input v-model:value="formValue.description" type="textarea"
          :placeholder="t('form.project.descriptionPlaceholder')" :rows="2" />
      </n-form-item>

      <n-space>
        <n-form-item :label="t('form.project.hourlyRate')" path="hourlyRate" style="flex: 1;">
          <n-input-number v-model:value="formValue.hourlyRate" :min="0" placeholder="0.00" style="width: 100%;">
            <template #prefix>
              {{ formValue.currency === 'USD' || formValue.currency === 'CAD' ? '$' : (formValue.currency === 'EUR' ?
                '€' : (formValue.currency === 'GBP' ? '£' : '$')) }}
            </template>
          </n-input-number>
        </n-form-item>

        <n-form-item :label="t('form.project.currency')" path="currency" style="flex: 1;">
          <n-select v-model:value="formValue.currency" :options="currencyOptions" />
        </n-form-item>

        <n-form-item :label="t('form.project.deadline')" path="deadline" style="flex: 1;">
          <n-date-picker v-model:formatted-value="formValue.deadline" type="date" value-format="yyyy-MM-dd"
            style="width: 100%;" />
        </n-form-item>
      </n-space>

      <n-form-item :label="t('form.project.tags')" path="tags">
        <n-dynamic-tags v-model:value="formValue.tags" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">{{ t('form.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit">
          {{ project ? t('form.update') : t('form.create') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
