package dto

// RegisterInput represents the input for user registration.
type RegisterInput struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatarUrl"`
}

// LoginInput represents the input for user login.
type LoginInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// UpdateUserInput represents the input for updating user profile.
type UpdateUserInput struct {
	ID           int    `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	AvatarURL    string `json:"avatarUrl"`
	SettingsJSON string `json:"settingsJson"`
}

// ChangePasswordInput represents the input for changing password.
type ChangePasswordInput struct {
	ID          int    `json:"id"`
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// UserOutput represents the user data returned from API (excludes password).
type UserOutput struct {
	ID           int    `json:"id"`
	UUID         string `json:"uuid"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	AvatarURL    string `json:"avatarUrl"`
	CreatedAt    string `json:"createdAt"`
	LastLogin    string `json:"lastLogin"`
	SettingsJSON string `json:"settingsJson"`
}

// UserListItem represents a minimal user info for selection screen.
type UserListItem struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatarUrl"`
}
