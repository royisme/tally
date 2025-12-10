<script setup lang="ts">
import AppProvider from '@/components/AppProvider.vue'
import { NLayout, NLayoutSider, NLayoutContent, NLayoutHeader, NLayoutFooter, NMenu, NIcon, NButton, NTooltip, NSpace, NDropdown } from 'naive-ui'
import { ref, watch, h, computed, type Component } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import type { MenuOption } from 'naive-ui'
import { 
  DashboardOutlined, 
  UserOutlined, 
  ProjectOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  BulbOutlined,
  BulbFilled
} from '@vicons/antd'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  { label: '仪表盘', key: 'dashboard', icon: renderIcon(DashboardOutlined) },
  { label: '客户', key: 'clients', icon: renderIcon(UserOutlined) },
  { label: '项目', key: 'projects', icon: renderIcon(ProjectOutlined) },
  { label: '工时', key: 'timesheet', icon: renderIcon(ClockCircleOutlined) },
  { label: '发票', key: 'invoices', icon: renderIcon(FileTextOutlined) },
  { label: '报表', key: 'reports', icon: renderIcon(BarChartOutlined) },
]

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { t, locale } = useI18n()

const activeKey = ref<string>(route.path.substring(1) || 'dashboard')
const collapsed = ref(false)

// Locale Options
const localeOptions = [
  { label: '中文 (简体)', key: 'zh-CN' },
  { label: 'English', key: 'en-US' }
]

function handleLocaleSelect(key: 'zh-CN' | 'en-US') {
  appStore.setLocale(key)
}

watch(() => route.path, (newPath) => {
  activeKey.value = newPath.substring(1) || 'dashboard'
})

function handleMenuUpdate(key: string) {
  router.push('/' + key)
}
</script>

<template>
  <AppProvider>
    <n-layout style="height: 100vh">
      
      <!-- 1. Header Area -->
      <n-layout-header bordered class="app-header">
        <div class="header-left">
          <div class="brand-logo">FreelanceFlow</div>
        </div>
        <div class="header-right">
          <n-space size="large" align="center">
            
            <!-- Language Switcher -->
            <n-dropdown :options="localeOptions" @select="handleLocaleSelect">
              <n-button quaternary circle>
                <template #icon><n-icon><GlobalOutlined /></n-icon></template>
              </n-button>
            </n-dropdown>

            <!-- Theme Toggle -->
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button quaternary circle @click="appStore.toggleTheme()">
                  <template #icon>
                    <n-icon>
                      <BulbFilled v-if="appStore.theme === 'dark'" />
                      <BulbOutlined v-else />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              {{ appStore.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
            </n-tooltip>

            <div class="divider-vertical"></div>

            <n-button quaternary circle>
              <template #icon><n-icon><SettingOutlined /></n-icon></template>
            </n-button>
            <n-button quaternary circle>
              <template #icon><n-icon><QuestionCircleOutlined /></n-icon></template>
            </n-button>
          </n-space>
        </div>
      </n-layout-header>

      <!-- 2. Main Body Area (Sider + Content) -->
      <n-layout position="absolute" style="top: 64px; bottom: 32px;" has-sider>
        <n-layout-sider
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :collapsed="collapsed"
          show-trigger
          @collapse="collapsed = true"
          @expand="collapsed = false"
          class="app-sider"
        >
          <n-menu
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
            :value="activeKey"
            @update:value="handleMenuUpdate"
          />
        </n-layout-sider>

        <n-layout-content class="app-content">
          <RouterView />
        </n-layout-content>
      </n-layout>

      <!-- 3. Footer / Status Bar -->
      <n-layout-footer bordered position="absolute" class="app-footer">
        <div class="status-bar">
          <span class="status-item">状态栏：</span>
          <span class="status-item">本周工时: <strong>32h</strong></span>
          <span class="divider">|</span>
          <span class="status-item">待收款: <strong>$2,400</strong></span>
        </div>
      </n-layout-footer>

    </n-layout>
  </AppProvider>
</template>

<style scoped>
/* Header Styles */
.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
  /* background-color removed to inherit from theme */
}

/* Brand Logo Area */
.brand-logo {
  font-family: 'Varela Round', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--n-primary-color); /* Use theme variable */
  letter-spacing: -0.02em;
}

/* Content Styles */
.app-sider {
  /* background-color removed to inherit from theme */
}

.app-content {
  /* background-color removed to inherit from theme */
  padding: 24px;
}

/* Footer Styles */
.app-footer {
  height: 32px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  /* Use explicit variables or theme overrides for footer if needed, 
     but for now let's use the dark stone color as intended for status bar 
     OR conform to theme. Let's stick to theme for consistency. */
  background-color: var(--n-color-modal); /* Reuse modal/card color for contrast or define in theme */
  color: var(--n-text-color-3);
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  border-top: 1px solid var(--n-border-color);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider {
  color: var(--n-text-color-3);
  opacity: 0.5;
}

strong {
  color: var(--n-primary-color);
  font-weight: 600;
}
</style>
