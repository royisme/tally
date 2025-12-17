<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { Languages, Moon, Sun } from 'lucide-vue-next'
import TallyLogo from '@/components/TallyLogo.vue'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
const { t } = useI18n()

// Locale Options
const localeOptions = computed(() => [
    { label: t('settings.general.options.language.zhCN'), key: 'zh-CN' as const },
    { label: t('settings.general.options.language.enUS'), key: 'en-US' as const },
])

function handleLocaleSelect(key: 'zh-CN' | 'en-US') {
    appStore.setLocale(key)
}
</script>

<template>
    <div class="min-h-screen w-screen flex flex-col auth-gradient-bg">
        <!-- Transparent Header on gradient -->
        <header class="p-4 md:px-8 flex justify-between items-center">
            <div class="relative z-20 flex items-center text-lg font-medium">
                <TallyLogo className="mr-2 h-6 w-6" />
            </div>
            <div class="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="text-white hover:bg-white/20 rounded-full">
                            <Languages class="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem v-for="opt in localeOptions" :key="opt.key"
                            @click="handleLocaleSelect(opt.key as any)">
                            {{ opt.label }}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button variant="ghost" size="icon" class="text-white hover:bg-white/20 rounded-full"
                                @click="appStore.toggleTheme()">
                                <Moon v-if="appStore.theme === 'dark'" class="h-5 w-5" />
                                <Sun v-else class="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{{ appStore.theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark') }}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </header>

        <!-- Main Content -->
        <div class="flex-1 min-h-0 flex justify-center items-center p-4 overflow-hidden">
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
/* Auth gradient background implementation remains here as it is complex custom CSS */
</style>
