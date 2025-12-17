<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const { t } = useI18n()
</script>

<template>
  <div class="import-page">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('finance.import.title') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{{ t('common.comingSoon') }}</p>
      </CardContent>
    </Card>
  </div>
</template>
