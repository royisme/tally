<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NLayout, NButton, NDropdown, NIcon, NSpace, NTooltip } from 'naive-ui'
import { GlobalOutlined, BulbOutlined, BulbFilled } from '@vicons/antd'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
const { t } = useI18n()

// Locale Options
const localeOptions = [
    { label: '中文 (简体)', key: 'zh-CN' },
    { label: 'English', key: 'en-US' }
]

function handleLocaleSelect(key: 'zh-CN' | 'en-US') {
    appStore.setLocale(key)
}
</script>

<template>
    <div class="auth-layout">
        <!-- Top Bar for controls -->
        <div class="auth-header">
            <div class="brand">FreelanceFlow</div>
            <n-space>
                <n-dropdown :options="localeOptions" @select="handleLocaleSelect">
                    <n-button quaternary circle>
                        <template #icon><n-icon>
                                <GlobalOutlined />
                            </n-icon></template>
                    </n-button>
                </n-dropdown>
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
                    {{ appStore.theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark') }}
                </n-tooltip>
            </n-space>
        </div>

        <!-- Main Content -->
        <div class="auth-content">
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
.auth-layout {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--n-color);
    transition: background-color 0.3s;
}

.auth-header {
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand {
    font-family: 'Varela Round', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--n-primary-color);
}

.auth-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
</style>
