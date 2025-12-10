<script setup lang="ts">
import { h } from 'vue'
import { NEmpty, NButton, NIcon } from 'naive-ui'
import PageContainer from '@/components/PageContainer.vue'
import { BarChartOutlined } from '@vicons/antd'
</script>

<template>
  <PageContainer 
    title="Reports" 
    subtitle="Deep insights into your business performance"
  >
    <div class="reports-placeholder">
      <n-empty description="Advanced Reports Coming Soon in Phase 2">
        <template #icon>
          <n-icon>
            <BarChartOutlined />
          </n-icon>
        </template>
        <template #extra>
          <n-button disabled>Generate Report</n-button>
        </template>
      </n-empty>
    </div>
  </PageContainer>
</template>

<style scoped>
.reports-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
