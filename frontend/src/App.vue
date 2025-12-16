<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import UpdateDialog from '@/components/update/UpdateDialog.vue'
import { useUpdateStore } from '@/stores/update'
import { useBootstrapStore } from '@/stores/bootstrap'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from '@/components/ui/sonner'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { applyThemeToRoot } from '@/theme/tokens'

const route = useRoute()
const router = useRouter()
const isAuthLayout = computed(() => route.meta.layout === 'auth')
const updateStore = useUpdateStore()
const bootstrapStore = useBootstrapStore()
const authStore = useAuthStore()
const appStore = useAppStore()
const { locale } = useI18n()

// Theme Configuration
watch(
  () => appStore.theme,
  (newTheme) => {
    applyThemeToRoot(newTheme)
  },
  { immediate: true }
)

// Watch for locale changes to update vue-i18n
watch(
  () => appStore.locale,
  (newLocale) => {
    if (newLocale !== locale.value) {
      locale.value = newLocale
    }
  },
  { immediate: true }
)

function restoreLastRouteIfNeeded() {
  if (!authStore.isAuthenticated) return
  if (route.meta.requiresAuth) return

  const last = localStorage.getItem('lastAuthedRoute')
  if (
    last &&
    last.startsWith('/') &&
    !['/splash', '/login', '/register'].includes(last) &&
    router.resolve(last).matched.length > 0
  ) {
    router.replace(last)
  } else {
    router.replace('/dashboard')
  }
}

onMounted(() => {
  bootstrapStore.init()
  bootstrapStore.mark('appMountedMs')
  // Initialize update event listeners first so state/Progress events are received
  const updateStart = typeof performance !== 'undefined' ? performance.now() : 0
  updateStore.init()
  if (typeof performance !== 'undefined') {
    bootstrapStore.mark('updateInitMs', performance.now() - updateStart)
  }

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      restoreLastRouteIfNeeded()
    }
  }
  const handleFocus = () => restoreLastRouteIfNeeded()
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('focus', handleFocus)

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('focus', handleFocus)
  })
})
</script>

<template>
  <div class="h-full">
    <AuthLayout v-if="isAuthLayout" />
    <MainLayout v-else />
    <UpdateDialog />
    <Toaster />
  </div>
</template>
