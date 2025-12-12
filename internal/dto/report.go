package dto

// ReportFilter defines optional filters for report aggregation.
type ReportFilter struct {
	StartDate string `json:"startDate"` // inclusive, YYYY-MM-DD
	EndDate   string `json:"endDate"`   // inclusive, YYYY-MM-DD
	ClientID  int    `json:"clientId"`
	ProjectID int    `json:"projectId"`
}

// ReportRow is a grouped row for the report table.
type ReportRow struct {
	Date        string  `json:"date"`
	ClientID    int     `json:"clientId"`
	ClientName  string  `json:"clientName"`
	ProjectID   int     `json:"projectId"`
	ProjectName string  `json:"projectName"`
	Hours       float64 `json:"hours"`
	Income      float64 `json:"income"`
}

// ReportChartSeries provides time-based series for charts.
type ReportChartSeries struct {
	Dates   []string  `json:"dates"`
	Revenue []float64 `json:"revenue"`
	Hours   []float64 `json:"hours"`
}

// ReportOutput is returned to frontend.
type ReportOutput struct {
	TotalHours  float64           `json:"totalHours"`
	TotalIncome float64           `json:"totalIncome"`
	Rows        []ReportRow       `json:"rows"`
	Chart       ReportChartSeries `json:"chart"`
}

