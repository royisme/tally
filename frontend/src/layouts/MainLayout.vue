<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useStatusBarStore } from '@/stores/statusBar'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { useI18n } from 'vue-i18n'
import {
    Globe,
    Sun,
    Moon
} from 'lucide-vue-next'
import { allModules, isModuleEnabled, isModuleIDEnabled, normalizeModuleOverrides } from '@/modules/registry'
import type { ModuleNavItem } from '@/modules/types'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import AppSidebar from '@/components/app-sidebar/AppSidebar.vue'
import type { NavItem } from '@/components/app-sidebar/types'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const statusBarStore = useStatusBarStore()
const preferencesStore = useUserPreferencesStore()
const { t } = useI18n()

type BreadcrumbCrumb = {
    title: string
    url?: string
}

// Locale Options
const localeOptions = computed(() => [
    { label: t('settings.general.options.language.zhCN'), key: 'zh-CN' as const },
    { label: t('settings.general.options.language.enUS'), key: 'en-US' as const },
])

function handleLocaleSelect(key: 'zh-CN' | 'en-US') {
    appStore.setLocale(key)
}

function handleLogout() {
    authStore.logout()
    router.push('/splash')
}

function handleSwitchUser() {
    authStore.switchUser()
    router.push('/login')
}

const userData = computed(() => ({
    name: authStore.username || t('common.user'),
    email: t('common.freelancer'),
    avatar: authStore.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${authStore.username}`
}))


// Navigation Items Mapping
function toNavItem(item: ModuleNavItem): NavItem {
    const url = '/' + item.key
    const isActive = route.path === url || route.path.startsWith(url + '/')

    const navItem: NavItem = {
        title: t(item.labelKey),
        url,
        icon: item.icon,
        isActive
    }

    // Map children recursively
    if (item.children && item.children.length > 0) {
        navItem.children = item.children.map(child => toNavItem(child))
    }

    return navItem
}

const platformItems = computed<NavItem[]>(() => {
    const overrides = normalizeModuleOverrides(preferencesStore.preferences?.moduleOverrides)
    return allModules
        .filter((m) => m.id !== 'settings') // Exclude settings
        .filter((m) => m.nav)
        .filter((m) => isModuleEnabled(m, { moduleOverrides: overrides }))
        .map((m) => toNavItem(m.nav!))
})

const configurationItems = computed<NavItem[]>(() => {
    const settingsModule = allModules.find((m) => m.id === 'settings')
    if (!settingsModule || !settingsModule.nav) return []

    // 1. Get settings nav
    // 2. Filter its children based on registry definition
    const overrides = normalizeModuleOverrides(preferencesStore.preferences?.moduleOverrides)
    const filteredChildren = settingsModule.nav.children?.filter(child => {
        if (!child.moduleID) return true // Always show if no module ID
        return isModuleIDEnabled(child.moduleID, overrides)
    }) ?? []

    // 3. Construct NavItem manually or helper
    const navItem = toNavItem({
        ...settingsModule.nav,
        children: filteredChildren
    })

    return [navItem]
})

function isPathMatch(navUrl: string, currentPath: string): boolean {
    return currentPath === navUrl || currentPath.startsWith(navUrl + '/')
}

function findBestNavPath(items: NavItem[], currentPath: string): NavItem[] {
    let best: NavItem[] = []

    for (const item of items) {
        if (!isPathMatch(item.url, currentPath)) continue

        let candidate: NavItem[] = [item]
        if (item.children && item.children.length > 0) {
            const childBest = findBestNavPath(item.children, currentPath)
            if (childBest.length > 0) candidate = [item, ...childBest]
        }

        const candidateDepth = candidate.length
        const bestDepth = best.length
        const candidateSpecificity = candidate[candidate.length - 1]?.url.length ?? 0
        const bestSpecificity = best[best.length - 1]?.url.length ?? 0

        if (
            candidateDepth > bestDepth ||
            (candidateDepth === bestDepth && candidateSpecificity > bestSpecificity)
        ) {
            best = candidate
        }
    }

    return best
}

const breadcrumbs = computed<BreadcrumbCrumb[]>(() => {
    const navRoot = [...platformItems.value, ...configurationItems.value]
    const navPath = findBestNavPath(navRoot, route.path)

    if (navPath.length > 0) {
        return navPath.map((n) => ({ title: n.title, url: n.url }))
    }

    if (route.meta.moduleID) {
        const mod = allModules.find((m) => m.id === route.meta.moduleID)
        if (mod?.nav?.labelKey) {
            return [{ title: t(mod.nav.labelKey) }]
        }
    }

    return []
})

onMounted(() => {
    statusBarStore.refresh()
})
</script>

<template>
    <SidebarProvider>
        <AppSidebar :features="platformItems" :settings="configurationItems" :user="userData" @logout="handleLogout"
            @profile="handleSwitchUser" />

        <!-- Main Content Inset -->
        <SidebarInset>
            <!-- Header -->
            <header
                class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div class="flex items-center gap-2">
                    <SidebarTrigger class="-ml-1" />
                    <Separator orientation="vertical" class="h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.url ?? `${crumb.title}-${idx}`">
                                <BreadcrumbItem>
                                    <BreadcrumbLink v-if="crumb.url && idx < breadcrumbs.length - 1" as-child>
                                        <RouterLink :to="crumb.url">{{ crumb.title }}</RouterLink>
                                    </BreadcrumbLink>
                                    <BreadcrumbPage v-else>
                                        {{ crumb.title }}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator v-if="idx < breadcrumbs.length - 1" />
                            </template>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div class="ml-auto flex items-center gap-4">
                    <!-- Language Switcher -->
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="icon" class="rounded-full">
                                <Globe class="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem v-for="opt in localeOptions" :key="opt.key"
                                @click="handleLocaleSelect(opt.key as 'zh-CN' | 'en-US')">
                                {{ opt.label }}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <!-- Theme Toggle -->
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <Button variant="ghost" size="icon" class="rounded-full"
                                    @click="appStore.toggleTheme()">
                                    <Sun v-if="appStore.theme === 'dark'" class="h-5 w-5" />
                                    <Moon v-else class="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{{ appStore.theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark') }}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </header>

            <!-- Main Scrollable Area -->
            <div class="flex-1 flex flex-col gap-4 p-4 pt-2 min-h-0 overflow-hidden">
                <RouterView />
            </div>

            <!-- Footer / Status Bar -->
            <footer class="h-8 border-t flex items-center px-6 text-xs text-muted-foreground bg-muted/40">
                <div class="flex items-center gap-3">
                    <span class="font-medium">{{ t('footer.statusBar') }}</span>
                    <span>{{ t('footer.monthlyHours') }} <strong class="text-primary">{{ statusBarStore.monthHoursLabel
                            }}</strong></span>
                    <span class="text-muted-foreground/40">|</span>
                    <span>{{ t('footer.uninvoiced') }} <strong class="text-primary">{{
                        statusBarStore.uninvoicedTotalLabel }}</strong></span>
                    <span class="text-muted-foreground/40">|</span>
                    <span>{{ t('footer.pendingPayment') }} <strong class="text-primary">{{
                        statusBarStore.unpaidTotalLabel }}</strong></span>
                </div>
            </footer>
        </SidebarInset>
    </SidebarProvider>
</template>

<style scoped>
/* Scoped styles removed in favor of Tailwind classes */
</style>
