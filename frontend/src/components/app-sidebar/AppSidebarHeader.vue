<script setup lang="ts">
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Command } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div
                    class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">FreelanceFlow</span>
                    <span class="truncate text-xs">{{ t('sidebar.premium') }}</span>
                </div>
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
