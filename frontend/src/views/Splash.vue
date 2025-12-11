<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { RocketOutlined } from '@vicons/antd'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const isBackendReady = ref(false)
const showStartButton = ref(false)

onMounted(async () => {
  // Initialize auth and check for existing session
  await authStore.initialize()
  
  // Backend is ready
  isBackendReady.value = true
  
  // If user is already authenticated, auto-redirect to dashboard
  if (authStore.isAuthenticated) {
    router.replace('/dashboard')
    return
  }
  
  // If not authenticated, show start button with a slight delay for animation
  setTimeout(() => {
    showStartButton.value = true
  }, 500)
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
  <div class="splash-container">
    <!-- Background Image with Ken Burns effect -->
    <div class="splash-background" />
    
    <!-- Overlay for better text contrast -->
    <div class="splash-overlay" />
    
    <!-- Content -->
    <div class="splash-content">
      <!-- Logo / Brand -->
      <div class="brand-section">
        <h1 class="brand-title">FreelanceFlow</h1>
        <p class="brand-tagline">{{ t('splash.tagline') }}</p>
      </div>
      
      <!-- Loading / Start Button -->
      <div class="action-section">
        <Transition name="fade">
          <div v-if="!isBackendReady" class="loading-state">
            <n-spin size="large" />
            <p class="loading-text">{{ t('splash.initializing') }}</p>
          </div>
          <div v-else-if="showStartButton" class="start-state">
            <n-button 
              type="primary" 
              size="large" 
              round
              class="start-button"
              @click="handleStart"
            >
              <template #icon>
                <n-icon><RocketOutlined /></n-icon>
              </template>
              {{ t('splash.start') }}
            </n-button>
          </div>
        </Transition>
      </div>
      
      <!-- Version / Footer -->
      <div class="splash-footer">
        <span>v1.0.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.splash-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/splash_bg.jpg');
  background-size: cover;
  background-position: center;
  animation: kenBurns 20s ease-in-out infinite alternate;
}

@keyframes kenBurns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.splash-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.splash-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: white;
}

.brand-section {
  margin-bottom: 60px;
}

.brand-title {
  font-family: 'Varela Round', sans-serif;
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease-out;
}

.brand-tagline {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.action-section {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state,
.start-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.start-button {
  padding: 0 48px;
  height: 52px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.splash-footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.6;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
</style>
