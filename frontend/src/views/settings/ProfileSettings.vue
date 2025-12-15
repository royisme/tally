<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NButton,
  useMessage,
  NCard,
  NDivider,
  NAvatar,
  NIcon,
  NTooltip,
} from "naive-ui";
import { ReloadOutlined, UploadOutlined } from "@vicons/antd";
import { useAuthStore } from "@/stores/auth";
import { dto } from "@/wailsjs/go/models";
import { useI18n } from "vue-i18n";

const authStore = useAuthStore();
const message = useMessage();
const { t } = useI18n();

// Account Settings Form
const fileInputRef = ref<HTMLInputElement | null>(null);
const accountForm = ref<dto.UpdateUserInput>({
  id: 0,
  username: "",
  email: "",
  avatarUrl: "",
  settingsJson: "",
});
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const accountSaving = ref(false);

onMounted(() => {
  // Load Account Settings
  if (authStore.currentUser) {
    accountForm.value = {
      id: authStore.currentUser.id,
      username: authStore.currentUser.username,
      email: authStore.currentUser.email,
      avatarUrl: authStore.currentUser.avatarUrl,
      settingsJson: authStore.currentUser.settingsJson,
    };
  }
});

function handleRandomAvatar() {
  const seed = Math.random().toString(36).substring(7);
  // Use Dicebear Avataaars
  accountForm.value.avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
}

function handleUploadAvatar() {
  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        accountForm.value.avatarUrl = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

async function handleUpdateProfile() {
  try {
    accountSaving.value = true;
    await authStore.updateProfile(accountForm.value);
    message.success(t("settings.profile.messages.saved"));
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.profile.messages.saveError"));
  } finally {
    accountSaving.value = false;
  }
}

async function handleChangePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error(t("settings.profile.validation.passwordMismatch"));
    return;
  }
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    message.error(t("settings.profile.validation.passwordRequired"));
    return;
  }

  try {
    accountSaving.value = true;
    const input = new dto.ChangePasswordInput({
      id: accountForm.value.id,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });

    await authStore.changePassword(input);
    message.success(t("settings.profile.messages.saved"));
    // Clear password fields
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.profile.messages.saveError"));
  } finally {
    accountSaving.value = false;
  }
}
</script>

<template>
  <div class="profile-settings">
    <NCard :bordered="false" :title="t('settings.profile.tabs.account')">
      <NForm ref="accountFormRef" label-placement="top">

        <div class="account-layout">
          <!-- Left Column: Avatar & Actions -->
          <div class="avatar-column">
            <div class="avatar-wrapper">
              <NAvatar round :size="120" :src="accountForm.avatarUrl" class="profile-avatar" />

              <NTooltip trigger="hover">
                <template #trigger>
                  <NButton circle secondary class="random-avatar-btn" size="small" @click="handleRandomAvatar">
                    <template #icon>
                      <NIcon>
                        <ReloadOutlined />
                      </NIcon>
                    </template>
                  </NButton>
                </template>
                {{ t("settings.profile.fields.randomizeAvatar") }}
              </NTooltip>
            </div>

            <NButton secondary @click="handleUploadAvatar" class="upload-btn">
              <template #icon>
                <NIcon>
                  <UploadOutlined />
                </NIcon>
              </template>
              {{ t("settings.profile.fields.uploadAvatar") || "Upload Photo" }}
            </NButton>

            <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="onFileChange" />
          </div>

          <!-- Right Column: Form Fields -->
          <div class="form-column">
            <NFormItem :label="t('settings.profile.fields.username')">
              <NInput v-model:value="accountForm.username" />
            </NFormItem>

            <NFormItem :label="t('settings.profile.fields.email')">
              <NInput v-model:value="accountForm.email" />
            </NFormItem>

            <NSpace justify="end" style="margin-top: 12px">
              <NButton type="primary" :loading="accountSaving" @click="handleUpdateProfile">
                {{ t("common.save") }}
              </NButton>
            </NSpace>
          </div>
        </div>

        <NDivider />

        <h3>{{ t("settings.profile.password.title") }}</h3>
        <NFormItem :label="t('settings.profile.password.current')">
          <NInput type="password" show-password-on="click" v-model:value="passwordForm.oldPassword" />
        </NFormItem>
        <NFormItem :label="t('settings.profile.password.new')">
          <NInput type="password" show-password-on="click" v-model:value="passwordForm.newPassword" />
        </NFormItem>
        <NFormItem :label="t('settings.profile.password.confirm')">
          <NInput type="password" show-password-on="click" v-model:value="passwordForm.confirmPassword" />
        </NFormItem>

        <NSpace justify="end">
          <NButton type="warning" :loading="accountSaving" @click="handleChangePassword">
            {{ t("settings.profile.password.changeButton") }}
          </NButton>
        </NSpace>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.profile-settings {
  width: 100%;
}

.account-layout {
  display: flex;
  gap: 60px;
  /* Increased gap for better separation */
  align-items: flex-start;
  margin-bottom: 24px;
}

.avatar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 160px;
  padding-top: 8px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.random-avatar-btn {
  position: absolute;
  bottom: 0px;
  right: 0px;
  background-color: var(--n-color);
  /* Match theme background or white */
  border: 1px solid var(--n-border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.form-column {
  flex-grow: 1;
  max-width: 480px;
  /* Restrict width of the form inputs */
}

@media (max-width: 600px) {
  .account-layout {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .form-column {
    width: 100%;
    max-width: 100%;
  }
}
</style>
