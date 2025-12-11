<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppProvider from '@/components/AppProvider.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()
const isAuthLayout = computed(() => route.meta.layout === 'auth')
</script>

<template>
  <AppProvider>
    <AuthLayout v-if="isAuthLayout" />
    <MainLayout v-else />
  </AppProvider>
</template>
