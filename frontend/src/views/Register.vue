<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NAvatar, NInput, NIcon, NText,
  NForm, NFormItem, NTooltip, NSelect
} from 'naive-ui'
import {
  UserOutlined, LockOutlined, MailOutlined,
  ReloadOutlined, ArrowLeftOutlined
} from '@vicons/antd'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const { t, locale } = useI18n()

// Form state
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const avatarSeed = ref(Date.now().toString())
const isRegistering = ref(false)
const registerError = ref<string | null>(null)

// Financial preferences
const selectedLanguage = ref(locale.value || 'zh-CN')
const selectedCurrency = ref('CAD')
const selectedProvince = ref('ON')

// Language options
const languageOptions = [
  { label: '中文 (简体)', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// Currency options
const currencyOptions = [
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
  { label: 'EUR - Euro', value: 'EUR' },
]

// Canadian provinces for tax rates
const provinceOptions = [
  { label: 'Ontario (ON) - HST 13%', value: 'ON' },
  { label: 'British Columbia (BC) - GST 5% + PST 7%', value: 'BC' },
  { label: 'Alberta (AB) - GST 5%', value: 'AB' },
  { label: 'Quebec (QC) - GST 5% + QST 9.975%', value: 'QC' },
  { label: 'Manitoba (MB) - GST 5% + PST 7%', value: 'MB' },
  { label: 'Saskatchewan (SK) - GST 5% + PST 6%', value: 'SK' },
  { label: 'Nova Scotia (NS) - HST 15%', value: 'NS' },
  { label: 'New Brunswick (NB) - HST 15%', value: 'NB' },
  { label: 'Newfoundland (NL) - HST 15%', value: 'NL' },
  { label: 'PEI - HST 15%', value: 'PE' },
  { label: 'Other / Non-Canada', value: 'OTHER' },
]

// Computed avatar URL using DiceBear
const avatarUrl = computed(() => {
  const seed = username.value || avatarSeed.value
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
})

// Validation
const passwordsMatch = computed(() => password.value === confirmPassword.value)
const isFormValid = computed(() => {
  return username.value.length >= 3 &&
    password.value.length >= 4 &&
    passwordsMatch.value
})

// Regenerate avatar with new random seed
function regenerateAvatar() {
  avatarSeed.value = Date.now().toString() + Math.random().toString(36).substring(7)
}

// Watch username changes to update avatar
watch(username, () => {
  // When username changes, use it as seed
  avatarSeed.value = username.value || Date.now().toString()
})

// Watch language changes to update app locale immediately
watch(selectedLanguage, (newLang) => {
  appStore.setLocale(newLang as 'zh-CN' | 'en-US')
})

async function handleRegister() {
  if (!isFormValid.value) return

  isRegistering.value = true
  registerError.value = null

  try {
    // Build settings JSON
    const settings = {
      language: selectedLanguage.value,
      currency: selectedCurrency.value,
      province: selectedProvince.value,
      theme: appStore.theme,
    }

    await authStore.register({
      username: username.value,
      password: password.value,
      email: email.value || "",
      avatarUrl: avatarUrl.value,
      settingsJson: JSON.stringify(settings),
    })

    // Store settings in localStorage for now (until backend integration)
    localStorage.setItem('userSettings', JSON.stringify(settings))

    router.push('/dashboard')
  } catch (e) {
    registerError.value = e instanceof Error ? e.message : t('auth.registerFailed')
  } finally {
    isRegistering.value = false
  }
}

function goBack() {
  if (authStore.usersList.length > 0) {
    router.push('/login')
  } else {
    router.push('/splash')
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Back Button -->
      <n-button v-if="authStore.usersList.length > 0" class="back-button" quaternary circle @click="goBack">
        <template #icon>
          <n-icon>
            <ArrowLeftOutlined />
          </n-icon>
        </template>
      </n-button>

      <h1 class="register-title">{{ t('auth.createAccount') }}</h1>
      <p class="register-subtitle">{{ t('auth.setupProfile') }}</p>

      <!-- Avatar Preview -->
      <div class="avatar-section">
        <n-avatar :size="120" :src="avatarUrl" class="avatar-preview" />
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button circle class="refresh-avatar" @click="regenerateAvatar">
              <template #icon>
                <n-icon>
                  <ReloadOutlined />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ t('auth.regenerateAvatar') }}
        </n-tooltip>
      </div>

      <!-- Registration Form -->
      <n-form class="register-form">
        <n-form-item :label="t('auth.username')">
          <n-input v-model:value="username" :placeholder="t('auth.usernamePlaceholder')" size="large">
            <template #prefix>
              <n-icon>
                <UserOutlined />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item :label="t('auth.email')" :show-require-mark="false">
          <n-input v-model:value="email" :placeholder="t('auth.emailPlaceholder')" size="large">
            <template #prefix>
              <n-icon>
                <MailOutlined />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item :label="t('auth.password')">
          <n-input v-model:value="password" type="password" :placeholder="t('auth.passwordPlaceholder')" size="large"
            show-password-on="click">
            <template #prefix>
              <n-icon>
                <LockOutlined />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item :label="t('auth.confirmPassword')">
          <n-input v-model:value="confirmPassword" type="password" :placeholder="t('auth.confirmPasswordPlaceholder')"
            size="large" show-password-on="click" :status="confirmPassword && !passwordsMatch ? 'error' : undefined">
            <template #prefix>
              <n-icon>
                <LockOutlined />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-text v-if="confirmPassword && !passwordsMatch" type="error" class="error-text">
          {{ t('auth.passwordsNotMatch') }}
        </n-text>

        <!-- Financial Preferences Section -->
        <div class="preferences-section">
          <p class="section-title">{{ t('auth.financialPreferences') }}</p>

          <n-form-item :label="t('auth.language')">
            <n-select v-model:value="selectedLanguage" :options="languageOptions" size="large" />
          </n-form-item>

          <n-form-item :label="t('auth.currency')">
            <n-select v-model:value="selectedCurrency" :options="currencyOptions" size="large" />
          </n-form-item>

          <n-form-item :label="t('auth.province')">
            <n-select v-model:value="selectedProvince" :options="provinceOptions" size="large" />
          </n-form-item>
        </div>

        <n-text v-if="registerError" type="error" class="error-text">
          {{ registerError }}
        </n-text>

        <n-button type="primary" size="large" block :loading="isRegistering" :disabled="!isFormValid"
          class="submit-button" @click="handleRegister">
          {{ t('auth.createProfile') }}
        </n-button>
      </n-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 48px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.register-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0 0 32px 0;
}

.avatar-section {
  position: relative;
  display: inline-block;
  margin-bottom: 32px;
}

.avatar-preview {
  border: 4px solid #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.refresh-avatar {
  position: absolute;
  bottom: 0;
  right: -8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.register-form {
  text-align: left;
}

.preferences-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-text {
  display: block;
  margin-bottom: 16px;
  text-align: center;
}

.submit-button {
  margin-top: 16px;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
}
</style>
