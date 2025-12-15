<script setup lang="ts">
import { useRouter } from "vue-router";
import { NCard, NGrid, NGi, NIcon, NSpace, NButton } from "naive-ui";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  GlobalOutlined,
  UserOutlined,
  FileTextOutlined,
  MailOutlined,
  RightOutlined,
} from "@vicons/antd";
import type { Component } from "vue";



const router = useRouter();
const { t } = useI18n();

interface SettingCategory {
  key: string;
  title: string;
  description: string;
  icon: Component;
  path: string;
  color: string;
}

const categories = computed<SettingCategory[]>(() => [
  {
    key: "general",
    title: t("settings.general.title"),
    description: t("settings.general.description"),
    icon: GlobalOutlined,
    path: "/settings/general",
    color: "#18a058",
  },
  {
    key: "profile",
    title: t("settings.profile.title"),
    description: t("settings.profile.description"),
    icon: UserOutlined,
    path: "/settings/profile",
    color: "#2080f0",
  },
  {
    key: "invoice",
    title: t("settings.invoice.title"),
    description: t("settings.invoice.description"),
    icon: FileTextOutlined,
    path: "/settings/invoice",
    color: "#f0a020",
  },
  {
    key: "email",
    title: t("settings.email.title"),
    description: t("settings.email.description"),
    icon: MailOutlined,
    path: "/settings/email",
    color: "#d03050",
  },
]);

function handleCategoryClick(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="settings-index">
    <div class="settings-header">
      <h1 class="page-title">{{ t("nav.settings") }}</h1>
      <p class="page-description">{{ t("settings.index.description") }}</p>
    </div>

    <NGrid cols="1 s:2 m:2 l:2 xl:2" x-gap="16" y-gap="16">
      <NGi v-for="category in categories" :key="category.key">
        <NCard :title="category.title" :segmented="{ content: true, footer: 'soft' }" hoverable class="settings-card">
          <template #header-extra>
            <NIcon :component="category.icon" :size="24" :style="{ color: category.color }" />
          </template>

          <div class="card-content">
            <p class="card-description">{{ category.description }}</p>
          </div>

          <template #footer>
            <NSpace justify="end">
              <NButton type="primary" ghost @click="handleCategoryClick(category.path)">
                {{ t("common.configure") }}
                <template #icon>
                  <NIcon :component="RightOutlined" />
                </template>
              </NButton>
            </NSpace>
          </template>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<style scoped>
.settings-index {
  width: 100%;
}

.settings-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--n-text-color-1);
}

.page-description {
  font-size: 16px;
  color: var(--n-text-color-3);
  margin: 0;
}

.settings-card {
  height: 100%;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--n-box-shadow);
}

.card-content {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.card-description {
  color: var(--n-text-color-2);
  line-height: 1.6;
  margin: 0;
}
</style>
