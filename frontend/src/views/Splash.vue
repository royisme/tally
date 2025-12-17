<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useBootstrapStore } from '@/stores/bootstrap'
import SplashProgress from '@/components/SplashProgress.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const bootstrapStore = useBootstrapStore()
const { t, locale } = useI18n()

const isBackendReady = ref(false)
const isAutoRedirecting = ref(false)
const showProgress = computed(() => !isBackendReady.value || isAutoRedirecting.value)
const version = __APP_VERSION__

// Typewriter effect state
const taglines = computed(() => [
  t('splash.taglines.empower'),
  t('splash.taglines.trackTime'),
  t('splash.taglines.yourWork'),
])

const currentTaglineIndex = ref(0)
const displayedText = ref('')
const isTyping = ref(true)
let typewriterInterval: ReturnType<typeof setInterval> | null = null
let pauseTimeout: ReturnType<typeof setTimeout> | null = null

const currentFullText = computed(() => taglines.value[currentTaglineIndex.value] ?? '')

function startTypewriter() {
  let charIndex = 0
  isTyping.value = true
  displayedText.value = ''

  const fullText = currentFullText.value

  typewriterInterval = setInterval(() => {
    if (charIndex < fullText.length) {
      displayedText.value += fullText[charIndex]
      charIndex++
    } else {
      // Finished typing this line
      if (typewriterInterval) clearInterval(typewriterInterval)
      typewriterInterval = null
      isTyping.value = false

      // Pause then start erasing
      pauseTimeout = setTimeout(() => {
        startEraser()
      }, 2500)
    }
  }, 80)
}

function startEraser() {
  isTyping.value = true

  typewriterInterval = setInterval(() => {
    if (displayedText.value.length > 0) {
      displayedText.value = displayedText.value.slice(0, -1)
    } else {
      // Finished erasing
      if (typewriterInterval) clearInterval(typewriterInterval)
      typewriterInterval = null
      isTyping.value = false

      // Move to next tagline
      const total = taglines.value.length || 1
      currentTaglineIndex.value = (currentTaglineIndex.value + 1) % total

      // Small pause then start typing next
      pauseTimeout = setTimeout(() => {
        startTypewriter()
      }, 500)
    }
  }, 40)
}

onMounted(async () => {
  bootstrapStore.mark('splashMountedMs')
  // Start typewriter effect
  startTypewriter()

  // Initialize auth and check for existing session
  const authStart = typeof performance !== 'undefined' ? performance.now() : 0
  await authStore.initialize()
  if (typeof performance !== 'undefined') {
    bootstrapStore.mark('authInitMs', performance.now() - authStart)
  }

  // Backend is ready
  isBackendReady.value = true
  bootstrapStore.mark('totalToReadyMs')

  // If user is already authenticated, auto-redirect to dashboard
  if (authStore.isAuthenticated) {
    isAutoRedirecting.value = true
    setTimeout(() => {
      const last = localStorage.getItem("lastAuthedRoute");
      if (
        last &&
        last.startsWith("/") &&
        !["/splash", "/login", "/register"].includes(last) &&
        router.resolve(last).matched.length > 0
      ) {
        router.replace(last);
      } else {
        router.replace('/dashboard');
      }
    }, 600)
    return
  }

  // No prefetching needed - using static imports for desktop app
})

onUnmounted(() => {
  if (typewriterInterval) clearInterval(typewriterInterval)
  if (pauseTimeout) clearTimeout(pauseTimeout)
})

function restartTypewriter() {
  if (typewriterInterval) clearInterval(typewriterInterval)
  if (pauseTimeout) clearTimeout(pauseTimeout)
  typewriterInterval = null
  pauseTimeout = null
  currentTaglineIndex.value = 0
  displayedText.value = ''
  startTypewriter()
}

watch(locale, () => {
  // Ensure we don't mix languages mid-typing when user switches locale
  restartTypewriter()
})

function handleStart() {
  if (authStore.usersList.length > 0) {
    // Users exist, go to login selection
    router.push('/login')
  } else {
    // No users, go to onboarding/registration
    router.push('/register')
  }
}
</script>

<template>
  <div class="fixed inset-0 overflow-hidden" :class="{ 'animate-fade-out': isAutoRedirecting }">
    <!-- Background Image with Ken Burns effect -->
    <div class="absolute inset-0 bg-cover bg-center animate-ken-burns"
      style="background-image: url('/splash_bg.jpg')" />

    <!-- Overlay for better text contrast -->
    <div class="absolute inset-0 bg-linear-to-br from-black/60 via-black/30 to-black/60" />

    <!-- Content -->
    <div class="relative z-10 h-full flex flex-col items-center justify-center p-10 text-center text-white">
      <!-- Logo / Brand -->
      <div class="mb-12 flex flex-col items-center">
        <h1
          class="text-6xl font-extrabold tracking-tighter mb-4 drop-shadow-2xl animate-fade-in-up bg-clip-text text-transparent bg-linear-to-b from-white to-white/70">
          Tally
        </h1>
        <p class="text-xl opacity-90 min-h-[1.6em] animate-fade-in-up-delay">
          <span>{{ displayedText }}</span>
          <span class="inline-block ml-0.5" :class="isTyping ? 'opacity-100' : 'animate-blink'">|</span>
        </p>
      </div>

      <!-- Action Button / Auto-enter -->
      <div class="min-h-20 flex flex-col gap-3 items-center justify-center">
        <SplashProgress v-if="showProgress" :is-ready="isBackendReady" :is-auto-redirecting="isAutoRedirecting" />
        <Button v-if="!showProgress && isBackendReady" size="lg"
          class="rounded-full text-lg h-14 px-12 min-w-[200px] shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
          @click="handleStart">
          <span>{{ t('splash.start') }}</span>
        </Button>
      </div>
    </div>

    <!-- Version Badge - Bottom Right -->
    <div class="absolute bottom-4 right-4 z-20 text-xs text-white/50 px-2 py-1 bg-black/20 rounded backdrop-blur-sm">
      v{{ version }}
    </div>
  </div>
</template>

<style scoped>
/* Ken Burns animation for background */
@keyframes kenBurns {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.1);
  }
}

.animate-ken-burns {
  animation: kenBurns 20s ease-in-out infinite alternate;
}

/* Fade out animation for auto-redirect */
@keyframes fadeOut {
  to {
    opacity: 0;
    transform: scale(1.02);
  }
}

.animate-fade-out {
  animation: fadeOut 0.6s ease forwards;
}

/* Fade in up animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}

.animate-fade-in-up-delay {
  animation: fadeInUp 1s ease-out 0.2s both;
}

/* Cursor blink animation */
@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.animate-blink {
  animation: blink 1s step-end infinite;
}
</style>
