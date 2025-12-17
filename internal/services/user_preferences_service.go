package services

import (
	"database/sql"
	"encoding/json"
	"log"
	"tally/internal/dto"
	"tally/internal/mapper"
	"tally/internal/models"
)

// UserPreferencesService manages user-level UI preferences.
type UserPreferencesService struct {
	db *sql.DB
}

// NewUserPreferencesService creates a new UserPreferencesService.
func NewUserPreferencesService(db *sql.DB) *UserPreferencesService {
	return &UserPreferencesService{db: db}
}

// Get retrieves user preferences from DB.
func (s *UserPreferencesService) Get(userID int) (dto.UserPreferences, error) {
	query := `SELECT 
		user_id, currency, language, theme, timezone, date_format, module_overrides_json
		FROM user_preferences WHERE user_id = ?`

	var prefs models.UserPreferences
	var moduleOverridesRaw string

	err := s.db.QueryRow(query, userID).Scan(
		&prefs.UserID,
		&prefs.Currency,
		&prefs.Language,
		&prefs.Theme,
		&prefs.Timezone,
		&prefs.DateFormat,
		&moduleOverridesRaw,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// Return defaults if not found (should usually exist due to migration/creation hook)
			return s.getDefaults(userID), nil
		}
		log.Printf("Error fetching user preferences for user %d: %v", userID, err)
		return s.getDefaults(userID), err
	}

	if moduleOverridesRaw != "" {
		if err := json.Unmarshal([]byte(moduleOverridesRaw), &prefs.ModuleOverrides); err != nil {
			log.Printf("Error unmarshaling module overrides: %v", err)
		}
	}

	return mapper.ToUserPreferencesDTO(prefs), nil
}

// Update updates user preferences in DB.
func (s *UserPreferencesService) Update(userID int, input dto.UserPreferences) (dto.UserPreferences, error) {
	// 1. Normalize input if needed
	if input.Currency == "" {
		input.Currency = "USD"
	}
	if input.Language == "" {
		input.Language = "en-US"
	}
	if input.Theme == "" {
		input.Theme = "light"
	}
	if input.Timezone == "" {
		input.Timezone = "UTC"
	}
	if input.DateFormat == "" {
		input.DateFormat = "2006-01-02"
	}

	// 2. Marshal overrides
	overridesJSON, err := json.Marshal(input.ModuleOverrides)
	if err != nil {
		overridesJSON = []byte("{}")
	}

	// 3. Upsert
	query := `INSERT INTO user_preferences (user_id, currency, language, theme, timezone, date_format, module_overrides_json, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
		ON CONFLICT(user_id) DO UPDATE SET
		currency=excluded.currency,
		language=excluded.language,
		theme=excluded.theme,
		timezone=excluded.timezone,
		date_format=excluded.date_format,
		module_overrides_json=excluded.module_overrides_json,
		updated_at=datetime('now')`

	_, err = s.db.Exec(query, userID, input.Currency, input.Language, input.Theme, input.Timezone, input.DateFormat, string(overridesJSON))
	if err != nil {
		log.Printf("Error updating user preferences for user %d: %v", userID, err)
		return dto.UserPreferences{}, err
	}

	input.UserID = userID
	return input, nil
}

func (s *UserPreferencesService) getDefaults(userID int) dto.UserPreferences {
	return dto.UserPreferences{
		UserID:     userID,
		Currency:   "USD",
		Language:   "en-US",
		Theme:      "light",
		Timezone:   "UTC",
		DateFormat: "2006-01-02",
	}
}
