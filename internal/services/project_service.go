package services

import (
	"database/sql"
	"freelance-flow/internal/dto"
	"freelance-flow/internal/mapper"
	"freelance-flow/internal/models"
	"log"
	"strings"
)

// ProjectService handles all project-related operations.
type ProjectService struct {
	db *sql.DB
}

// NewProjectService creates a new ProjectService instance.
func NewProjectService(db *sql.DB) *ProjectService {
	return &ProjectService{db: db}
}

// List returns all projects as DTOs.
func (s *ProjectService) List() []dto.ProjectOutput {
	rows, err := s.db.Query("SELECT id, client_id, name, description, hourly_rate, currency, status, deadline, tags FROM projects")
	if err != nil {
		log.Println("Error querying projects:", err)
		return []dto.ProjectOutput{}
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		var tagsStr string
		err := rows.Scan(&p.ID, &p.ClientID, &p.Name, &p.Description, &p.HourlyRate, &p.Currency, &p.Status, &p.Deadline, &tagsStr)
		if err != nil {
			log.Println("Error scanning project:", err)
			continue
		}
		if tagsStr != "" {
			p.Tags = strings.Split(tagsStr, ",")
		} else {
			p.Tags = []string{}
		}
		projects = append(projects, p)
	}
	return mapper.ToProjectOutputList(projects)
}

// ListByClient returns all projects for a specific client.
func (s *ProjectService) ListByClient(clientID int) []dto.ProjectOutput {
	rows, err := s.db.Query("SELECT id, client_id, name, description, hourly_rate, currency, status, deadline, tags FROM projects WHERE client_id = ?", clientID)
	if err != nil {
		log.Println("Error querying projects by client:", err)
		return []dto.ProjectOutput{}
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		var tagsStr string
		err := rows.Scan(&p.ID, &p.ClientID, &p.Name, &p.Description, &p.HourlyRate, &p.Currency, &p.Status, &p.Deadline, &tagsStr)
		if err != nil {
			log.Println("Error scanning project:", err)
			continue
		}
		if tagsStr != "" {
			p.Tags = strings.Split(tagsStr, ",")
		} else {
			p.Tags = []string{}
		}
		projects = append(projects, p)
	}
	return mapper.ToProjectOutputList(projects)
}

// Get returns a single project by ID.
func (s *ProjectService) Get(id int) (dto.ProjectOutput, error) {
	row := s.db.QueryRow("SELECT id, client_id, name, description, hourly_rate, currency, status, deadline, tags FROM projects WHERE id = ?", id)
	var p models.Project
	var tagsStr string
	err := row.Scan(&p.ID, &p.ClientID, &p.Name, &p.Description, &p.HourlyRate, &p.Currency, &p.Status, &p.Deadline, &tagsStr)
	if err != nil {
		return dto.ProjectOutput{}, err
	}
	if tagsStr != "" {
		p.Tags = strings.Split(tagsStr, ",")
	} else {
		p.Tags = []string{}
	}
	return mapper.ToProjectOutput(p), nil
}

// Create adds a new project and returns the created project as DTO.
func (s *ProjectService) Create(input dto.CreateProjectInput) dto.ProjectOutput {
	entity := mapper.ToProjectEntity(input)
	tagsStr := strings.Join(entity.Tags, ",")

	stmt, err := s.db.Prepare("INSERT INTO projects(client_id, name, description, hourly_rate, currency, status, deadline, tags) VALUES(?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println("Error preparing project insert:", err)
		return dto.ProjectOutput{}
	}
	defer stmt.Close()

	res, err := stmt.Exec(entity.ClientID, entity.Name, entity.Description, entity.HourlyRate, entity.Currency, entity.Status, entity.Deadline, tagsStr)
	if err != nil {
		log.Println("Error inserting project:", err)
		return dto.ProjectOutput{}
	}

	id, _ := res.LastInsertId()
	entity.ID = int(id)
	return mapper.ToProjectOutput(entity)
}

// Update modifies an existing project and returns the updated project as DTO.
func (s *ProjectService) Update(input dto.UpdateProjectInput) dto.ProjectOutput {
	tagsStr := strings.Join(input.Tags, ",")

	stmt, err := s.db.Prepare("UPDATE projects SET client_id=?, name=?, description=?, hourly_rate=?, currency=?, status=?, deadline=?, tags=? WHERE id=?")
	if err != nil {
		log.Println("Error preparing project update:", err)
		return dto.ProjectOutput{}
	}
	defer stmt.Close()

	_, err = stmt.Exec(input.ClientID, input.Name, input.Description, input.HourlyRate, input.Currency, input.Status, input.Deadline, tagsStr, input.ID)
	if err != nil {
		log.Println("Error updating project:", err)
		return dto.ProjectOutput{}
	}

	output, _ := s.Get(input.ID)
	return output
}

// Delete removes a project by ID.
func (s *ProjectService) Delete(id int) {
	_, err := s.db.Exec("DELETE FROM projects WHERE id=?", id)
	if err != nil {
		log.Println("Error deleting project:", err)
	}
}
