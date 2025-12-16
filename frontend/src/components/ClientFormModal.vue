<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import type { Client } from '@/types'
import { clientSchema } from '@/schemas/client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
const { t } = useI18n()

// Extended with billing fields
const formSchema = toTypedSchema(clientSchema.extend({
  billingCompany: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingProvince: z.string().optional(),
  billingPostalCode: z.string().optional(),
}))

const form = useForm({
  validationSchema: formSchema,
})

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
    form.setValues({
      name: newClient.name,
      email: newClient.email,
      website: newClient.website || '',
      avatar: newClient.avatar || '',
      contactPerson: newClient.contactPerson || '',
      address: newClient.address || '',
      currency: newClient.currency,
      status: newClient.status as "active" | "inactive",
      notes: newClient.notes || '',
      billingCompany: newClient.billingCompany || '',
      billingAddress: newClient.billingAddress || '',
      billingCity: newClient.billingCity || '',
      billingProvince: newClient.billingProvince || '',
      billingPostalCode: newClient.billingPostalCode || ''
    })
  } else {
    form.resetForm({
      values: {
        name: '',
        email: '',
        currency: 'USD',
        status: 'active',
      }
    })
  }
}, { immediate: true })

function handleUpdateShow(value: boolean) {
  emit('update:show', value)
}

const onSubmit = form.handleSubmit((values) => {
  if (props.client) {
    emit('submit', { ...values, id: props.client.id } as Client)
  } else {
    emit('submit', values as unknown as Client)
  }
  handleUpdateShow(false)
})
</script>

<template>
  <Dialog :open="show" @update:open="handleUpdateShow">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ client ? t('clients.editClient') : t('clients.newClient') }}</DialogTitle>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
        <Tabs defaultValue="basic" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="basic">{{ t('form.client.tabs.basic') }}</TabsTrigger>
            <TabsTrigger value="address">{{ t('form.client.tabs.address') }}</TabsTrigger>
            <TabsTrigger value="settings">{{ t('form.client.tabs.settings') }}</TabsTrigger>
          </TabsList>

          <!-- Tab 1: Basic Info -->
          <TabsContent value="basic" class="space-y-4 pt-4">
            <div class="grid grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>{{ t('form.client.name') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.namePlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="contactPerson">
                <FormItem>
                  <FormLabel>{{ t('form.client.contactPerson') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.contactPersonPlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel>{{ t('form.client.email') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.emailPlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="website">
                <FormItem>
                  <FormLabel>{{ t('form.client.website') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.websitePlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </TabsContent>

          <!-- Tab 2: Address & Billing -->
          <TabsContent value="address" class="space-y-4 pt-4">
            <FormField v-slot="{ componentField }" name="address">
              <FormItem>
                <FormLabel>{{ t('form.client.address') }}</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" :placeholder="t('form.client.addressPlaceholder')" rows="2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="billingCompany">
              <FormItem>
                <FormLabel>{{ t('form.client.billingCompany') }}</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" :placeholder="t('form.client.billingCompanyPlaceholder')" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="billingAddress">
              <FormItem>
                <FormLabel>{{ t('form.client.billingAddress') }}</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" :placeholder="t('form.client.billingAddressPlaceholder')" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="grid grid-cols-4 gap-4">
              <FormField v-slot="{ componentField }" name="billingCity">
                <FormItem class="col-span-2">
                  <FormLabel>{{ t('form.client.billingCity') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.billingCityPlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="billingProvince">
                <FormItem>
                  <FormLabel>{{ t('form.client.billingProvince') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.billingProvincePlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="billingPostalCode">
                <FormItem>
                  <FormLabel>{{ t('form.client.billingPostalCode') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" :placeholder="t('form.client.billingPostalCodePlaceholder')" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </TabsContent>

          <!-- Tab 3: Other Settings -->
          <TabsContent value="settings" class="space-y-4 pt-4">
            <div class="grid grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="currency">
                <FormItem>
                  <FormLabel>{{ t('form.client.currency') }}</FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem v-for="option in currencyOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="status">
                <FormItem>
                  <FormLabel>{{ t('form.client.status') }}</FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <FormField v-slot="{ componentField }" name="notes">
              <FormItem>
                <FormLabel>{{ t('form.client.notes') }}</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" :placeholder="t('form.client.notesPlaceholder')" rows="3" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" type="button" @click="handleUpdateShow(false)">
            {{ t('form.cancel') }}
          </Button>
          <Button type="submit">
            {{ client ? t('form.update') : t('form.create') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
