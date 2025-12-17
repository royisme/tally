package dto

// UserInvoiceSettings represents invoice template settings exposed to frontend.
type UserInvoiceSettings struct {
	UserID                 int    `json:"userId"`
	SenderName             string `json:"senderName"`
	SenderCompany          string `json:"senderCompany"`
	SenderAddress          string `json:"senderAddress"`
	SenderPhone            string `json:"senderPhone"`
	SenderEmail            string `json:"senderEmail"`
	SenderPostalCode       string `json:"senderPostalCode"`
	DefaultTerms           string `json:"defaultTerms"`
	DefaultMessageTemplate string `json:"defaultMessageTemplate"`
}
