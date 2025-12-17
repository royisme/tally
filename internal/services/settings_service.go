package services

import (
	"database/sql"
	"strings"
	"tally/internal/dto"
	"tally/internal/mapper"
	"tally/internal/models"
)

// SettingsService manages user-level preferences stored in settings_json.
type SettingsService struct {
	db *sql.DB
}

// NewSettingsService creates a new SettingsService instance.
func NewSettingsService(db *sql.DB) *SettingsService {
	return &SettingsService{db: db}
}

// Get returns normalized user settings by aggregating from new tables.
func (s *SettingsService) Get(userID int) dto.UserSettings {
	prefsSvc := NewUserPreferencesService(s.db)
	taxSvc := NewUserTaxSettingsService(s.db)
	invSvc := NewUserInvoiceSettingsService(s.db)

	prefs, _ := prefsSvc.Get(userID)
	tax, _ := taxSvc.Get(userID)
	inv, _ := invSvc.Get(userID)

	// Combine into DTO
	return dto.UserSettings{
		// Preferences
		Currency:        prefs.Currency,
		Language:        prefs.Language,
		Theme:           prefs.Theme,
		Timezone:        prefs.Timezone,
		DateFormat:      prefs.DateFormat,
		ModuleOverrides: prefs.ModuleOverrides,

		// Tax
		HstRegistered:  tax.HstRegistered,
		HstNumber:      tax.HstNumber,
		TaxEnabled:     tax.TaxEnabled,
		DefaultTaxRate: tax.DefaultTaxRate,
		ExpectedIncome: tax.ExpectedIncome,

		// Invoice
		SenderName:             inv.SenderName,
		SenderCompany:          inv.SenderCompany,
		SenderAddress:          inv.SenderAddress,
		SenderPhone:            inv.SenderPhone,
		SenderEmail:            inv.SenderEmail,
		SenderPostalCode:       inv.SenderPostalCode,
		InvoiceTerms:           inv.DefaultTerms,
		DefaultMessageTemplate: inv.DefaultMessageTemplate,
	}
}

// Update distributes settings to the new tables.
func (s *SettingsService) Update(userID int, input dto.UserSettings) (dto.UserSettings, error) {
	// Normalize input first (to maintain legacy behavior like trimming)
	modelInput := mapper.ToUserSettingsModel(input)
	normalized := normalizeUserSettings(modelInput)

	// Use normalized values for update
	prefsSvc := NewUserPreferencesService(s.db)
	taxSvc := NewUserTaxSettingsService(s.db)
	invSvc := NewUserInvoiceSettingsService(s.db)

	// 1. Update Preferences
	_, err := prefsSvc.Update(userID, dto.UserPreferences{
		Currency:        normalized.Currency,
		Language:        normalized.Language,
		Theme:           normalized.Theme,
		Timezone:        normalized.Timezone,
		DateFormat:      normalized.DateFormat,
		ModuleOverrides: normalized.ModuleOverrides,
	})
	if err != nil {
		return dto.UserSettings{}, err
	}

	// 2. Update Tax
	_, err = taxSvc.Update(userID, dto.UserTaxSettings{
		HstRegistered:  normalized.HstRegistered,
		HstNumber:      normalized.HstNumber,
		TaxEnabled:     normalized.TaxEnabled,
		DefaultTaxRate: normalized.DefaultTaxRate,
		ExpectedIncome: normalized.ExpectedIncome,
	})
	if err != nil {
		return dto.UserSettings{}, err
	}

	// 3. Update Invoice Settings
	_, err = invSvc.Update(userID, dto.UserInvoiceSettings{
		SenderName:             normalized.SenderName,
		SenderCompany:          normalized.SenderCompany,
		SenderAddress:          normalized.SenderAddress,
		SenderPhone:            normalized.SenderPhone,
		SenderEmail:            normalized.SenderEmail,
		SenderPostalCode:       normalized.SenderPostalCode,
		DefaultTerms:           normalized.InvoiceTerms,
		DefaultMessageTemplate: normalized.DefaultMessageTemplate,
	})
	if err != nil {
		return dto.UserSettings{}, err
	}

	// Return updated state
	return s.Get(userID), nil
}

// normalizeUserSettings fills defaults and trims spaces.
func normalizeUserSettings(settings models.UserSettings) models.UserSettings {
	trim := func(value string) string {
		return strings.TrimSpace(value)
	}
	normalizeModuleOverrides := func(values map[string]bool) map[string]bool {
		if len(values) == 0 {
			return nil
		}
		out := make(map[string]bool, len(values))
		for k, v := range values {
			k = trim(k)
			if k == "" {
				continue
			}
			out[k] = v
		}
		if len(out) == 0 {
			return nil
		}
		return out
	}

	if settings.Currency == "" {
		settings.Currency = "USD"
	}
	if settings.DefaultTaxRate < 0 {
		settings.DefaultTaxRate = 0
	}
	if settings.DateFormat == "" {
		settings.DateFormat = "2006-01-02"
	}
	if settings.Timezone == "" {
		settings.Timezone = "UTC"
	}
	if settings.Language == "" {
		settings.Language = "en-US"
	}
	if settings.Theme == "" {
		settings.Theme = "light"
	}

	settings.SenderName = trim(settings.SenderName)
	settings.SenderCompany = trim(settings.SenderCompany)
	settings.SenderAddress = trim(settings.SenderAddress)
	settings.SenderPhone = trim(settings.SenderPhone)
	settings.SenderEmail = trim(settings.SenderEmail)
	settings.SenderPostalCode = trim(settings.SenderPostalCode)
	settings.InvoiceTerms = trim(settings.InvoiceTerms)
	settings.DefaultMessageTemplate = trim(settings.DefaultMessageTemplate)
	settings.ModuleOverrides = normalizeModuleOverrides(settings.ModuleOverrides)

	// Normalize HST fields
	settings.HstNumber = trim(settings.HstNumber)
	// Validate ExpectedIncome - only allow valid values
	validIncomeValues := map[string]bool{"under30k": true, "over30k": true, "unsure": true, "": true}
	if !validIncomeValues[settings.ExpectedIncome] {
		settings.ExpectedIncome = ""
	}
	// If HST is registered, tax should be enabled by default
	if settings.HstRegistered && !settings.TaxEnabled {
		settings.TaxEnabled = true
	}
	// Default tax rate to 13% (Ontario HST) if tax is enabled but rate is 0
	if settings.TaxEnabled && settings.DefaultTaxRate == 0 {
		settings.DefaultTaxRate = 0.13
	}

	if settings.InvoiceTerms == "" {
		settings.InvoiceTerms = "Due upon receipt"
	}
	if settings.DefaultMessageTemplate == "" {
		settings.DefaultMessageTemplate = "Thank you for your business."
	}

	return settings
}

// defaultUserSettings returns baseline defaults.
func defaultUserSettings() models.UserSettings {
	return models.UserSettings{
		Currency:               "USD",
		DefaultTaxRate:         0,
		Language:               "en-US",
		Theme:                  "light",
		DateFormat:             "2006-01-02",
		Timezone:               "UTC",
		InvoiceTerms:           "Due upon receipt",
		DefaultMessageTemplate: "Thank you for your business.",
	}
}
