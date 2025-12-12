import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  Login,
  Register,
  GetAllUsers,
  GetUserByID,
  HasUsers,
} from "../wailsjs/go/services/AuthService";
import { dto } from "../wailsjs/go/models";

export const useAuthStore = defineStore("auth", () => {
  // State
  const currentUser = ref<dto.UserOutput | null>(null);
  const usersList = ref<dto.UserListItem[]>([]);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null);
  const userId = computed(() => currentUser.value?.id ?? 0);
  const username = computed(() => currentUser.value?.username ?? "");
  const avatarUrl = computed(() => currentUser.value?.avatarUrl ?? "");

  // Actions
  async function initialize() {
    isLoading.value = true;
    error.value = null;
    try {
      // Check if users exist and fetch them
      const hasExistingUsers = await HasUsers();
      if (hasExistingUsers) {
        usersList.value = await GetAllUsers();
      }

      // Try to restore session from localStorage
      const savedUserId = localStorage.getItem("currentUserId");
      if (savedUserId && hasExistingUsers) {
        try {
          const id = parseInt(savedUserId, 10);
          if (!isNaN(id)) {
            const user = await GetUserByID(id);
            currentUser.value = user;
          }
        } catch {
          // Session invalid, clear it
          localStorage.removeItem("currentUserId");
        }
      }

      isInitialized.value = true;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to initialize auth";
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(input: dto.RegisterInput) {
    isLoading.value = true;
    error.value = null;
    try {
      const user = await Register(input);
      currentUser.value = user;
      localStorage.setItem("currentUserId", String(user.id));
      usersList.value = await GetAllUsers(); // Refresh list including new user
      return user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Registration failed";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(input: dto.LoginInput) {
    isLoading.value = true;
    error.value = null;
    try {
      const user = await Login(input);
      currentUser.value = user;
      localStorage.setItem("currentUserId", String(user.id));
      return user;
    } catch (e) {
      // Clean up local state on failure just in case
      currentUser.value = null;
      error.value = e instanceof Error ? e.message : "Login failed";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAllUsers() {
    try {
      usersList.value = await GetAllUsers();
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem("currentUserId");
  }

  function clearError() {
    error.value = null;
  }

  function switchUser() {
    // Clear current session but keep users list (logic is same as logout basically)
    currentUser.value = null;
    localStorage.removeItem("currentUserId");
  }

  return {
    // State
    currentUser,
    usersList,
    isInitialized,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    userId,
    username,
    avatarUrl,
    // Actions
    initialize,
    register,
    login,
    logout,
    clearError,
    switchUser,
    fetchAllUsers,
  };
});
