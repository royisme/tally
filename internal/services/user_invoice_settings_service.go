package services

import (
	"database/sql"
	"log"
	"tally/internal/dto"
	"tally/internal/mapper"
	"tally/internal/models"
)

// UserInvoiceSettingsService manages invoice templates and sender info.
type UserInvoiceSettingsService struct {
	db *sql.DB
}

// NewUserInvoiceSettingsService creates a new UserInvoiceSettingsService.
func NewUserInvoiceSettingsService(db *sql.DB) *UserInvoiceSettingsService {
	return &UserInvoiceSettingsService{db: db}
}

// Get retrieves user invoice settings from DB.
func (s *UserInvoiceSettingsService) Get(userID int) (dto.UserInvoiceSettings, error) {
	query := `SELECT 
		user_id, sender_name, sender_company, sender_address, sender_phone, sender_email, sender_postal_code, default_terms, default_message_template
		FROM user_invoice_settings WHERE user_id = ?`

	var settings models.UserInvoiceSettings
	var sName, sCompany, sAddress, sPhone, sEmail, sPostal, dTerms, dTemplate sql.NullString

	err := s.db.QueryRow(query, userID).Scan(
		&settings.UserID,
		&sName,
		&sCompany,
		&sAddress,
		&sPhone,
		&sEmail,
		&sPostal,
		&dTerms,
		&dTemplate,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return s.getDefaults(userID), nil
		}
		log.Printf("Error fetching user invoice settings for user %d: %v", userID, err)
		return s.getDefaults(userID), err
	}

	if sName.Valid {
		settings.SenderName = sName.String
	}
	if sCompany.Valid {
		settings.SenderCompany = sCompany.String
	}
	if sAddress.Valid {
		settings.SenderAddress = sAddress.String
	}
	if sPhone.Valid {
		settings.SenderPhone = sPhone.String
	}
	if sEmail.Valid {
		settings.SenderEmail = sEmail.String
	}
	if sPostal.Valid {
		settings.SenderPostalCode = sPostal.String
	}
	if dTerms.Valid {
		settings.DefaultTerms = dTerms.String
	}
	if dTemplate.Valid {
		settings.DefaultMessageTemplate = dTemplate.String
	}

	return mapper.ToUserInvoiceSettingsDTO(settings), nil
}

// Update updates user invoice settings in DB.
func (s *UserInvoiceSettingsService) Update(userID int, input dto.UserInvoiceSettings) (dto.UserInvoiceSettings, error) {
	// Apply defaults if empty
	if input.DefaultTerms == "" {
		input.DefaultTerms = "Due upon receipt"
	}
	if input.DefaultMessageTemplate == "" {
		input.DefaultMessageTemplate = "Thank you for your business."
	}

	query := `INSERT INTO user_invoice_settings (user_id, sender_name, sender_company, sender_address, sender_phone, sender_email, sender_postal_code, default_terms, default_message_template, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
		ON CONFLICT(user_id) DO UPDATE SET
		sender_name=excluded.sender_name,
		sender_company=excluded.sender_company,
		sender_address=excluded.sender_address,
		sender_phone=excluded.sender_phone,
		sender_email=excluded.sender_email,
		sender_postal_code=excluded.sender_postal_code,
		default_terms=excluded.default_terms,
		default_message_template=excluded.default_message_template,
		updated_at=datetime('now')`

	_, err := s.db.Exec(query, userID, input.SenderName, input.SenderCompany, input.SenderAddress, input.SenderPhone, input.SenderEmail, input.SenderPostalCode, input.DefaultTerms, input.DefaultMessageTemplate)
	if err != nil {
		log.Printf("Error updating user invoice settings for user %d: %v", userID, err)
		return dto.UserInvoiceSettings{}, err
	}

	input.UserID = userID
	return input, nil
}

func (s *UserInvoiceSettingsService) getDefaults(userID int) dto.UserInvoiceSettings {
	return dto.UserInvoiceSettings{
		UserID:                 userID,
		DefaultTerms:           "Due upon receipt",
		DefaultMessageTemplate: "Thank you for your business.",
	}
}
