<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NSelect, NButton, NSpace, useMessage } from 'naive-ui'
import type { Client } from '@/types'
import type { FormInst, FormRules } from 'naive-ui'

interface Props {
  show: boolean
  client?: Client | null
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', client: Omit<Client, 'id'> | Client): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const formValue = ref<Omit<Client, 'id'>>({
  name: '',
  email: '',
  website: '',
  avatar: '',
  contactPerson: '',
  address: '',
  currency: 'USD',
  status: 'active',
  notes: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: 'Please enter client name', trigger: ['blur', 'input'] }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: ['blur', 'input'] },
    { type: 'email', message: 'Please enter valid email', trigger: ['blur', 'input'] }
  ],
  currency: [
    { required: true, message: 'Please select currency', trigger: ['blur', 'change'] }
  ]
}

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Watch for client changes to populate form
watch(() => props.client, (newClient) => {
  if (newClient) {
    formValue.value = {
      name: newClient.name,
      email: newClient.email,
      website: newClient.website || '',
      avatar: newClient.avatar || '',
      contactPerson: newClient.contactPerson || '',
      address: newClient.address || '',
      currency: newClient.currency,
      status: newClient.status,
      notes: newClient.notes || ''
    }
  } else {
    // Reset for new client
    formValue.value = {
      name: '',
      email: '',
      website: '',
      avatar: '',
      contactPerson: '',
      address: '',
      currency: 'USD',
      status: 'active',
      notes: ''
    }
  }
}, { immediate: true })

function handleClose() {
  emit('update:show', false)
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (props.client) {
        // Update existing
        emit('submit', { ...formValue.value, id: props.client.id } as Client)
      } else {
        // Create new
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
  <n-modal :show="show" @update:show="handleClose" preset="card" :style="{ width: '600px' }" :title="client ? 'Edit Client' : 'New Client'">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" require-mark-placement="right-hanging">
      <n-form-item label="Client Name" path="name">
        <n-input v-model:value="formValue.name" placeholder="Enter client name" />
      </n-form-item>

      <n-form-item label="Email" path="email">
        <n-input v-model:value="formValue.email" placeholder="client@example.com" />
      </n-form-item>

      <n-form-item label="Contact Person" path="contactPerson">
        <n-input v-model:value="formValue.contactPerson" placeholder="John Doe" />
      </n-form-item>

      <n-form-item label="Website" path="website">
        <n-input v-model:value="formValue.website" placeholder="https://example.com" />
      </n-form-item>

      <n-form-item label="Address" path="address">
        <n-input v-model:value="formValue.address" type="textarea" placeholder="Full address" :rows="2" />
      </n-form-item>

      <n-space>
        <n-form-item label="Currency" path="currency" style="flex: 1;">
          <n-select v-model:value="formValue.currency" :options="currencyOptions" />
        </n-form-item>

        <n-form-item label="Status" path="status" style="flex: 1;">
          <n-select v-model:value="formValue.status" :options="statusOptions" />
        </n-form-item>
      </n-space>

      <n-form-item label="Notes" path="notes">
        <n-input v-model:value="formValue.notes" type="textarea" placeholder="Additional notes" :rows="3" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">Cancel</n-button>
        <n-button type="primary" @click="handleSubmit">
          {{ client ? 'Update' : 'Create' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
