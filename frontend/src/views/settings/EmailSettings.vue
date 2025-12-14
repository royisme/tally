<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  NForm,
  NInput,
  NSelect,
  NInputNumber,
  NSpace,
  NButton,
  useMessage,
  NCard,
  NSwitch,
  NGrid,
  NFormItemGi,
  NAlert,
} from "naive-ui";
import { useInvoiceEmailSettingsStore } from "@/stores/invoiceEmailSettings";
import type { InvoiceEmailSettings } from "@/types";
import { useI18n } from "vue-i18n";

const store = useInvoiceEmailSettingsStore();
const message = useMessage();
const { t } = useI18n();

const form = ref<InvoiceEmailSettings>({
  provider: "mailto",
  subjectTemplate: t("settings.email.defaults.subjectTemplate"),
  bodyTemplate: t("settings.email.defaults.bodyTemplate"),
  signature: "",
});

const saving = ref(false);

onMounted(async () => {
  await store.fetchSettings();
  if (store.settings) {
    form.value = { ...store.settings };
  }
});

const formRef = ref<InstanceType<typeof NForm> | null>(null);

const rules = {
  from: {
    required: true,
    validator: (_: any, value: string) => {
      if (!value) return new Error(t("settings.email.validation.required"));
      // Matches "Name <email@domain.com>" or "email@domain.com"
      const emailRegex = /^([^<]+<[^>]+>|[^@\s]+@[^@\s]+\.[^@\s]+)$/;
      if (!emailRegex.test(value)) {
        return new Error(t("settings.email.validation.invalidFormat"));
      }
      return true;
    },
    trigger: ["blur", "input"],
  },
};

const providerOptions = computed(() => [
  { label: t("settings.email.options.provider.mailto"), value: "mailto" },
  { label: t("settings.email.options.provider.resend"), value: "resend" },
  { label: t("settings.email.options.provider.smtp"), value: "smtp" },
]);

async function handleSave() {
  try {
    await formRef.value?.validate();
    saving.value = true;
    await store.saveSettings(form.value);
    message.success(t("settings.email.messages.saved"));
  } catch (e) {
    if (Array.isArray(e)) {
      // Validation errors
      message.error(t("settings.email.validation.fixErrors"));
    } else {
      message.error(
        e instanceof Error ? e.message : t("settings.email.messages.saveError")
      );
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="email-settings">
    <NCard :title="t('settings.email.providerCardTitle')" :bordered="false">
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NGrid :x-gap="12" :y-gap="12" :cols="2">
          <!-- Provider Row -->
          <NFormItemGi :span="form.provider === 'resend' ? 1 : 2" :label="t('settings.email.fields.provider')"
            path="provider">
            <NSelect v-model:value="form.provider" :options="providerOptions" :disabled="saving" />
          </NFormItemGi>

          <NFormItemGi :span="1" v-if="form.provider === 'resend'" :label="t('settings.email.fields.resendApiKey')">
            <NInput type="password" show-password-on="click" v-model:value="form.resendApiKey" :disabled="saving" />
          </NFormItemGi>

          <!-- Resend Tip -->
          <NFormItemGi :span="2" v-if="form.provider === 'resend'">
            <NAlert type="info" show-icon :title="t('settings.email.resendCardTitle')" size="small">
              {{ t("settings.email.resendDomainTip") }}
            </NAlert>
          </NFormItemGi>

          <!-- SMTP Settings -->
          <template v-if="form.provider === 'smtp'">
            <NFormItemGi :label="t('settings.email.fields.smtpHost')">
              <NInput v-model:value="form.smtpHost" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.email.fields.smtpPort')">
              <NInputNumber v-model:value="form.smtpPort" :disabled="saving" style="width: 100%" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.email.fields.smtpUsername')">
              <NInput v-model:value="form.smtpUsername" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :label="t('settings.email.fields.smtpPassword')">
              <NInput type="password" show-password-on="click" v-model:value="form.smtpPassword" :disabled="saving" />
            </NFormItemGi>
            <NFormItemGi :span="2" :label="t('settings.email.fields.smtpUseTLS')">
              <NSwitch v-model:value="form.smtpUseTls" :disabled="saving" />
            </NFormItemGi>
          </template>

          <!-- Common Fields -->
          <NFormItemGi :label="t('settings.email.fields.from')" path="from">
            <NInput v-model:value="form.from" :disabled="saving" placeholder="Name <email@example.com>" />
          </NFormItemGi>

          <NFormItemGi :label="t('settings.email.fields.replyTo')" path="replyTo">
            <NInput v-model:value="form.replyTo" :disabled="saving" />
          </NFormItemGi>

          <!-- Template Settings -->
          <NFormItemGi :label="t('settings.email.fields.subjectTemplate')" path="subjectTemplate">
            <NInput v-model:value="form.subjectTemplate" :disabled="saving" />
          </NFormItemGi>

          <NFormItemGi :label="t('settings.email.fields.signature')" path="signature">
            <NInput type="textarea" v-model:value="form.signature" :autosize="{ minRows: 1, maxRows: 3 }"
              :disabled="saving" />
          </NFormItemGi>

          <NFormItemGi :span="2" :label="t('settings.email.fields.bodyTemplate')" path="bodyTemplate">
            <NInput type="textarea" v-model:value="form.bodyTemplate" :autosize="{ minRows: 4, maxRows: 8 }"
              :disabled="saving" />
          </NFormItemGi>
        </NGrid>

        <NSpace justify="end" style="margin-top: 0">
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ t("common.save") }}
          </NButton>
        </NSpace>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.email-settings {
  /* max-width removed for full width responsiveness */
}
</style>
