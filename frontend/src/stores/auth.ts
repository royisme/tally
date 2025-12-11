import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  UserOutput,
  UserListItem,
  RegisterInput,
  LoginInput,
} from "@/types";

// TODO: When Wails bindings are generated, use real AuthService
// const isWailsRuntime = typeof window !== "undefined" && "go" in window;

// Mock auth service for development
const mockAuthService = {
  register: async (input: RegisterInput): Promise<UserOutput> => {
    const mockUser: UserOutput = {
      id: 1,
      uuid: "mock-uuid-" + Date.now(),
      username: input.username,
      email: input.email || "",
      avatarUrl:
        input.avatarUrl ||
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${input.username}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settingsJson: "{}",
    };
    // Simulate storage
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    users.push({ ...mockUser, passwordHash: input.password }); // Store password for mock login
    localStorage.setItem("mockUsers", JSON.stringify(users));
    return mockUser;
  },
  login: async (input: LoginInput): Promise<UserOutput> => {
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const user = users.find(
      (u: { username: string; passwordHash: string }) =>
        u.username === input.username && u.passwordHash === input.password
    );
    if (!user) {
      throw new Error("Invalid credentials");
    }
    return user as UserOutput;
  },
  getAllUsers: async (): Promise<UserListItem[]> => {
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    return users.map((u: UserOutput) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
    }));
  },
  hasUsers: async (): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    return users.length > 0;
  },
  getUserById: async (id: number): Promise<UserOutput> => {
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const user = users.find((u: UserOutput) => u.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
};

// Auth service that will be used (mock or Wails)
// When Wails bindings are generated, this will use real backend
const authService = mockAuthService;

export const useAuthStore = defineStore("auth", () => {
  // State
  const currentUser = ref<UserOutput | null>(null);
  const usersList = ref<UserListItem[]>([]);
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
      // Check if users exist
      const hasExistingUsers = await authService.hasUsers();
      if (hasExistingUsers) {
        usersList.value = await authService.getAllUsers();
      }

      // Try to restore session from localStorage
      const savedUserId = localStorage.getItem("currentUserId");
      if (savedUserId && hasExistingUsers) {
        try {
          const user = await authService.getUserById(parseInt(savedUserId, 10));
          currentUser.value = user;
        } catch {
          // Session invalid, clear it
          localStorage.removeItem("currentUserId");
        }
      }

      isInitialized.value = true;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to initialize auth";
    } finally {
      isLoading.value = false;
    }
  }

  async function register(input: RegisterInput) {
    isLoading.value = true;
    error.value = null;
    try {
      const user = await authService.register(input);
      currentUser.value = user;
      localStorage.setItem("currentUserId", String(user.id));
      usersList.value = await authService.getAllUsers();
      return user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Registration failed";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(input: LoginInput) {
    isLoading.value = true;
    error.value = null;
    try {
      const user = await authService.login(input);
      currentUser.value = user;
      localStorage.setItem("currentUserId", String(user.id));
      return user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Login failed";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAllUsers() {
    try {
      usersList.value = await authService.getAllUsers();
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem("currentUserId");
  }

  function switchUser() {
    // Clear current session but keep users list
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
    switchUser,
    fetchAllUsers,
  };
});
