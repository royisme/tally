<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NButton, NAvatar, NInput, NIcon, NSpace, NText } from 'naive-ui'
import { LockOutlined, PlusOutlined } from '@vicons/antd'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import type { UserListItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const selectedUser = ref<UserListItem | null>(null)
const password = ref('')
const isLoggingIn = ref(false)
const loginError = ref<string | null>(null)

onMounted(() => {
  // If no users, redirect to register
  if (authStore.usersList.length === 0) {
    router.replace('/register')
  }
})

function selectUser(user: UserListItem) {
  selectedUser.value = user
  password.value = ''
  loginError.value = null
}

function cancelSelection() {
  selectedUser.value = null
  password.value = ''
  loginError.value = null
}

async function handleLogin() {
  if (!selectedUser.value || !password.value) return
  
  isLoggingIn.value = true
  loginError.value = null
  
  try {
    await authStore.login({
      username: selectedUser.value.username,
      password: password.value,
    })
    router.push('/dashboard')
  } catch (e) {
    loginError.value = t('auth.invalidPassword')
  } finally {
    isLoggingIn.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">{{ t('auth.welcome') }}</h1>
      <p class="login-subtitle">{{ t('auth.selectUser') }}</p>
      
      <!-- User Selection Grid -->
      <Transition name="fade" mode="out-in">
        <div v-if="!selectedUser" class="user-grid">
          <div 
            v-for="user in authStore.usersList" 
            :key="user.id"
            class="user-card"
            @click="selectUser(user)"
          >
            <n-avatar
              :size="80"
              :src="user.avatarUrl"
              :fallback-src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`"
            />
            <span class="user-name">{{ user.username }}</span>
          </div>
          
          <!-- Add New User Card -->
          <div class="user-card add-user" @click="goToRegister">
            <div class="add-icon">
              <n-icon size="40"><PlusOutlined /></n-icon>
            </div>
            <span class="user-name">{{ t('auth.addUser') }}</span>
          </div>
        </div>
        
        <!-- Password Entry -->
        <div v-else class="password-section">
          <n-avatar
            :size="100"
            :src="selectedUser.avatarUrl"
            :fallback-src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedUser.username}`"
          />
          <h2 class="selected-username">{{ selectedUser.username }}</h2>
          
          <n-space vertical size="large" class="password-form">
            <n-input
              v-model:value="password"
              type="password"
              :placeholder="t('auth.enterPassword')"
              size="large"
              show-password-on="click"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <n-icon><LockOutlined /></n-icon>
              </template>
            </n-input>
            
            <n-text v-if="loginError" type="error">{{ loginError }}</n-text>
            
            <n-space>
              <n-button 
                type="primary" 
                size="large"
                :loading="isLoggingIn"
                :disabled="!password"
                @click="handleLogin"
              >
                {{ t('auth.login') }}
              </n-button>
              <n-button 
                size="large"
                @click="cancelSelection"
              >
                {{ t('common.cancel') }}
              </n-button>
            </n-space>
          </n-space>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 48px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.login-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0 0 40px 0;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 24px;
  justify-items: center;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 120px;
}

.user-card:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-4px);
}

.user-card.add-user {
  border: 2px dashed #ccc;
}

.user-card.add-user:hover {
  border-color: #667eea;
}

.add-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.user-card.add-user:hover .add-icon {
  background: #667eea;
  color: white;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.password-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.selected-username {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.password-form {
  width: 100%;
  max-width: 300px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
