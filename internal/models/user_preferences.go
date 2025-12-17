package models

import "time"

// UserPreferences represents application-level preferences.
type UserPreferences struct {
	UserID            int             `json:"userId"`
	Currency          string          `json:"currency"`
	Language          string          `json:"language"`
	Theme             string          `json:"theme"`
	Timezone          string          `json:"timezone"`
	DateFormat        string          `json:"dateFormat"`
	ModuleOverrides   map[string]bool `json:"moduleOverrides,omitempty"`
	UpdatedAt         time.Time       `json:"updatedAt"`
}
