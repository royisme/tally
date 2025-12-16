<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const { t } = useI18n()
</script>

<template>
  <div class="reports-page">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('finance.reports.title') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Coming soon...</p>
      </CardContent>
    </Card>
  </div>
</template>
