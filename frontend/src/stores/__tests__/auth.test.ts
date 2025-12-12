import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../auth";

// Mock Wails services
const mockLogin = vi.hoisted(() => vi.fn());
const mockRegister = vi.hoisted(() => vi.fn());
const mockGetAllUsers = vi.hoisted(() => vi.fn());
const mockGetUserByID = vi.hoisted(() => vi.fn());
const mockHasUsers = vi.hoisted(() => vi.fn());

vi.mock("../../wailsjs/go/services/AuthService", () => ({
  Login: mockLogin,
  Register: mockRegister,
  GetAllUsers: mockGetAllUsers,
  GetUserByID: mockGetUserByID,
  HasUsers: mockHasUsers,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it("login sets current user and persists userId", async () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      avatarUrl: "",
    };
    mockLogin.mockResolvedValue(mockUser);
    mockHasUsers.mockResolvedValue(true);
    mockGetAllUsers.mockResolvedValue([{ id: 1, username: "testuser" }]);

    const store = useAuthStore();
    await store.login({ username: "testuser", password: "password" });

    expect(mockLogin).toHaveBeenCalledWith({
      username: "testuser",
      password: "password",
    });
    expect(store.currentUser?.username).toBe("testuser");
    expect(store.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("currentUserId", "1");
  });

  it("register creates new user", async () => {
    const mockUser = {
      id: 2,
      username: "newuser",
      email: "new@example.com",
      avatarUrl: "",
    };
    mockRegister.mockResolvedValue(mockUser);
    mockHasUsers.mockResolvedValue(true);
    mockGetAllUsers.mockResolvedValue([{ id: 2, username: "newuser" }]);

    const store = useAuthStore();
    await store.register({
      username: "newuser",
      password: "password",
      email: "new@example.com",
    });

    expect(mockRegister).toHaveBeenCalledWith({
      username: "newuser",
      password: "password",
      email: "new@example.com",
    });
    expect(store.currentUser?.email).toBe("new@example.com");
    expect(store.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("currentUserId", "2");
  });

  it("logout clears user state and localStorage", async () => {
    const store = useAuthStore();
    store.currentUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      avatarUrl: "",
    };

    await store.logout();

    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("currentUserId");
  });

  it("handles login errors", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));
    mockHasUsers.mockResolvedValue(true);
    mockGetAllUsers.mockResolvedValue([]);

    const store = useAuthStore();
    try {
      await store.login({ username: "wronguser", password: "wrongpass" });
    } catch {
      // Expected to throw
    }

    expect(mockLogin).toHaveBeenCalledWith({
      username: "wronguser",
      password: "wrongpass",
    });
    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it("sets and clears error state", async () => {
    const store = useAuthStore();
    store.error = "Test error";
    expect(store.error).toBe("Test error");

    store.clearError();
    expect(store.error).toBeNull();
  });

  it("computes userId from currentUser", async () => {
    const store = useAuthStore();
    expect(store.userId).toBe(0);

    store.currentUser = {
      id: 42,
      username: "testuser",
      email: "test@example.com",
      avatarUrl: "",
    };
    expect(store.userId).toBe(42);
  });

  it("computes username from currentUser", async () => {
    const store = useAuthStore();
    expect(store.username).toBe("");

    store.currentUser = {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      avatarUrl: "",
    };
    expect(store.username).toBe("johndoe");
  });

  it("computes avatarUrl from currentUser", async () => {
    const store = useAuthStore();
    expect(store.avatarUrl).toBe("");

    store.currentUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
    };
    expect(store.avatarUrl).toBe("https://example.com/avatar.jpg");
  });
});
