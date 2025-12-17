package services

import (
	"database/sql"
	"log"
	"tally/internal/dto"
	"tally/internal/mapper"
	"tally/internal/models"
)

// UserTaxSettingsService manages user-level tax settings (HST).
type UserTaxSettingsService struct {
	db *sql.DB
}

// NewUserTaxSettingsService creates a new UserTaxSettingsService.
func NewUserTaxSettingsService(db *sql.DB) *UserTaxSettingsService {
	return &UserTaxSettingsService{db: db}
}

// Get retrieves user tax settings from DB.
func (s *UserTaxSettingsService) Get(userID int) (dto.UserTaxSettings, error) {
	query := `SELECT 
		user_id, hst_registered, hst_number, tax_enabled, default_tax_rate, expected_income
		FROM user_tax_settings WHERE user_id = ?`

	var settings models.UserTaxSettings
	var hstNumber, expectedIncome sql.NullString

	err := s.db.QueryRow(query, userID).Scan(
		&settings.UserID,
		&settings.HstRegistered,
		&hstNumber,
		&settings.TaxEnabled,
		&settings.DefaultTaxRate,
		&expectedIncome,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return s.getDefaults(userID), nil
		}
		log.Printf("Error fetching user tax settings for user %d: %v", userID, err)
		return s.getDefaults(userID), err
	}

	if hstNumber.Valid {
		settings.HstNumber = hstNumber.String
	}
	if expectedIncome.Valid {
		settings.ExpectedIncome = expectedIncome.String
	}

	return mapper.ToUserTaxSettingsDTO(settings), nil
}

// Update updates user tax settings in DB.
func (s *UserTaxSettingsService) Update(userID int, input dto.UserTaxSettings) (dto.UserTaxSettings, error) {
	// Simple validation/logic
	if input.DefaultTaxRate < 0 {
		input.DefaultTaxRate = 0
	}
	// If HST registered, force tax enabled
	if input.HstRegistered {
		input.TaxEnabled = true
		if input.DefaultTaxRate == 0 {
			input.DefaultTaxRate = 0.13 // Default to 13% if not set
		}
	}

	query := `INSERT INTO user_tax_settings (user_id, hst_registered, hst_number, tax_enabled, default_tax_rate, expected_income, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
		ON CONFLICT(user_id) DO UPDATE SET
		hst_registered=excluded.hst_registered,
		hst_number=excluded.hst_number,
		tax_enabled=excluded.tax_enabled,
		default_tax_rate=excluded.default_tax_rate,
		expected_income=excluded.expected_income,
		updated_at=datetime('now')`

	_, err := s.db.Exec(query, userID, input.HstRegistered, input.HstNumber, input.TaxEnabled, input.DefaultTaxRate, input.ExpectedIncome)
	if err != nil {
		log.Printf("Error updating user tax settings for user %d: %v", userID, err)
		return dto.UserTaxSettings{}, err
	}

	input.UserID = userID
	return input, nil
}

func (s *UserTaxSettingsService) getDefaults(userID int) dto.UserTaxSettings {
	return dto.UserTaxSettings{
		UserID: userID,
	}
}
