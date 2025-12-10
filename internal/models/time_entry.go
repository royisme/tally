package models

type TimeEntry struct {
	ID              int    `json:"id"`
	ProjectID       int    `json:"projectId"`
	Date            string `json:"date"`
	StartTime       string `json:"startTime"`
	EndTime         string `json:"endTime"`
	DurationSeconds int    `json:"durationSeconds"`
	Description     string `json:"description"`
	Invoiced        bool   `json:"invoiced"`
}
