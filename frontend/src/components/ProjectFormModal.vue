<script setup lang="ts">
import { watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useI18n } from 'vue-i18n'
import type { Project, Client } from '@/types'
import { projectSchema } from '@/schemas/project'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import {
  parseDate,
  type DateValue,
} from '@internationalized/date'

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

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
const { t } = useI18n()

// Extend schema to include serviceType which was missing in base schema
const formSchema = toTypedSchema(projectSchema.extend({
  serviceType: z.string().optional(),
  status: z.enum(["active", "archived", "completed"]),
  tags: z.array(z.string()).default([]),
  deadline: z.string().optional(),
}))

const form = useForm({
  validationSchema: formSchema,
})

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'CAD', value: 'CAD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
]

const statusOptions = [
  { label: t('projects.status.active'), value: 'active' },
  { label: t('projects.status.archived'), value: 'archived' },
  { label: t('projects.status.completed'), value: 'completed' }
]

const serviceTypeOptions = computed(() => [
  { label: t('form.project.serviceTypes.softwareDevelopment'), value: 'software_development' },
  { label: t('form.project.serviceTypes.systemMaintenance'), value: 'system_maintenance' },
  { label: t('form.project.serviceTypes.consulting'), value: 'consulting' },
  { label: t('form.project.serviceTypes.design'), value: 'design' },
  { label: t('form.project.serviceTypes.other'), value: 'other' },
])

// Computed for tags handling (array <-> comma separated string)
const tagsString = computed({
  get: () => {
    const tags = form.values.tags
    return Array.isArray(tags) ? tags.join(', ') : ''
  },
  set: (val: string) => {
    const tags = val.split(',').map(s => s.trim()).filter(Boolean)
    form.setFieldValue('tags', tags)
  }
})

// Date handling Helper
const dateValue = computed({
  get: (): DateValue | undefined => {
    const d = form.values.deadline
    if (!d) return undefined
    try {
      return parseDate(d)
    } catch {
      return undefined
    }
  },
  set: (val: DateValue | undefined) => {
    form.setFieldValue('deadline', val ? val.toString() : undefined)
  }
})

watch(() => props.project, (newProject) => {
  if (newProject) {
    form.setValues({
      clientId: newProject.clientId,
      name: newProject.name,
      description: newProject.description || '',
      hourlyRate: newProject.hourlyRate,
      currency: newProject.currency,
      status: newProject.status as "active" | "archived" | "completed",
      deadline: newProject.deadline || undefined,
      tags: newProject.tags || [],
      // @ts-ignore
      serviceType: newProject.serviceType || 'software_development'
    })
  } else {
    form.resetForm({
      values: {
        clientId: props.initialClientId || undefined,
        name: '',
        description: '',
        hourlyRate: 0,
        currency: 'USD',
        status: 'active',
        deadline: undefined,
        tags: [],
        serviceType: 'software_development'
      }
    })
  }
}, { immediate: true })

function handleUpdateShow(value: boolean) {
  emit('update:show', value)
}

const onSubmit = form.handleSubmit((values) => {
  const submitData = {
    ...values,
    clientId: values.clientId || 0,
    deadline: values.deadline || '',
    tags: values.tags || [],
    description: values.description || '',
    serviceType: values.serviceType || 'software_development'
  }

  if (props.project) {
    emit('submit', { ...submitData, id: props.project.id } as Project)
  } else {
    emit('submit', submitData as Omit<Project, 'id'>)
  }
  handleUpdateShow(false)
})
</script>

<template>
  <Dialog :open="show" @update:open="handleUpdateShow">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ project ? t('projects.editProject') : t('projects.newProject') }}</DialogTitle>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="clientId">
          <FormItem>
            <FormLabel>{{ t('form.project.client') }}</FormLabel>
            <Select v-bind="componentField" :model-value="componentField.modelValue?.toString()">
              <FormControl>
                <SelectTrigger>
                  <SelectValue :placeholder="t('form.project.clientPlaceholder')" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="client in clients" :key="client.id" :value="client.id.toString()">
                  {{ client.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>{{ t('form.project.name') }}</FormLabel>
            <FormControl>
              <Input v-bind="componentField" :placeholder="t('form.project.namePlaceholder')" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="serviceType">
            <FormItem>
              <FormLabel>{{ t('form.project.serviceType') }}</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue :placeholder="t('form.project.serviceTypePlaceholder')" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="option in serviceTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>{{ t('form.project.status') }}</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue :placeholder="t('form.project.statusPlaceholder')" />
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

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>{{ t('form.project.description') }}</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" :placeholder="t('form.project.descriptionPlaceholder')" rows="2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-3 gap-4">
          <FormField v-slot="{ componentField }" name="hourlyRate">
            <FormItem>
              <FormLabel>{{ t('form.project.hourlyRate') }}</FormLabel>
              <FormControl>
                <div class="relative w-full max-w-sm items-center">
                  <Input v-bind="componentField" type="number" step="0.01" min="0" placeholder="0.00" class="pl-8" />
                  <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                    <span class="text-sm text-muted-foreground">
                      {{ form.values.currency === 'USD' || form.values.currency === 'CAD' ? '$' : (form.values.currency
                        === 'EUR' ? '€' : (form.values.currency === 'GBP' ? '£' : '$')) }}
                    </span>
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="currency">
            <FormItem>
              <FormLabel>{{ t('form.project.currency') }}</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue :placeholder="t('form.project.currencyPlaceholder')" />
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

          <FormField name="deadline">
            <FormItem class="flex flex-col">
              <FormLabel>{{ t('form.project.deadline') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button variant="outline"
                      :class="cn('w-full pl-3 text-left font-normal', !dateValue && 'text-muted-foreground')">
                      <span>{{ dateValue ? dateValue.toString() : t('common.pickDate') }}</span>
                      <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar v-model="dateValue" mode="single" initial-focus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField name="tags">
          <FormItem>
            <FormLabel>{{ t('form.project.tags') }}</FormLabel>
            <FormControl>
              <Input v-model="tagsString" :placeholder="t('form.project.tagsPlaceholder')" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button variant="outline" type="button" @click="handleUpdateShow(false)">
            {{ t('form.cancel') }}
          </Button>
          <Button type="submit">
            {{ project ? t('form.update') : t('form.create') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
