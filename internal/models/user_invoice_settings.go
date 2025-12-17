package models

import "time"

// UserInvoiceSettings represents invoice appearance and sender details.
type UserInvoiceSettings struct {
	UserID                 int       `json:"userId"`
	SenderName             string    `json:"senderName"`
	SenderCompany          string    `json:"senderCompany"`
	SenderAddress          string    `json:"senderAddress"`
	SenderPhone            string    `json:"senderPhone"`
	SenderEmail            string    `json:"senderEmail"`
	SenderPostalCode       string    `json:"senderPostalCode"`
	DefaultTerms           string    `json:"defaultTerms"`
	DefaultMessageTemplate string    `json:"defaultMessageTemplate"`
	UpdatedAt              time.Time `json:"updatedAt"`
}
