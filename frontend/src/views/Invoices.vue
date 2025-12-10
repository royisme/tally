<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { 
  NButton, NDataTable, NTag, NSpace, NText, NNumberAnimation, NStatistic, NCard,
  type DataTableColumns, useMessage 
} from 'naive-ui'
import PageContainer from '@/components/PageContainer.vue'
import InvoiceFormModal from '@/components/InvoiceFormModal.vue'
import { useInvoiceStore, type EnrichedInvoice } from '@/stores/invoices'
import { useClientStore } from '@/stores/clients'
import { storeToRefs } from 'pinia'
import type { Invoice } from '@/types'
import { PlusOutlined, DownloadOutlined, FileTextOutlined, DollarOutlined } from '@vicons/antd'

const message = useMessage()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()
const { enrichedInvoices, stats, loading } = storeToRefs(invoiceStore)
const { clients } = storeToRefs(clientStore)

const showModal = ref(false)
const editingInvoice = ref<Invoice | null>(null)

function handleNewInvoice() {
  editingInvoice.value = null
  showModal.value = true
}

function handleEditInvoice(invoice: Invoice) {
  editingInvoice.value = invoice
  showModal.value = true
}

async function handleSubmitInvoice(invoice: Omit<Invoice, 'id'> | Invoice) {
  try {
    if ('id' in invoice) {
      await invoiceStore.updateInvoice(invoice)
      message.success('Invoice updated successfully')
    } else {
      await invoiceStore.createInvoice(invoice)
      message.success('Invoice created successfully')
    }
  } catch (error) {
    message.error('Failed to save invoice')
  }
}

onMounted(() => {
  invoiceStore.fetchInvoices()
  clientStore.fetchClients()
})

const columns: DataTableColumns<EnrichedInvoice> = [
  {
    title: 'Invoice #',
    key: 'number',
    width: 150,
    render(row) {
      return h(NText, { strong: true }, { default: () => row.number })
    }
  },
  {
    title: 'Client',
    key: 'clientName',
    width: 200,
  },
  {
    title: 'Issue Date',
    key: 'issueDate',
    width: 140
  },
  {
    title: 'Amount',
    key: 'total',
    render(row) {
      return h(
        NText, 
        { type: 'default', style: 'font-variant-numeric: tabular-nums;' }, 
        { default: () => `${row.clientCurrency} ${row.total.toLocaleString()}` }
      )
    }
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    render(row) {
      let type: 'success' | 'warning' | 'error' | 'default' = 'default'
      if (row.status === 'paid') type = 'success'
      if (row.status === 'sent') type = 'warning'
      if (row.status === 'overdue') type = 'error'
      
      return h(
        NTag,
        { type, bordered: false, round: true, size: 'small' },
        { default: () => row.status.charAt(0).toUpperCase() + row.status.slice(1) }
      )
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 140,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              quaternary: true,
              circle: true,
              onClick: () => message.success(`Downloading ${row.number}...`)
            },
            { icon: () => h(DownloadOutlined) }
          ),
          h(
            NButton,
            {
              size: 'small',
              quaternary: true,
              circle: true,
              onClick: () => handleEditInvoice(row)
            },
            { icon: () => h(FileTextOutlined) }
          )
        ]
      })
    }
  }
]
</script>

<template>
  <PageContainer 
    title="Invoices" 
    subtitle="Manage billing and payments"
  >
    <template #extra>
      <n-button type="primary" @click="handleNewInvoice">
        <template #icon>
          <n-icon><PlusOutlined /></n-icon>
        </template>
        New Invoice
      </n-button>
    </template>

    <InvoiceFormModal 
      v-model:show="showModal" 
      :invoice="editingInvoice" 
      :clients="clients"
      @submit="handleSubmitInvoice" 
    />

    <template #headerContent>
       <n-space size="large" style="margin-top: 16px;">
          <n-card size="small" :bordered="false" class="stat-card">
            <n-statistic label="Outstanding Amount">
              <template #prefix>
                <n-icon><DollarOutlined /></n-icon>
              </template>
              <n-number-animation :from="0" :to="stats.totalDue" :precision="2" />
            </n-statistic>
          </n-card>
       </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="enrichedInvoices"
      :loading="loading"
      :bordered="false"
      class="invoice-table"
    />
  </PageContainer>
</template>

<style scoped>
.invoice-table :deep(.n-data-table-th) {
  font-weight: 600;
  color: var(--n-text-color-2);
}
.stat-card {
  background: var(--n-card-color);
  min-width: 200px;
}
</style>
