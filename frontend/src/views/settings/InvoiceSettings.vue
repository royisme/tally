<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import { AlertCircle, Info } from "lucide-vue-next";

import { useInvoiceSettingsStore } from "@/stores/invoiceSettings";
import { useUserTaxSettingsStore } from "@/stores/userTaxSettings";
import { invoiceSettingsSchema } from "@/schemas/settings";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dto } from "@/wailsjs/go/models";

const invoiceSettingsStore = useInvoiceSettingsStore();
const taxSettingsStore = useUserTaxSettingsStore();
const { t } = useI18n();
const saving = ref(false);

const formSchema = toTypedSchema(invoiceSettingsSchema);

const initialValues = computed(() => {
  const inv = invoiceSettingsStore.settings;
  const tax = taxSettingsStore.settings;
  
  if (inv && tax) {
    return {
      // Invoice Settings
      invoiceTerms: inv.defaultTerms,
      defaultMessageTemplate: inv.defaultMessageTemplate,
      senderName: inv.senderName,
      senderCompany: inv.senderCompany,
      senderAddress: inv.senderAddress,
      senderPhone: inv.senderPhone,
      senderEmail: inv.senderEmail,
      senderPostalCode: inv.senderPostalCode,
      
      // Tax Settings
      hstRegistered: tax.hstRegistered,
      hstNumber: tax.hstNumber,
      taxEnabled: tax.taxEnabled,
      expectedIncome: tax.expectedIncome,
    };
  }
  return {
    invoiceTerms: t("settings.invoice.defaults.invoiceTerms"),
    defaultMessageTemplate: t("settings.invoice.defaults.defaultMessageTemplate"),
    hstRegistered: false,
    taxEnabled: false,
  };
});

const expectedIncomeOptions = computed(() => [
  { label: t("settings.invoice.hst.incomeOptions.under30k"), value: "under30k" },
  { label: t("settings.invoice.hst.incomeOptions.over30k"), value: "over30k" },
  { label: t("settings.invoice.hst.incomeOptions.unsure"), value: "unsure" },
]);

// Unique key to force form re-render when settings change
const formKey = computed(() => {
  if (!invoiceSettingsStore.settings || !taxSettingsStore.settings) return 'loading';
  // Use a combination of values to create a unique key
  const i = invoiceSettingsStore.settings;
  const t = taxSettingsStore.settings;
  return `loaded-${i.defaultTerms}-${i.senderName}-${t.hstRegistered}`;
});

onMounted(async () => {
  await Promise.all([
    invoiceSettingsStore.fetchSettings(),
    taxSettingsStore.fetchSettings(),
  ]);
});

async function onSubmit(formValues: unknown) {
  const values = formValues as any;
  saving.value = true;
  try {
    const currentInvoiceSettings = invoiceSettingsStore.settings;
    const currentTaxSettings = taxSettingsStore.settings;
    
    if (!currentInvoiceSettings || !currentTaxSettings) {
      toast.error(t("settings.invoice.messages.loadError"));
      return;
    }

    // Split values and update separately
    // Invoice Settings Update
    const updatedInvoiceSettings = new dto.UserInvoiceSettings({
      ...currentInvoiceSettings,
      defaultTerms: values.invoiceTerms,
      defaultMessageTemplate: values.defaultMessageTemplate,
      senderName: values.senderName,
      senderCompany: values.senderCompany,
      senderAddress: values.senderAddress,
      senderPhone: values.senderPhone,
      senderEmail: values.senderEmail,
      senderPostalCode: values.senderPostalCode,
    });

    // Tax Settings Update
    const updatedTaxSettings = new dto.UserTaxSettings({
      ...currentTaxSettings,
      hstRegistered: values.hstRegistered,
      hstNumber: values.hstNumber,
      taxEnabled: values.taxEnabled,
      expectedIncome: values.expectedIncome,
    });

    await Promise.all([
      invoiceSettingsStore.saveSettings(updatedInvoiceSettings),
      taxSettingsStore.saveSettings(updatedTaxSettings)
    ]);

    toast.success(t("settings.invoice.messages.saved"));
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t("settings.invoice.messages.saveError"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="invoice-settings w-full">
    <Form :validation-schema="formSchema" :initial-values="initialValues" @submit="onSubmit" class="space-y-6"
      :key="formKey" v-slot="{ values }">
      <Tabs default-value="defaults" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="defaults">{{ t('settings.invoice.defaultsCardTitle') }}</TabsTrigger>
          <TabsTrigger value="sender">{{ t('settings.invoice.headerCardTitle') }}</TabsTrigger>
          <TabsTrigger value="tax">{{ t('settings.invoice.hst.cardTitle') }}</TabsTrigger>
        </TabsList>

        <!-- Defaults Tab -->
        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle>{{ t('settings.invoice.defaultsCardTitle') }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <FormField v-slot="{ componentField }" name="invoiceTerms">
                <FormItem>
                  <FormLabel>{{ t('settings.invoice.fields.invoiceTerms') }}</FormLabel>
                  <FormControl>
                    <Textarea v-bind="componentField" :rows="3" :disabled="saving" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="defaultMessageTemplate">
                <FormItem>
                  <FormLabel>{{ t('settings.invoice.fields.defaultMessageTemplate') }}</FormLabel>
                  <FormControl>
                    <Textarea v-bind="componentField" :rows="4" :disabled="saving" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Sender Info Tab -->
        <TabsContent value="sender">
          <Card>
            <CardHeader>
              <CardTitle>{{ t('settings.invoice.headerCardTitle') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField v-slot="{ componentField }" name="senderName">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.fields.senderName') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="senderCompany">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.fields.senderCompany') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="senderAddress">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.fields.senderAddress') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="senderPostalCode">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.fields.senderPostalCode') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="senderPhone">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.fields.senderPhone') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="senderEmail">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.fields.senderEmail') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Tax / HST Tab -->
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>{{ t('settings.invoice.hst.cardTitle') }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
              <Alert v-if="!values.hstRegistered" variant="default"
                class="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                <Info class="h-4 w-4" />
                <AlertTitle class="ml-2">{{ t("settings.invoice.hst.alertTitles.notRegistered") }}</AlertTitle>
                <AlertDescription class="ml-2">
                  {{ t('settings.invoice.hst.info.notRegistered') }}
                </AlertDescription>
              </Alert>
              <Alert v-else variant="default"
                class="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                <AlertCircle class="h-4 w-4" />
                <AlertTitle class="ml-2">{{ t("settings.invoice.hst.alertTitles.registered") }}</AlertTitle>
                <AlertDescription class="ml-2">
                  {{ t('settings.invoice.hst.info.registered') }}
                </AlertDescription>
              </Alert>

              <FormField v-slot="{ value, handleChange }" name="hstRegistered">
                <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div class="space-y-0.5">
                    <FormLabel class="text-base">{{ t('settings.invoice.hst.registered') }}</FormLabel>
                    <FormDescription>
                      {{ t('settings.invoice.hst.registeredHint') }}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch :checked="value" @update:checked="handleChange" :disabled="saving" />
                  </FormControl>
                </FormItem>
              </FormField>

              <div v-if="values.hstRegistered" class="space-y-4 border-l-2 pl-4 ml-2">
                <FormField v-slot="{ componentField }" name="hstNumber">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.hst.number') }}</FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" :placeholder="t('settings.invoice.hst.numberPlaceholder')"
                        :disabled="saving" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="expectedIncome">
                  <FormItem>
                    <FormLabel>{{ t('settings.invoice.hst.expectedIncome') }}</FormLabel>
                    <Select v-bind="componentField">
                      <FormControl>
                        <SelectTrigger :disabled="saving">
                          <SelectValue :placeholder="t('settings.invoice.hst.expectedIncomePlaceholder')" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem v-for="opt in expectedIncomeOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ value, handleChange }" name="taxEnabled">
                  <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div class="space-y-0.5">
                      <FormLabel class="text-base">{{ t('settings.invoice.hst.taxEnabled') }}</FormLabel>
                      <FormDescription>
                        {{ t('settings.invoice.hst.taxEnabledHint') }}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch :checked="value" @update:checked="handleChange"
                        :disabled="saving || !values.hstRegistered" />
                    </FormControl>
                  </FormItem>
                </FormField>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div class="flex justify-end pt-4">
        <Button type="submit" :disabled="saving">
          <span v-if="saving">{{ t("common.saving") }}</span>
          <span v-else>{{ t("common.save") }}</span>
        </Button>
      </div>
    </Form>
  </div>
</template>

<style scoped>
/* No scoped styles needed */
</style>
