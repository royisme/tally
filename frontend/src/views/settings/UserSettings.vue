<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NButton,
  useMessage,
} from "naive-ui";
import { useSettingsStore } from "@/stores/settings";
import type { UserSettings } from "@/types";

const store = useSettingsStore();
const message = useMessage();

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
  invoiceTerms: "Due upon receipt",
  defaultMessageTemplate: "Thank you for your business.",
});

const saving = ref(false);

const currencyOptions = [
  { label: "USD - US Dollar", value: "USD" },
  { label: "CAD - Canadian Dollar", value: "CAD" },
  { label: "CNY - Chinese Yuan", value: "CNY" },
  { label: "EUR - Euro", value: "EUR" },
];

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

const rules = {
  currency: { required: true, message: "Currency is required", trigger: "blur" },
  dateFormat: {
    required: true,
    message: "Date format is required",
    trigger: "blur",
  },
  timezone: { required: true, message: "Timezone is required", trigger: "blur" },
  senderEmail: {
    validator: (_: unknown, value: string) => {
      if (!value) return true;
      return value.includes("@");
    },
    message: "Invalid email format",
    trigger: ["blur", "input"],
  },
};

onMounted(async () => {
  await store.fetchSettings();
  if (store.settings) {
    form.value = { ...store.settings };
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
    await store.saveSettings(form.value);
    message.success("Saved settings");
  } catch (e) {
    message.error(e instanceof Error ? e.message : "Failed to save settings");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="user-settings">
    <h2 class="section-title">Settings</h2>
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-form-item label="Currency" path="currency">
        <n-select
          v-model:value="form.currency"
          :options="currencyOptions"
          :disabled="saving"
        />
      </n-form-item>

      <n-form-item label="Default Tax Rate" path="defaultTaxRate">
        <n-input-number
          v-model:value="form.defaultTaxRate"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="saving"
        />
        <div class="hint">Use decimal, e.g. 0.13 for 13%.</div>
      </n-form-item>

      <n-form-item label="Date Format" path="dateFormat">
        <n-select
          v-model:value="form.dateFormat"
          :options="dateFormatOptions"
          :disabled="saving"
        />
      </n-form-item>

      <n-form-item label="Timezone" path="timezone">
        <n-select
          v-model:value="form.timezone"
          :options="timezoneOptions"
          filterable
          :disabled="saving"
        />
      </n-form-item>

      <h3 class="sub-title">Invoice Header</h3>

      <n-form-item label="Sender Name">
        <n-input v-model:value="form.senderName" :disabled="saving" />
      </n-form-item>
      <n-form-item label="Sender Company">
        <n-input v-model:value="form.senderCompany" :disabled="saving" />
      </n-form-item>
      <n-form-item label="Sender Address">
        <n-input v-model:value="form.senderAddress" :disabled="saving" />
      </n-form-item>
      <n-form-item label="Sender Phone">
        <n-input v-model:value="form.senderPhone" :disabled="saving" />
      </n-form-item>
      <n-form-item label="Sender Email" path="senderEmail">
        <n-input v-model:value="form.senderEmail" :disabled="saving" />
      </n-form-item>
      <n-form-item label="Sender Postal Code">
        <n-input v-model:value="form.senderPostalCode" :disabled="saving" />
      </n-form-item>

      <h3 class="sub-title">Invoice Defaults</h3>

      <n-form-item label="Invoice Terms">
        <n-input
          type="textarea"
          v-model:value="form.invoiceTerms"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :disabled="saving"
        />
      </n-form-item>

      <n-form-item label="Default Message Template">
        <n-input
          type="textarea"
          v-model:value="form.defaultMessageTemplate"
          :autosize="{ minRows: 3, maxRows: 6 }"
          :disabled="saving"
        />
      </n-form-item>

      <n-space justify="end">
        <n-button type="primary" :loading="saving" @click="handleSave">
          Save
        </n-button>
      </n-space>
    </n-form>
  </div>
</template>

<style scoped>
.user-settings {
  padding: 16px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 12px;
}
.sub-title {
  margin: 12px 0 4px;
  font-size: 14px;
  font-weight: 600;
}
.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style>

