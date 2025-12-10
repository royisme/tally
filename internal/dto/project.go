package dto

// CreateProjectInput represents the input for creating a new project.
type CreateProjectInput struct {
	ClientID    int      `json:"clientId"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	HourlyRate  float64  `json:"hourlyRate"`
	Currency    string   `json:"currency"`
	Status      string   `json:"status"`
	Deadline    string   `json:"deadline"`
	Tags        []string `json:"tags"`
}

// UpdateProjectInput represents the input for updating an existing project.
type UpdateProjectInput struct {
	ID          int      `json:"id"`
	ClientID    int      `json:"clientId"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	HourlyRate  float64  `json:"hourlyRate"`
	Currency    string   `json:"currency"`
	Status      string   `json:"status"`
	Deadline    string   `json:"deadline"`
	Tags        []string `json:"tags"`
}

// ProjectOutput represents the project data returned from API.
type ProjectOutput struct {
	ID          int      `json:"id"`
	ClientID    int      `json:"clientId"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	HourlyRate  float64  `json:"hourlyRate"`
	Currency    string   `json:"currency"`
	Status      string   `json:"status"`
	Deadline    string   `json:"deadline"`
	Tags        []string `json:"tags"`
}
