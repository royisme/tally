<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Globe,
  User,
  FileText,
  Mail,
  ChevronRight,
  Wallet,
} from "lucide-vue-next";
import type { Component } from "vue";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const router = useRouter();
const { t } = useI18n();

interface SettingCategory {
  key: string;
  title: string;
  description: string;
  icon: Component;
  path: string;
  color: string;
  bgColor: string;
}

const categories = computed<SettingCategory[]>(() => [
  {
    key: "general",
    title: t("settings.general.title"),
    description: t("settings.general.description"),
    icon: Globe,
    path: "/settings/general",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    key: "profile",
    title: t("settings.profile.title"),
    description: t("settings.profile.description"),
    icon: User,
    path: "/settings/profile",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    key: "invoice",
    title: t("settings.invoice.title"),
    description: t("settings.invoice.description"),
    icon: FileText,
    path: "/settings/invoice",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
  },
  {
    key: "email",
    title: t("settings.email.title"),
    description: t("settings.email.description"),
    icon: Mail,
    path: "/settings/email",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/20",
  },
  {
    key: "finance",
    title: t("settings.finance.title"),
    description: t("settings.finance.description"),
    icon: Wallet,
    path: "/settings/finance",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
]);

function handleCategoryClick(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="w-full">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight mb-2 text-foreground">{{ t("nav.settings") }}</h1>
      <p class="text-muted-foreground">{{ t("settings.index.description") }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
      <Card v-for="category in categories" :key="category.key"
        class="hover:shadow-md transition-all cursor-pointer group" @click="handleCategoryClick(category.path)">
        <CardHeader class="flex flex-row items-center space-y-0 pb-2">
          <div class="p-2 rounded-full mr-4" :class="category.bgColor">
            <component :is="category.icon" class="h-6 w-6" :class="category.color" />
          </div>
          <div>
            <CardTitle class="text-base">{{ category.title }}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">{{ category.description }}</p>
        </CardContent>
        <CardFooter class="flex justify-end pt-0">
          <Button variant="ghost" size="sm" class="group-hover:translate-x-1 transition-transform">
            {{ t("common.configure") }}
            <ChevronRight class="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>
