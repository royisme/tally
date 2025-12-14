<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  NForm,
  NFormItem,
  NSelect,
  NInputNumber,
  NSpace,
  NButton,
  NSwitch,
  useMessage,
  NCard,
} from "naive-ui";
import { useSettingsStore } from "@/stores/settings";
import { useAppStore } from "@/stores/app";
import type { UserSettings } from "@/types";
import { useI18n } from "vue-i18n";
import { allModules } from "@/modules/registry";
import type { ModuleID } from "@/modules/types";

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const message = useMessage();
const { t } = useI18n();

const formRef = ref<InstanceType<typeof NForm> | null>(null);
const form = ref<UserSettings>({
  currency: "USD",
  defaultTaxRate: 0,
  language: "en-US",
  theme: "light",
  dateFormat: "2006-01-02",
  timezone: "UTC",
  senderName: "",
  senderCompany: "",
  senderAddress: "",
  senderPhone: "",
  senderEmail: "",
  senderPostalCode: "",
  invoiceTerms: "",
  defaultMessageTemplate: "",
  hstRegistered: false,
  hstNumber: "",
  taxEnabled: false,
  expectedIncome: "",
});

const saving = ref(false);

const currencyOptions = computed(() => [
  { label: `USD - ${t("settings.general.options.currency.usd")}`, value: "USD" },
  { label: `CAD - ${t("settings.general.options.currency.cad")}`, value: "CAD" },
  { label: `CNY - ${t("settings.general.options.currency.cny")}`, value: "CNY" },
  { label: `EUR - ${t("settings.general.options.currency.eur")}`, value: "EUR" },
]);

const timezoneOptions = [
  { label: "UTC", value: "UTC" },
  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
  { label: "America/Toronto", value: "America/Toronto" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "Europe/London", value: "Europe/London" },
];

const dateFormatOptions = [
  { label: "YYYY-MM-DD", value: "2006-01-02" },
  { label: "MM/DD/YYYY", value: "01/02/2006" },
  { label: "DD/MM/YYYY", value: "02/01/2006" },
];

const rules = computed(() => ({
  currency: {
    required: true,
    message: t("settings.general.validation.currencyRequired"),
    trigger: "blur",
  },
  dateFormat: {
    required: true,
    message: t("settings.general.validation.dateFormatRequired"),
    trigger: "blur",
  },
  timezone: {
    required: true,
    message: t("settings.general.validation.timezoneRequired"),
    trigger: "blur",
  },
}));

const toggleableModules = computed<Array<{ id: ModuleID; labelKey: string }>>(() => {
  return allModules
    .filter((m) => m.toggleable)
    .filter((m) => m.nav)
    .map((m) => ({ id: m.id, labelKey: m.nav!.labelKey }));
});

function isModuleEnabled(moduleID: ModuleID): boolean {
  const overrides = settingsStore.settings?.moduleOverrides;
  if (overrides && overrides[moduleID] !== undefined) {
    return overrides[moduleID] === true;
  }
  const mod = allModules.find((m) => m.id === moduleID);
  return mod ? mod.enabledByDefault : true;
}

async function setModuleEnabled(moduleID: ModuleID, enabled: boolean) {
  const currentSettings = settingsStore.settings;
  if (!currentSettings) {
    message.error(t("settings.general.messages.loadError"));
    return;
  }
  const nextOverrides = { ...currentSettings.moduleOverrides, [moduleID]: enabled };

  try {
    await settingsStore.saveSettings({ ...currentSettings, moduleOverrides: nextOverrides });
    message.success(t("settings.general.modules.messages.saved"));
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.general.modules.messages.saveError"));
  }
}

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    // Only use the general settings fields
    const settings = settingsStore.settings;
    form.value = {
      ...form.value,
      currency: settings.currency,
      defaultTaxRate: settings.defaultTaxRate,
      language: settings.language,
      theme: settings.theme,
      dateFormat: settings.dateFormat,
      timezone: settings.timezone,
    };
  }
});

async function handleSave() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  saving.value = true;
  try {
    // Only save the general settings fields
    const currentSettings = settingsStore.settings;
    if (!currentSettings) {
      message.error(t("settings.general.messages.loadError"));
      return;
    }
    const updatedSettings = {
      ...currentSettings,
      currency: form.value.currency,
      defaultTaxRate: form.value.defaultTaxRate,
      language: form.value.language,
      theme: form.value.theme,
      dateFormat: form.value.dateFormat,
      timezone: form.value.timezone,
    };
    await settingsStore.saveSettings(updatedSettings);
    message.success(t("settings.general.messages.saved"));
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.general.messages.saveError"));
  } finally {
    saving.value = false;
  }
}

function handleThemeChange(value: string) {
  if (appStore.theme !== value) {
    appStore.setTheme(value as 'light' | 'dark');
  }
}
</script>

<template>
  <div class="general-settings">
    <NCard :title="t('settings.general.cardTitle')" :bordered="false">
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NFormItem :label="t('settings.general.fields.currency')" path="currency">
          <NSelect v-model:value="form.currency" :options="currencyOptions" :disabled="saving" />
        </NFormItem>

        <NFormItem :label="t('settings.general.fields.defaultTaxRate')" path="defaultTaxRate">
          <NInputNumber v-model:value="form.defaultTaxRate" :min="0" :max="1" :step="0.01" :disabled="saving" />
          <div class="hint">{{ t("settings.general.hints.taxRate") }}</div>
        </NFormItem>

        <NFormItem :label="t('settings.general.fields.dateFormat')" path="dateFormat">
          <NSelect v-model:value="form.dateFormat" :options="dateFormatOptions" :disabled="saving" />
        </NFormItem>

        <NFormItem :label="t('settings.general.fields.timezone')" path="timezone">
          <NSelect v-model:value="form.timezone" :options="timezoneOptions" filterable :disabled="saving" />
        </NFormItem>

        <NFormItem :label="t('settings.general.fields.theme')">
          <NSelect :value="appStore.theme" :options="[
            { label: t('settings.general.options.theme.light'), value: 'light' },
            { label: t('settings.general.options.theme.dark'), value: 'dark' },
          ]" :disabled="saving" @update:value="handleThemeChange" />
        </NFormItem>

        <NFormItem :label="t('settings.general.fields.language')">
          <NSelect v-model:value="form.language" :options="[
            { label: t('settings.general.options.language.enUS'), value: 'en-US' },
            { label: t('settings.general.options.language.zhCN'), value: 'zh-CN' },
          ]" :disabled="saving" @update:value="(value) => appStore.setLocale(value as 'en-US' | 'zh-CN')" />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ t("common.save") }}
          </NButton>
        </NSpace>
      </NForm>
    </NCard>

    <NCard style="margin-top: 16px" :title="t('settings.general.modules.title')" :bordered="false">
      <div v-if="toggleableModules.length === 0" class="hint">
        {{ t("settings.general.modules.hints.none") }}
      </div>
      <NForm v-else label-placement="left" label-width="200">
        <NFormItem v-for="m in toggleableModules" :key="m.id" :label="t(m.labelKey)">
          <NSwitch :value="isModuleEnabled(m.id)" @update:value="(v) => setModuleEnabled(m.id, v)" />
        </NFormItem>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.general-settings {
  max-width: 800px;
}

.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style>
