package dto

// UserTaxSettings represents tax status exposed to frontend.
type UserTaxSettings struct {
	UserID         int     `json:"userId"`
	HstRegistered  bool    `json:"hstRegistered"`
	HstNumber      string  `json:"hstNumber"`
	TaxEnabled     bool    `json:"taxEnabled"`
	DefaultTaxRate float64 `json:"defaultTaxRate"`
	ExpectedIncome string  `json:"expectedIncome"`
}
