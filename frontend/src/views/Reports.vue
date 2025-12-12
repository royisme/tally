<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NEmpty,
  NSelect,
  NSpace,
  NSpin,
  NStatistic,
  type DataTableColumns,
} from "naive-ui";
import PageContainer from "@/components/PageContainer.vue";
import { api } from "@/api";
import type { Client, Project, ReportFilter, ReportOutput, ReportRow } from "@/types";
import VChart from "vue-echarts";
import type { EChartsOption } from "echarts";

const loading = ref(false);
const error = ref<string | null>(null);
const report = ref<ReportOutput | null>(null);

const clients = ref<Client[]>([]);
const projects = ref<Project[]>([]);

const dateRange = ref<[number, number] | null>(null);
const selectedClientId = ref<number | null>(null);
const selectedProjectId = ref<number | null>(null);

const clientOptions = computed(() =>
  clients.value.map((c) => ({ label: c.name, value: c.id }))
);
const filteredProjectOptions = computed(() => {
  const filtered = selectedClientId.value
    ? projects.value.filter((p) => p.clientId === selectedClientId.value)
    : projects.value;
  return filtered.map((p) => ({ label: p.name, value: p.id }));
});

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function loadFilters() {
  clients.value = await api.clients.list();
  projects.value = await api.projects.list();
}

async function loadReport() {
  loading.value = true;
  error.value = null;
  try {
    const filter: ReportFilter = {};
    if (dateRange.value) {
      filter.startDate = formatDate(dateRange.value[0]);
      filter.endDate = formatDate(dateRange.value[1]);
    }
    if (selectedClientId.value) filter.clientId = selectedClientId.value;
    if (selectedProjectId.value) filter.projectId = selectedProjectId.value;

    report.value = await api.reports.get(filter);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load report";
    report.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadFilters();
  await loadReport();
});

const columns: DataTableColumns<ReportRow> = [
  { title: "Date", key: "date", width: 120 },
  { title: "Client", key: "clientName", width: 180 },
  { title: "Project", key: "projectName", width: 220 },
  {
    title: "Hours",
    key: "hours",
    width: 100,
    render: (row) => row.hours.toFixed(1),
  },
  {
    title: "Income",
    key: "income",
    width: 120,
    render: (row) => row.income.toFixed(2),
  },
];

const chartOption = computed<EChartsOption>(() => {
  const c = report.value?.chart;
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Revenue", "Hours"] },
    xAxis: { type: "category", data: c?.dates ?? [] },
    yAxis: [
      { type: "value", name: "Revenue" },
      { type: "value", name: "Hours" },
    ],
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        data: c?.revenue ?? [],
        yAxisIndex: 0,
      },
      {
        name: "Hours",
        type: "line",
        smooth: true,
        data: c?.hours ?? [],
        yAxisIndex: 1,
      },
    ],
  };
});
</script>

<template>
  <PageContainer title="Reports" subtitle="Deep insights into your business performance">
    <n-card class="filters-card" size="small">
      <n-space align="center" wrap>
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          placeholder="Select date range"
        />
        <n-select
          v-model:value="selectedClientId"
          :options="clientOptions"
          clearable
          placeholder="Client"
          style="min-width: 180px"
        />
        <n-select
          v-model:value="selectedProjectId"
          :options="filteredProjectOptions"
          clearable
          placeholder="Project"
          style="min-width: 200px"
        />
        <n-button type="primary" @click="loadReport">Apply</n-button>
      </n-space>
    </n-card>

    <n-spin :show="loading">
      <n-alert v-if="error" type="error" class="mt16" :title="error" />

      <template v-else>
        <n-space v-if="report" class="mt16" justify="space-between" wrap>
          <n-statistic label="Total Hours" :value="report.totalHours" />
          <n-statistic label="Total Income" :value="report.totalIncome" />
        </n-space>

        <n-card v-if="report && report.chart.dates.length" class="mt16">
          <v-chart :option="chartOption" autoresize style="height: 320px" />
        </n-card>

        <n-empty
          v-if="report && report.rows.length === 0"
          class="mt16"
          description="No data for current filters"
        />

        <n-data-table
          v-if="report && report.rows.length"
          class="mt16"
          :columns="columns"
          :data="report.rows"
          :bordered="false"
        />
      </template>
    </n-spin>
  </PageContainer>
</template>

<style scoped>
.filters-card {
  margin-top: 8px;
}
.mt16 {
  margin-top: 16px;
}
</style>
