<script setup lang="ts">
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import TallyLogo from '@/components/TallyLogo.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">

                <TallyLogo />
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
