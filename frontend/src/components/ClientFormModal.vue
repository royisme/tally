<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NInput, NSelect, NButton, NSpace, NTabs, NTabPane, useMessage } from 'naive-ui'
import type { Client } from '@/types'
import type { FormInst } from 'naive-ui'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()

const formRef = ref<FormInst | null>(null)
const activeTab = ref('basic')

// Extended with billing fields
type ClientFormData = Omit<Client, 'id'> & {
  billingCompany: string
  billingAddress: string
  billingCity: string
  billingProvince: string
  billingPostalCode: string
}

const formValue = ref<ClientFormData>({
  name: '',
  email: '',
  website: '',
  avatar: '',
  contactPerson: '',
  address: '',
  currency: 'USD',
  status: 'active',
  notes: '',
  billingCompany: '',
  billingAddress: '',
  billingCity: '',
  billingProvince: '',
  billingPostalCode: ''
})

import { clientSchema } from '@/schemas/client'
import { useZodRule } from '@/utils/validation'

const rules = {
  name: useZodRule(clientSchema.shape.name),
  email: useZodRule(clientSchema.shape.email),
  currency: useZodRule(clientSchema.shape.currency),
  status: useZodRule(clientSchema.shape.status)
}

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' }
]

const statusOptions = [
  { label: t('clients.status.active'), value: 'active' },
  { label: t('clients.status.inactive'), value: 'inactive' }
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
      notes: newClient.notes || '',
      billingCompany: newClient.billingCompany || '',
      billingAddress: newClient.billingAddress || '',
      billingCity: newClient.billingCity || '',
      billingProvince: newClient.billingProvince || '',
      billingPostalCode: newClient.billingPostalCode || ''
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
      notes: '',
      billingCompany: '',
      billingAddress: '',
      billingCity: '',
      billingProvince: '',
      billingPostalCode: ''
    }
  }
  activeTab.value = 'basic'
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
      if (props.client) {
        // Update existing
        emit('submit', { ...formValue.value, id: props.client.id } as Client)
      } else {
        // Create new
        emit('submit', formValue.value)
      }
      handleClose()
    } else {
      message.error(t('form.saveError') || 'Please fix form errors')
    }
  })
}
</script>

<template>
  <n-modal :show="show" @update:show="handleUpdateShow" preset="card" :style="{ width: '600px' }"
    :title="client ? t('clients.editClient') : t('clients.newClient')">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top"
      require-mark-placement="right-hanging">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- Tab 1: Basic Info -->
        <n-tab-pane name="basic" :tab="t('form.client.tabs.basic')">
          <n-space vertical :size="0" style="padding-top: 12px;">
            <n-space style="width: 100%">
              <n-form-item :label="t('form.client.name')" path="name" style="flex: 1; min-width: 240px;">
                <n-input v-model:value="formValue.name" :placeholder="t('form.client.namePlaceholder')" />
              </n-form-item>
              <n-form-item :label="t('form.client.contactPerson')" path="contactPerson"
                style="flex: 1; min-width: 240px;">
                <n-input v-model:value="formValue.contactPerson"
                  :placeholder="t('form.client.contactPersonPlaceholder')" />
              </n-form-item>
            </n-space>

            <n-space style="width: 100%">
              <n-form-item :label="t('form.client.email')" path="email" style="flex: 1; min-width: 240px;">
                <n-input v-model:value="formValue.email" :placeholder="t('form.client.emailPlaceholder')" />
              </n-form-item>
              <n-form-item :label="t('form.client.website')" path="website" style="flex: 1; min-width: 240px;">
                <n-input v-model:value="formValue.website" :placeholder="t('form.client.websitePlaceholder')" />
              </n-form-item>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- Tab 2: Address & Billing -->
        <n-tab-pane name="address" :tab="t('form.client.tabs.address')">
          <n-space vertical :size="0" style="padding-top: 12px;">
            <n-form-item :label="t('form.client.address')" path="address">
              <n-input v-model:value="formValue.address" type="textarea"
                :placeholder="t('form.client.addressPlaceholder')" :rows="2" />
            </n-form-item>

            <n-form-item :label="t('form.client.billingCompany')" path="billingCompany">
              <n-input v-model:value="formValue.billingCompany"
                :placeholder="t('form.client.billingCompanyPlaceholder')" />
            </n-form-item>

            <n-form-item :label="t('form.client.billingAddress')" path="billingAddress">
              <n-input v-model:value="formValue.billingAddress"
                :placeholder="t('form.client.billingAddressPlaceholder')" />
            </n-form-item>

            <n-space style="width: 100%">
              <n-form-item :label="t('form.client.billingCity')" path="billingCity" style="flex: 2;">
                <n-input v-model:value="formValue.billingCity" :placeholder="t('form.client.billingCityPlaceholder')" />
              </n-form-item>
              <n-form-item :label="t('form.client.billingProvince')" path="billingProvince" style="flex: 1;">
                <n-input v-model:value="formValue.billingProvince"
                  :placeholder="t('form.client.billingProvincePlaceholder')" />
              </n-form-item>
              <n-form-item :label="t('form.client.billingPostalCode')" path="billingPostalCode" style="flex: 1;">
                <n-input v-model:value="formValue.billingPostalCode"
                  :placeholder="t('form.client.billingPostalCodePlaceholder')" />
              </n-form-item>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- Tab 3: Other Settings -->
        <n-tab-pane name="settings" :tab="t('form.client.tabs.settings')">
          <n-space vertical :size="0" style="padding-top: 12px;">
            <n-space>
              <n-form-item :label="t('form.client.currency')" path="currency" style="flex: 1; min-width: 150px;">
                <n-select v-model:value="formValue.currency" :options="currencyOptions" />
              </n-form-item>

              <n-form-item :label="t('form.client.status')" path="status" style="flex: 1; min-width: 150px;">
                <n-select v-model:value="formValue.status" :options="statusOptions" />
              </n-form-item>
            </n-space>

            <n-form-item :label="t('form.client.notes')" path="notes">
              <n-input v-model:value="formValue.notes" type="textarea" :placeholder="t('form.client.notesPlaceholder')"
                :rows="3" />
            </n-form-item>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">{{ t('form.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit">
          {{ client ? t('form.update') : t('form.create') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
