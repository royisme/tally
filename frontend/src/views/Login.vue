<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Plus, Lock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import type { UserListItem } from '@/types'
import { loginSchema } from '@/schemas/auth'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const selectedUser = ref<UserListItem | null>(null)
const isLoggingIn = ref(false)
const loginError = ref<string | null>(null)

// Form validation schema - only validate password here
const formSchema = toTypedSchema(z.object({
  password: loginSchema.shape.password
}))

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (values) => {
  if (!selectedUser.value) return

  isLoggingIn.value = true
  loginError.value = null

  try {
    await authStore.login({
      username: selectedUser.value.username,
      password: values.password,
    })
    router.push('/dashboard')
  } catch (e) {
    loginError.value = t('auth.invalidPassword')
  } finally {
    isLoggingIn.value = false
  }
})

onMounted(() => {
  if (authStore.usersList.length === 0) {
    router.replace('/register')
  }
})

function selectUser(user: UserListItem) {
  selectedUser.value = user
  loginError.value = null
}

function cancelSelection() {
  selectedUser.value = null
  loginError.value = null
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="h-full flex items-center justify-center p-4 min-h-0 overflow-auto">
    <div class="max-w-[520px] w-full p-8 glass-card">
      <h1 class="font-(family-name:--font-heading) text-3xl font-bold mb-2 text-center text-foreground">{{
        t('auth.welcome') }}</h1>
      <p class="text-muted-foreground text-center mb-8">{{ t('auth.selectUser') }}</p>

      <!-- User Selection Grid -->
      <Transition name="fade" mode="out-in">
        <div v-if="!selectedUser"
          class="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-6 justify-items-center">
          <div v-for="user in authStore.usersList" :key="user.id"
            class="flex flex-col items-center gap-3 p-5 rounded-lg cursor-pointer transition-all duration-200 w-[120px] hover:bg-black/5 hover:-translate-y-1 dark:hover:bg-white/10"
            @click="selectUser(user)">
            <Avatar class="h-20 w-20">
              <AvatarImage :src="user.avatarUrl" :alt="user.username" />
              <AvatarFallback>
                <img :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`" :alt="t('auth.avatarFallbackAlt')" />
              </AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium text-foreground">{{ user.username }}</span>
          </div>

          <!-- Add New User Card -->
          <div
            class="flex flex-col items-center gap-3 p-5 rounded-lg cursor-pointer transition-all duration-200 w-[120px] border-2 border-dashed border-border hover:border-primary group"
            @click="goToRegister">
            <div
              class="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus class="h-10 w-10" />
            </div>
            <span class="text-sm font-medium text-foreground">{{ t('auth.addUser') }}</span>
          </div>
        </div>

        <!-- Password Entry -->
        <div v-else class="flex flex-col items-center gap-5">
          <Avatar class="h-[100px] w-[100px]">
            <AvatarImage :src="selectedUser.avatarUrl" :alt="selectedUser.username" />
            <AvatarFallback>
              <img :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedUser.username}`" :alt="t('auth.avatarFallbackAlt')" />
            </AvatarFallback>
          </Avatar>
          <h2 class="font-(family-name:--font-heading) text-2xl font-semibold m-0 text-foreground">{{
            selectedUser.username }}</h2>

          <div class="w-full max-w-[300px]">
            <form @submit="onSubmit" class="space-y-4">
              <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                  <FormControl>
                    <div class="relative items-center">
                      <Input type="password" :placeholder="t('auth.passwordPlaceholder')" v-bind="componentField" class="pl-10" />
                      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                        <Lock class="size-4 text-muted-foreground" />
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <p v-if="loginError" class="text-destructive text-center text-sm font-medium">{{ loginError }}</p>

              <div class="flex gap-3 mt-3">
                <Button type="submit" class="w-full" size="lg" :disabled="isLoggingIn">
                  {{ isLoggingIn ? t('auth.loggingIn') : t('auth.login') }}
                </Button>
                <Button type="button" variant="outline" size="lg" @click="cancelSelection">
                  {{ t('common.cancel') }}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
