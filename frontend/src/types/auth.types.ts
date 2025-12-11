// User-related types for authentication and authorization

/** User output returned from API (excludes sensitive data) */
export interface UserOutput {
  id: number;
  uuid: string;
  username: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  lastLogin: string;
  settingsJson: string;
}

/** Minimal user info for selection screen */
export interface UserListItem {
  id: number;
  username: string;
  avatarUrl: string;
}

/** Input for user registration */
export interface RegisterInput {
  username: string;
  password: string;
  email?: string;
  avatarUrl?: string;
}

/** Input for user login */
export interface LoginInput {
  username: string;
  password: string;
}

/** Input for updating user profile */
export interface UpdateUserInput {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  settingsJson?: string;
}

/** User settings stored as JSON */
export interface UserSettings {
  currency: string;
  defaultTaxRate: number;
  language: string;
  theme: string;
}
