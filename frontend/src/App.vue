<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppProvider from '@/components/AppProvider.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import UpdateDialog from '@/components/update/UpdateDialog.vue'
import { useUpdateStore } from '@/stores/update'

const route = useRoute()
const isAuthLayout = computed(() => route.meta.layout === 'auth')
const updateStore = useUpdateStore()

onMounted(() => {
  // Initialize update event listeners first so state/Progress events are received
  updateStore.init()
  // Check for update on app launch (or fetch status if backend already checked)
  updateStore.checkForUpdate()
})
</script>

<template>
  <AppProvider>
    <AuthLayout v-if="isAuthLayout" />
    <MainLayout v-else />
    <UpdateDialog />
  </AppProvider>
</template>
