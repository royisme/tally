<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { Invoice, Client, Project, TimeEntry } from '@/types'
import { dto } from '@/wailsjs/go/models'
import { invoiceSchema } from '@/schemas/invoice'
import { useSettingsStore } from '@/stores/settings'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

interface Props {
  show: boolean
  invoice?: Invoice | null
  clients: Client[]
}

interface CreateInvoiceFromEntriesPayload {
  input: dto.CreateInvoiceInput
  timeEntryIds: number[]
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'create', payload: CreateInvoiceFromEntriesPayload): void
  (e: 'update', payload: { input: dto.UpdateInvoiceInput; timeEntryIds: number[] }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
// const message = useMessage() // Removed: use toast or form errors instead, or mostly validation errors show inline
const { t } = useI18n()
const settingsStore = useSettingsStore()

// HST/Tax settings from user preferences
const taxEnabled = computed(() => settingsStore.settings?.taxEnabled ?? false)
const defaultTaxRate = computed(() => {
  if (!taxEnabled.value) return 0
  return settingsStore.settings?.defaultTaxRate ?? 0.13
})

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

function coerceInvoiceStatus(status: string): InvoiceStatus {
  if (status === 'draft' || status === 'sent' || status === 'paid' || status === 'overdue') return status
  return 'draft'
}

function defaultDueDateFromIssueDate(issueDate: string): string {
  const ts = Date.parse(issueDate)
  if (!Number.isFinite(ts)) return new Date().toISOString().split('T')[0]!
  const plusDays = 14
  return new Date(ts + plusDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!
}

const isEditMode = computed(() => Boolean(props.invoice))

// Form setup
const formSchema = toTypedSchema(invoiceSchema)
const form = useForm({
  validationSchema: formSchema,
})

// Access values for calculations
const formValues = form.values

const statusOptions = [
  { label: t('invoices.status.draft'), value: 'draft' },
  { label: t('invoices.status.sent'), value: 'sent' },
  { label: t('invoices.status.paid'), value: 'paid' },
  { label: t('invoices.status.overdue'), value: 'overdue' }
]

// Project selection
const selectedProjectId = ref<number | null>(null)
const selectedProjectRate = ref<number>(0)
const projectOptions = ref<Array<{ label: string; value: number }>>([])
const projectsLoading = ref(false)

// Time Entries
const timeEntries = ref<TimeEntry[]>([])
const timeEntriesLoading = ref(false)
const selectedTimeEntryIds = ref<number[]>([])

const eligibleTimeEntries = computed(() =>
  timeEntries.value.filter((e) =>
    e.billable &&
    (!e.invoiceId || (props.invoice && e.invoiceId === props.invoice.id)) &&
    (!e.invoiced || (props.invoice && e.invoiceId === props.invoice.id))
  )
)

const selectedHours = computed(() => {
  const selectedSet = new Set(selectedTimeEntryIds.value)
  const totalSeconds = eligibleTimeEntries.value
    .filter((e) => selectedSet.has(e.id))
    .reduce((sum, e) => sum + e.durationSeconds, 0)
  return totalSeconds / 3600
})

// Helper date getter/setter factory
const createDateComputed = (fieldName: 'issueDate' | 'dueDate') => computed({
  get: (): DateValue | undefined => {
    const d = formValues[fieldName] as string | undefined
    if (!d) return undefined
    try {
      return parseDate(d)
    } catch {
      return undefined
    }
  },
  set: (val: DateValue | undefined) => {
    form.setFieldValue(fieldName, val ? val.toString() : undefined)
  }
})

const issueDateValue = createDateComputed('issueDate')
const dueDateValue = createDateComputed('dueDate')


// Save loaded projects
const projectsData = ref<Project[]>([])

async function loadProjects(clientId: number) {
  projectsLoading.value = true
  try {
    const projects = await api.projects.listByClient(clientId)
    projectsData.value = projects
    projectOptions.value = projects.map((p: Project) => ({
      label: p.name,
      value: p.id
    }))
  } catch {
    projectOptions.value = []
    projectsData.value = []
    // message.error(t('projects.loadError'))
    console.error('Failed to load projects')
  } finally {
    projectsLoading.value = false
  }
}

const isInitializing = ref(false)

// Watch Client ID change
watch(
  () => form.values.clientId,
  async (clientId) => {
    if (isInitializing.value) return

    // Reset project and time entries on client change
    selectedProjectId.value = null
    selectedProjectRate.value = 0
    projectOptions.value = []
    projectsData.value = []
    timeEntries.value = []
    selectedTimeEntryIds.value = []

    if (!clientId) return

    await loadProjects(clientId)
  }
)

// Watch Project ID change
watch(
  () => selectedProjectId.value,
  async (projectId) => {
    // Only fetch if changed (or force fetch if needed, but usually watch triggers on change)
    // If we just loaded an invoice with project ID, this might trigger. 
    // We handle "isInitializing" to avoid clearing data during load, 
    // BUT checking logic below:

    // We WANT to fetch time entries whenever project changes, even during init?
    // During init we set selectedProjectId. If we wait for that tick, we fetch.

    // However, if we are in init, we might want to manually fetch inside the main watch(props.invoice)
    // to control the flow better?
    // Let's rely on this watcher but be careful not to reset selectedTimeEntryIds if we are initializing?
    // Actually, "Reset" happens at the top here:
    if (!isInitializing.value) {
      timeEntries.value = []
      selectedTimeEntryIds.value = []
      selectedProjectRate.value = 0
    }

    if (!projectId) return

    const project = projectsData.value.find(p => p.id === projectId)
    if (project) {
      selectedProjectRate.value = project.hourlyRate
    }

    timeEntriesLoading.value = true
    try {
      timeEntries.value = await api.timeEntries.list(projectId)

      // Auto-select logic
      if (!isInitializing.value) { // Only auto-select if user actively changed project? 
        // Or if it's a new invoice creation flow. 
        // If editing, we rely on existing connections.
      }

      // Since existing selectedTimeEntryIds are reset above if !isInitializing,
      // here we re-populate.
      // If IS initializing, we might want to populate existing invoice entries.

      if (isEditMode.value && props.invoice) {
        // If editing, prioritize invoice's entries
        // Wait, if isInitializing is TRUE, we didn't reset selectedTimeEntryIds.
        // So we just load timeEntries list.
        // We need to make sure selectedTimeEntryIds are SET somewhere.
        // They are set in watch(props.invoice) -> but that only runs ONCE.
        // BUT if timeEntries are empty, we can't select them? 
        // Actually selection is by ID, so we can set IDs even if entries not loaded yet (for checkbox state).
        // But for calculations we need entries.

        // Let's refine:
        if (isInitializing.value) {
          // Just ensure selectedTimeEntryIds are set from invoice (done in main watcher)
          // and timeEntries are loaded.
        } else {
          // New selection by user
          selectedTimeEntryIds.value = eligibleTimeEntries.value
            .filter(e => e.invoiceId === props.invoice?.id) // Keep existing if valid?
            .map(e => e.id)
          if (!isEditMode.value) {
            // Select ALL eligible for new invoice
            selectedTimeEntryIds.value = eligibleTimeEntries.value.map(e => e.id)
          }
        }
      } else {
        // New invoice
        if (!isInitializing.value) {
          selectedTimeEntryIds.value = eligibleTimeEntries.value.map((e) => e.id)
        }
      }
    } catch {
      timeEntries.value = []
      // message.error
    } finally {
      timeEntriesLoading.value = false
    }
  }
)

// Watch Time Selection -> Update Totals
watch(
  () => selectedTimeEntryIds.value,
  () => {
    // Need entries to be loaded
    const selectedSet = new Set(selectedTimeEntryIds.value)
    const totalSeconds = eligibleTimeEntries.value
      .filter((e) => selectedSet.has(e.id))
      .reduce((sum, e) => sum + e.durationSeconds, 0)

    // If initialization hasn't happened or projects not loaded, projectRate might be 0.
    // Calculations should still happen.
    const hours = totalSeconds / 3600
    const subtotal = hours * selectedProjectRate.value

    // We update form values. 
    // IMPORTANT: form.setFieldValue triggers validation.
    form.setFieldValue('subtotal', subtotal)

    const taxRate = form.values.taxRate || 0
    const taxAmount = subtotal * taxRate
    form.setFieldValue('taxAmount', taxAmount)
    form.setFieldValue('total', subtotal + taxAmount)
  },
  { deep: true }
)

// Also watch Tax Rate change
watch(
  () => form.values.taxRate,
  (newRate) => {
    const subtotal = form.values.subtotal || 0
    const taxAmount = subtotal * (newRate || 0)
    form.setFieldValue('taxAmount', taxAmount)
    form.setFieldValue('total', subtotal + taxAmount)
  }
)

watch(() => props.invoice, async (newInvoice) => {
  if (newInvoice) {
    isInitializing.value = true
    try {
      form.setValues({
        clientId: newInvoice.clientId,
        number: newInvoice.number,
        issueDate: newInvoice.issueDate,
        dueDate: newInvoice.dueDate || defaultDueDateFromIssueDate(newInvoice.issueDate),
        // items: newInvoice.items.map(i => ({ ...i })), // Items are manual items, here we mainly use time entries?
        // Current logic doesn't expose manual items editing in this modal (it was NGrid Row 2?).
        // Wait, original template didn't show items list for editing? 
        // Original code had `items: []` in creation, and `items: newInvoice.items` in edit.
        // But NO UI to edit manual items. Just Time Entries.
        // So we keep it that way.
        subtotal: newInvoice.subtotal,
        taxRate: newInvoice.taxRate,
        taxAmount: newInvoice.taxAmount,
        total: newInvoice.total,
        status: coerceInvoiceStatus(newInvoice.status),
      })

      // Load projects for the client
      if (newInvoice.clientId) {
        await loadProjects(newInvoice.clientId)
      }

      // Set project ID if available
      const inv = newInvoice as any
      if (inv.projectId) {
        selectedProjectId.value = inv.projectId
      } else {
        selectedProjectId.value = null
      }

      // Set selected time entries (if not done by project watcher?)
      // We don't have list of entry IDs in Invoice object directly typically unless fetched?
      // But we will fetch time entries via `loadProjects` -> then user sets project.
      // Wait, we need to know which entries are part of this invoice.
      // `eligibleTimeEntries` filters by `invoiceId === props.invoice.id`.
      // So once we load time entries for the project, we can just select all that match this invoice.
      // This logic is in the Project watcher.

    } finally {
      setTimeout(() => {
        isInitializing.value = false
        // Trigger calculation once to ensure?
        // Or trigger project watcher by setting project ID?
        // Project ID was set above.
      }, 0)
    }
  } else {
    // New Invoice
    const issueDate = new Date().toISOString().split('T')[0]!
    const dueDate = defaultDueDateFromIssueDate(issueDate)

    // Generate Invoice Number
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const number = `INV-${yyyy}${mm}${dd}-${hh}${min}`

    form.resetForm({
      values: {
        clientId: undefined,
        number,
        issueDate,
        dueDate,
        subtotal: 0,
        taxRate: defaultTaxRate.value,
        taxAmount: 0,
        total: 0,
        status: 'draft',
        items: []
      }
    })

    selectedProjectId.value = null
    projectOptions.value = []
    timeEntries.value = []
    selectedTimeEntryIds.value = []
  }
}, { immediate: true })

function handleClose() {
  handleUpdateShow(false)
}

function handleUpdateShow(value: boolean) {
  emit('update:show', value)
}

const onSubmit = form.handleSubmit((values) => {
  if (isEditMode.value && props.invoice) {
    emit('update', {
      input: dto.UpdateInvoiceInput.createFrom({
        id: props.invoice.id,
        clientId: values.clientId || 0,
        number: values.number,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        subtotal: values.subtotal,
        taxRate: values.taxRate,
        taxAmount: values.taxAmount,
        total: values.total,
        status: values.status,
        items: (values.items || []).map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: i.amount
        }))
      }),
      timeEntryIds: selectedTimeEntryIds.value
    })
    handleUpdateShow(false)
    return
  }

  if (!values.clientId) {
    // Validation handled by form, but check custom checks
    return
  }
  if (!selectedProjectId.value) {
    // message.warning(t('form.validation.select', { field: t('invoices.form.project') }))
    return
  }
  if (selectedTimeEntryIds.value.length === 0) {
    // message.warning(t('invoices.form.validation.selectEntries'))
    return
  }

  emit('create', {
    input: dto.CreateInvoiceInput.createFrom({
      clientId: values.clientId,
      number: values.number,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      subtotal: 0, // Recalculated by backend or we pass it? 
      // We pass 0 and let backend or just pass values?
      // Original code passed 0 for create?
      // "subtotal: 0"
      // Yes.
      taxRate: values.taxRate,
      taxAmount: 0,
      total: 0,
      status: values.status,
      items: []
    }),
    timeEntryIds: selectedTimeEntryIds.value
  })
  handleUpdateShow(false)
})

function toggleSelection(id: number, checked: boolean | string) {
  if (checked === true) {
    selectedTimeEntryIds.value = [...selectedTimeEntryIds.value, id]
  } else {
    selectedTimeEntryIds.value = selectedTimeEntryIds.value.filter(existingId => existingId !== id)
  }
}

function toggleAll(checked: boolean | string) {
  if (checked === true) {
    selectedTimeEntryIds.value = eligibleTimeEntries.value.map(e => e.id)
  } else {
    selectedTimeEntryIds.value = []
  }
}

const allSelected = computed(() => {
  return eligibleTimeEntries.value.length > 0 && selectedTimeEntryIds.value.length === eligibleTimeEntries.value.length
})
</script>

<template>
  <Dialog :open="show" @update:open="handleUpdateShow">
    <DialogContent class="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ invoice ? t('invoices.form.editTitle') : t('invoices.form.newTitle') }}</DialogTitle>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-6">
        <!-- Top Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Client -->
          <FormField v-slot="{ componentField }" name="clientId">
            <FormItem>
              <FormLabel>{{ t('invoices.form.client') }}</FormLabel>
              <Select v-bind="componentField" :model-value="componentField.modelValue?.toString()">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue :placeholder="t('invoices.form.selectClient')" />
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

          <!-- Project -->
          <FormItem>
            <FormLabel>{{ t('invoices.form.project') }}</FormLabel>
            <Select :model-value="selectedProjectId?.toString()"
              @update:model-value="(v) => selectedProjectId = Number(v)"
              :disabled="!form.values.clientId || projectsLoading">
              <FormControl>
                <SelectTrigger>
                  <SelectValue :placeholder="t('invoices.form.selectProject')" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="p in projectsData" :key="p.id" :value="p.id.toString()">
                  {{ p.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <!-- Status -->
          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>{{ t('invoices.form.status') }}</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Invoice Number -->
          <FormField v-slot="{ componentField }" name="number">
            <FormItem>
              <FormLabel>{{ t('invoices.form.invoiceNumber') }}</FormLabel>
              <FormControl>
                <Input v-bind="componentField" :placeholder="t('invoices.form.invoiceNumberPlaceholder')" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Issue Date -->
          <FormField name="issueDate">
            <FormItem class="flex flex-col">
              <FormLabel>{{ t('invoices.form.issueDate') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button variant="outline"
                      :class="cn('w-full pl-3 text-left font-normal', !issueDateValue && 'text-muted-foreground')">
                      <span>{{ issueDateValue ? issueDateValue.toString() : t('common.pickDate') }}</span>
                      <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar v-model="issueDateValue" mode="single" />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Due Date -->
          <FormField name="dueDate">
            <FormItem class="flex flex-col">
              <FormLabel>{{ t('invoices.form.dueDate') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button variant="outline"
                      :class="cn('w-full pl-3 text-left font-normal', !dueDateValue && 'text-muted-foreground')">
                      <span>{{ dueDateValue ? dueDateValue.toString() : t('common.pickDate') }}</span>
                      <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar v-model="dueDateValue" mode="single" />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <Separator />

        <!-- Time Entries Selection -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ t('invoices.form.timeEntries.title') }}</span>
              <span class="text-xs text-muted-foreground">
                {{ t('invoices.form.timeEntries.selectedHours', { hours: selectedHours.toFixed(2) }) }}
              </span>
            </div>
          </div>

          <div class="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[50px]">
                    <Checkbox :checked="allSelected" @update:checked="(value: boolean) => toggleAll(value)"
                      :disabled="eligibleTimeEntries.length === 0" />
                  </TableHead>
                  <TableHead class="w-[160px]">{{ t('invoices.selectEntries.columns.date') }}</TableHead>
                  <TableHead>{{ t('timesheet.form.description') }}</TableHead>
                  <TableHead class="text-right w-[120px]">{{ t('invoices.selectEntries.columns.hours') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!selectedProjectId">
                  <TableCell colspan="4" class="text-center h-24 text-muted-foreground">
                    {{ t('invoices.form.timeEntries.selectProjectHint') }}
                  </TableCell>
                </TableRow>
                <TableRow v-else-if="!timeEntriesLoading && eligibleTimeEntries.length === 0">
                  <TableCell colspan="4" class="text-center h-24 text-muted-foreground">
                    {{ t('invoices.form.timeEntries.empty') }}
                  </TableCell>
                </TableRow>
                <template v-else>
                  <TableRow v-for="entry in eligibleTimeEntries" :key="entry.id">
                    <TableCell>
                      <Checkbox :checked="selectedTimeEntryIds.includes(entry.id)"
                        @update:checked="(value: boolean) => toggleSelection(entry.id, value)" />
                    </TableCell>
                    <TableCell>{{ entry.date }}</TableCell>
                    <TableCell>{{ entry.description }}</TableCell>
                    <TableCell class="text-right">{{ (entry.durationSeconds / 3600).toFixed(2) }}</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- Totals -->
        <div class="flex flex-col items-end space-y-2 pt-4 border-t">
          <div class="flex items-center gap-4 text-sm">
            <span class="text-muted-foreground">{{ t('invoices.form.subtotal') }}</span>
            <span class="font-medium min-w-[80px] text-right">${{ form.values.subtotal?.toFixed(2) || '0.00' }}</span>
          </div>

          <div v-if="taxEnabled" class="flex items-center gap-4 text-sm">
            <!-- Tax Rate Input -->
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground">{{ t('invoices.form.taxRate') }}</span>
              <div class="relative w-[80px]">
                <Input type="number" step="0.01" min="0" max="1" class="h-8 pr-6 text-right"
                  :model-value="form.values.taxRate"
                  @update:model-value="(v) => form.setFieldValue('taxRate', Number(v))" />
                <span class="absolute right-2 top-0 bottom-0 flex items-center text-muted-foreground text-xs">%</span>
              </div>
            </div>
            <!-- Tax Amount -->
            <div class="flex items-center gap-4">
              <span class="text-muted-foreground">{{ t('invoices.form.taxAmount') }}</span>
              <span class="font-medium min-w-[80px] text-right">${{ form.values.taxAmount?.toFixed(2) || '0.00'
              }}</span>
            </div>
          </div>

          <div class="flex items-center gap-4 text-lg font-bold border-l-4 border-primary pl-4">
            <span>{{ t('invoices.form.total') }}</span>
            <span class="text-primary min-w-[80px] text-right">${{ form.values.total?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" @click="handleClose">
            {{ t('invoices.form.cancel') }}
          </Button>
          <Button type="submit">
            {{ invoice ? t('invoices.form.update') : t('invoices.form.create') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
