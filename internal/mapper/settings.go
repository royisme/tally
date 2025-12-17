package mapper

import (
	"tally/internal/dto"
	"tally/internal/models"
)

// ToUserSettingsDTO converts model settings to dto.
func ToUserSettingsDTO(settings models.UserSettings) dto.UserSettings {
	return dto.UserSettings{
		Currency:               settings.Currency,
		DefaultTaxRate:         settings.DefaultTaxRate,
		Language:               settings.Language,
		Theme:                  settings.Theme,
		DateFormat:             settings.DateFormat,
		Timezone:               settings.Timezone,
		SenderName:             settings.SenderName,
		SenderCompany:          settings.SenderCompany,
		SenderAddress:          settings.SenderAddress,
		SenderPhone:            settings.SenderPhone,
		SenderEmail:            settings.SenderEmail,
		SenderPostalCode:       settings.SenderPostalCode,
		InvoiceTerms:           settings.InvoiceTerms,
		DefaultMessageTemplate: settings.DefaultMessageTemplate,
		ModuleOverrides:        settings.ModuleOverrides,
		HstRegistered:          settings.HstRegistered,
		HstNumber:              settings.HstNumber,
		TaxEnabled:             settings.TaxEnabled,
		ExpectedIncome:         settings.ExpectedIncome,
	}
}

// ToUserSettingsModel converts dto to model settings.
func ToUserSettingsModel(settings dto.UserSettings) models.UserSettings {
	return models.UserSettings{
		Currency:               settings.Currency,
		DefaultTaxRate:         settings.DefaultTaxRate,
		Language:               settings.Language,
		Theme:                  settings.Theme,
		DateFormat:             settings.DateFormat,
		Timezone:               settings.Timezone,
		SenderName:             settings.SenderName,
		SenderCompany:          settings.SenderCompany,
		SenderAddress:          settings.SenderAddress,
		SenderPhone:            settings.SenderPhone,
		SenderEmail:            settings.SenderEmail,
		SenderPostalCode:       settings.SenderPostalCode,
		InvoiceTerms:           settings.InvoiceTerms,
		DefaultMessageTemplate: settings.DefaultMessageTemplate,
		ModuleOverrides:        settings.ModuleOverrides,
		HstRegistered:          settings.HstRegistered,
		HstNumber:              settings.HstNumber,
		TaxEnabled:             settings.TaxEnabled,
		ExpectedIncome:         settings.ExpectedIncome,
	}
}

// -- UserPreferences --

// ToUserPreferencesDTO converts model to dto.
func ToUserPreferencesDTO(model models.UserPreferences) dto.UserPreferences {
	return dto.UserPreferences{
		UserID:          model.UserID,
		Currency:        model.Currency,
		Language:        model.Language,
		Theme:           model.Theme,
		Timezone:        model.Timezone,
		DateFormat:      model.DateFormat,
		ModuleOverrides: model.ModuleOverrides,
	}
}

// ToUserPreferencesModel converts dto to model.
func ToUserPreferencesModel(d dto.UserPreferences) models.UserPreferences {
	return models.UserPreferences{
		UserID:          d.UserID,
		Currency:        d.Currency,
		Language:        d.Language,
		Theme:           d.Theme,
		Timezone:        d.Timezone,
		DateFormat:      d.DateFormat,
		ModuleOverrides: d.ModuleOverrides,
	}
}

// -- UserTaxSettings --

// ToUserTaxSettingsDTO converts model to dto.
func ToUserTaxSettingsDTO(model models.UserTaxSettings) dto.UserTaxSettings {
	return dto.UserTaxSettings{
		UserID:         model.UserID,
		HstRegistered:  model.HstRegistered,
		HstNumber:      model.HstNumber,
		TaxEnabled:     model.TaxEnabled,
		DefaultTaxRate: model.DefaultTaxRate,
		ExpectedIncome: model.ExpectedIncome,
	}
}

// ToUserTaxSettingsModel converts dto to model.
func ToUserTaxSettingsModel(d dto.UserTaxSettings) models.UserTaxSettings {
	return models.UserTaxSettings{
		UserID:         d.UserID,
		HstRegistered:  d.HstRegistered,
		HstNumber:      d.HstNumber,
		TaxEnabled:     d.TaxEnabled,
		DefaultTaxRate: d.DefaultTaxRate,
		ExpectedIncome: d.ExpectedIncome,
	}
}

// -- UserInvoiceSettings --

// ToUserInvoiceSettingsDTO converts model to dto.
func ToUserInvoiceSettingsDTO(model models.UserInvoiceSettings) dto.UserInvoiceSettings {
	return dto.UserInvoiceSettings{
		UserID:                 model.UserID,
		SenderName:             model.SenderName,
		SenderCompany:          model.SenderCompany,
		SenderAddress:          model.SenderAddress,
		SenderPhone:            model.SenderPhone,
		SenderEmail:            model.SenderEmail,
		SenderPostalCode:       model.SenderPostalCode,
		DefaultTerms:           model.DefaultTerms,
		DefaultMessageTemplate: model.DefaultMessageTemplate,
	}
}

// ToUserInvoiceSettingsModel converts dto to model.
func ToUserInvoiceSettingsModel(d dto.UserInvoiceSettings) models.UserInvoiceSettings {
	return models.UserInvoiceSettings{
		UserID:                 d.UserID,
		SenderName:             d.SenderName,
		SenderCompany:          d.SenderCompany,
		SenderAddress:          d.SenderAddress,
		SenderPhone:            d.SenderPhone,
		SenderEmail:            d.SenderEmail,
		SenderPostalCode:       d.SenderPostalCode,
		DefaultTerms:           d.DefaultTerms,
		DefaultMessageTemplate: d.DefaultMessageTemplate,
	}
}
