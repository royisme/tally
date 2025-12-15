<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NButton,
  useMessage,
  NTabs,
  NTabPane,
  NSwitch,
  NSelect,
  NAlert,
  NGrid,
  NFormItemGi,
} from "naive-ui";
import { useSettingsStore } from "@/stores/settings";
import type { UserSettings } from "@/types";
import { useI18n } from "vue-i18n";

const settingsStore = useSettingsStore();
const message = useMessage();
const { t } = useI18n();

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

const expectedIncomeOptions = computed(() => [
  { label: t("settings.invoice.hst.incomeOptions.under30k"), value: "under30k" },
  { label: t("settings.invoice.hst.incomeOptions.over30k"), value: "over30k" },
  { label: t("settings.invoice.hst.incomeOptions.unsure"), value: "unsure" },
]);

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    const settings = settingsStore.settings;
    form.value = {
      ...form.value,
      invoiceTerms: settings.invoiceTerms,
      defaultMessageTemplate: settings.defaultMessageTemplate,
      senderName: settings.senderName,
      senderCompany: settings.senderCompany,
      senderAddress: settings.senderAddress,
      senderPhone: settings.senderPhone,
      senderEmail: settings.senderEmail,
      senderPostalCode: settings.senderPostalCode,
      hstRegistered: settings.hstRegistered,
      hstNumber: settings.hstNumber,
      taxEnabled: settings.taxEnabled,
      expectedIncome: settings.expectedIncome,
    };
  } else {
    form.value = {
      ...form.value,
      invoiceTerms: t("settings.invoice.defaults.invoiceTerms"),
      defaultMessageTemplate: t("settings.invoice.defaults.defaultMessageTemplate"),
    };
  }
});

async function handleSave() {
  saving.value = true;
  try {
    const currentSettings = settingsStore.settings;
    if (!currentSettings) {
      message.error(t("settings.invoice.messages.loadError"));
      return;
    }
    const updatedSettings = {
      ...currentSettings,
      invoiceTerms: form.value.invoiceTerms,
      defaultMessageTemplate: form.value.defaultMessageTemplate,
      senderName: form.value.senderName,
      senderCompany: form.value.senderCompany,
      senderAddress: form.value.senderAddress,
      senderPhone: form.value.senderPhone,
      senderEmail: form.value.senderEmail,
      senderPostalCode: form.value.senderPostalCode,
      hstRegistered: form.value.hstRegistered,
      hstNumber: form.value.hstNumber,
      taxEnabled: form.value.taxEnabled,
      expectedIncome: form.value.expectedIncome,
    };
    await settingsStore.saveSettings(updatedSettings);
    message.success(t("settings.invoice.messages.saved"));
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.invoice.messages.saveError"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="invoice-settings">
    <NTabs type="line" animated>
      <!-- Defaults Tab -->
      <NTabPane name="defaults" :tab="t('settings.invoice.defaultsCardTitle')">
        <NForm ref="formRef" label-placement="top">
          <NFormItem :label="t('settings.invoice.fields.invoiceTerms')">
            <NInput type="textarea" v-model:value="form.invoiceTerms" :autosize="{ minRows: 2, maxRows: 4 }"
              :disabled="saving" />
          </NFormItem>

          <NFormItem :label="t('settings.invoice.fields.defaultMessageTemplate')">
            <NInput type="textarea" v-model:value="form.defaultMessageTemplate" :autosize="{ minRows: 3, maxRows: 6 }"
              :disabled="saving" />
          </NFormItem>

          <NSpace justify="end" style="margin-top: 24px">
            <NButton type="primary" :loading="saving" @click="handleSave">
              {{ t("common.save") }}
            </NButton>
          </NSpace>
        </NForm>
      </NTabPane>

      <!-- Sender Info Tab -->
      <NTabPane name="sender" :tab="t('settings.invoice.headerCardTitle')">
        <NForm label-placement="top">
          <NGrid :cols="2" :x-gap="24" :y-gap="0">
            <NFormItemGi :label="t('settings.invoice.fields.senderName')">
              <NInput v-model:value="form.senderName" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.invoice.fields.senderCompany')">
              <NInput v-model:value="form.senderCompany" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.invoice.fields.senderAddress')">
              <NInput v-model:value="form.senderAddress" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.invoice.fields.senderPostalCode')">
              <NInput v-model:value="form.senderPostalCode" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.invoice.fields.senderPhone')">
              <NInput v-model:value="form.senderPhone" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.invoice.fields.senderEmail')">
              <NInput v-model:value="form.senderEmail" :disabled="saving" />
            </NFormItemGi>
          </NGrid>

          <NSpace justify="end" style="margin-top: 24px">
            <NButton type="primary" :loading="saving" @click="handleSave">
              {{ t("common.save") }}
            </NButton>
          </NSpace>
        </NForm>
      </NTabPane>

      <!-- Tax / HST Tab -->
      <NTabPane name="tax" :tab="t('settings.invoice.hst.cardTitle')">
        <NForm label-placement="top">
          <NAlert v-if="!form.hstRegistered" type="info" :show-icon="true" style="margin-bottom: 16px">
            {{ t('settings.invoice.hst.info.notRegistered') }}
          </NAlert>
          <NAlert v-else type="warning" :show-icon="true" style="margin-bottom: 16px">
            {{ t('settings.invoice.hst.info.registered') }}
          </NAlert>

          <NFormItem :label="t('settings.invoice.hst.registered')">
            <NSwitch v-model:value="form.hstRegistered" :disabled="saving" />
            <span style="margin-left: 12px; color: #666; font-size: 13px;">
              {{ t('settings.invoice.hst.registeredHint') }}
            </span>
          </NFormItem>

          <NFormItem v-if="form.hstRegistered" :label="t('settings.invoice.hst.number')">
            <NInput v-model:value="form.hstNumber" :placeholder="t('settings.invoice.hst.numberPlaceholder')"
              :disabled="saving" />
          </NFormItem>

          <NFormItem :label="t('settings.invoice.hst.expectedIncome')">
            <NSelect v-model:value="form.expectedIncome" :options="expectedIncomeOptions"
              :placeholder="t('settings.invoice.hst.expectedIncomePlaceholder')" clearable :disabled="saving" />
          </NFormItem>

          <NFormItem :label="t('settings.invoice.hst.taxEnabled')">
            <NSwitch v-model:value="form.taxEnabled" :disabled="saving || !form.hstRegistered" />
            <span style="margin-left: 12px; color: #666; font-size: 13px;">
              {{ t('settings.invoice.hst.taxEnabledHint') }}
            </span>
          </NFormItem>

          <NSpace justify="end" style="margin-top: 24px">
            <NButton type="primary" :loading="saving" @click="handleSave">
              {{ t("common.save") }}
            </NButton>
          </NSpace>
        </NForm>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped>
.invoice-settings {
  width: 100%;
}
</style>
