package dto

// UserPreferences represents app-level settings exposed to frontend.
type UserPreferences struct {
	UserID          int             `json:"userId"`
	Currency        string          `json:"currency"`
	Language        string          `json:"language"`
	Theme           string          `json:"theme"`
	Timezone        string          `json:"timezone"`
	DateFormat      string          `json:"dateFormat"`
	ModuleOverrides map[string]bool `json:"moduleOverrides,omitempty"`
}
