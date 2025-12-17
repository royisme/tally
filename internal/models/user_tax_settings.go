package models

import "time"

// UserTaxSettings represents user's tax status.
type UserTaxSettings struct {
	UserID         int       `json:"userId"`
	HstRegistered  bool      `json:"hstRegistered"`
	HstNumber      string    `json:"hstNumber"`
	TaxEnabled     bool      `json:"taxEnabled"`
	DefaultTaxRate float64   `json:"defaultTaxRate"`
	ExpectedIncome string    `json:"expectedIncome"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
