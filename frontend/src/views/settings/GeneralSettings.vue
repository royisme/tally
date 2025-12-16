```vue
<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";

import { useSettingsStore } from "@/stores/settings";
import { useAppStore } from "@/stores/app";
import { allModules } from "@/modules/registry";
import type { ModuleID } from "@/modules/types";
import { generalSettingsSchema } from "@/schemas/settings";

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from "vue-sonner";
import { Label } from '@/components/ui/label'

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const { t } = useI18n();
const saving = ref(false);

const formSchema = toTypedSchema(generalSettingsSchema);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    currency: "USD",
    defaultTaxRate: 0,
    language: "en-US",
    theme: "light",
    dateFormat: "2006-01-02",
    timezone: "UTC",
  }
});

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

const themeOptions = computed(() => [
  { label: t("settings.general.options.theme.light"), value: "light" },
  { label: t("settings.general.options.theme.dark"), value: "dark" },
]);

const languageOptions = computed(() => [
  { label: t("settings.general.options.language.enUS"), value: "en-US" },
  { label: t("settings.general.options.language.zhCN"), value: "zh-CN" },
]);

const toggleableModules = computed<{ id: ModuleID; labelKey: string }[]>(() => {
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
    toast.error(t("settings.general.messages.loadError"));
    return;
  }
  const nextOverrides = { ...currentSettings.moduleOverrides, [moduleID]: enabled };

  try {
    await settingsStore.saveSettings({ ...currentSettings, moduleOverrides: nextOverrides });
    toast.success(t("settings.general.modules.messages.saved"));
    // Revert visual state if needed, though reactivity handles it
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t("settings.general.modules.messages.saveError"));
  }
}

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    const settings = settingsStore.settings;
    form.setValues({
      currency: settings.currency,
      defaultTaxRate: settings.defaultTaxRate,
      language: settings.language,
      theme: settings.theme,
      dateFormat: settings.dateFormat,
      timezone: settings.timezone,
    });
  }
});

const onSubmit = form.handleSubmit(async (values) => {
  saving.value = true;
  try {
    const currentSettings = settingsStore.settings;
    if (!currentSettings) {
      toast.error(t("settings.general.messages.loadError"));
      return;
    }
    const updatedSettings = {
      ...currentSettings,
      ...values,
    };
    await settingsStore.saveSettings(updatedSettings);
    toast.success(t("settings.general.messages.saved"));
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t("settings.general.messages.saveError"));
  } finally {
    saving.value = false;
  }
});

function handleThemeChange(value: any) {
  const theme = String(value);
  form.setFieldValue('theme', theme);
  if (appStore.theme !== theme) {
    appStore.setTheme(theme as 'light' | 'dark');
  }
}

function handleLanguageChange(value: any) {
  const lang = String(value);
  form.setFieldValue('language', lang);
  appStore.setLocale(lang as 'en-US' | 'zh-CN');
}
</script>

<template>
  <div class="general-settings space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.general.cardTitle') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Currency -->
            <FormField v-slot="{ componentField }" name="currency">
              <FormItem>
                <FormLabel>{{ t('settings.general.fields.currency') }}</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger :disabled="saving">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Tax Rate -->
            <FormField v-slot="{ componentField }" name="defaultTaxRate">
              <FormItem>
                <FormLabel>{{ t('settings.general.fields.defaultTaxRate') }}</FormLabel>
                <FormControl>
                  <Input type="number" v-bind="componentField" :min="0" :max="1" :step="0.01" :disabled="saving"
                    @input="(e: Event) => form.setFieldValue('defaultTaxRate', parseFloat((e.target as HTMLInputElement).value))" />
                </FormControl>
                <FormDescription>
                  {{ t("settings.general.hints.taxRate") }}
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Date Format -->
            <FormField v-slot="{ componentField }" name="dateFormat">
              <FormItem>
                <FormLabel>{{ t('settings.general.fields.dateFormat') }}</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger :disabled="saving">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="opt in dateFormatOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Timezone -->
            <FormField v-slot="{ componentField }" name="timezone">
              <FormItem>
                <FormLabel>{{ t('settings.general.fields.timezone') }}</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger :disabled="saving">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="opt in timezoneOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Theme -->
            <FormField v-slot="{ componentField }" name="theme">
              <FormItem>
                <FormLabel>{{ t('settings.general.fields.theme') }}</FormLabel>
                <Select v-bind="componentField" @update:model-value="handleThemeChange">
                  <FormControl>
                    <SelectTrigger :disabled="saving">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="opt in themeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Language -->
            <FormField v-slot="{ componentField }" name="language">
              <FormItem>
                <FormLabel>{{ t('settings.general.fields.language') }}</FormLabel>
                <Select v-bind="componentField" @update:model-value="handleLanguageChange">
                  <FormControl>
                    <SelectTrigger :disabled="saving">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="opt in languageOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

          </div>

          <div class="flex justify-end">
            <Button type="submit" :disabled="saving">
              <span v-if="saving">Saving...</span>
              <span v-else>{{ t("common.save") }}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Module Toggles -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t("settings.general.modules.title") }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="toggleableModules.length === 0" class="text-sm text-muted-foreground">
          {{ t("settings.general.modules.hints.none") }}
        </div>
        <div v-else class="space-y-4">
          <div v-for="m in toggleableModules" :key="m.id"
            class="flex items-center justify-between rounded-lg border p-4">
            <Label>{{ t(m.labelKey) }}</Label>
            <Switch :checked="isModuleEnabled(m.id)" @update:checked="(v) => setModuleEnabled(m.id, v)" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* No scoped styles needed */
</style>
```
