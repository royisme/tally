package services

import (
	"database/sql"
	"freelance-flow/internal/dto"
	"freelance-flow/internal/mapper"
	"freelance-flow/internal/models"
	"log"
)

// TimesheetService handles all time entry-related operations.
type TimesheetService struct {
	db *sql.DB
}

// NewTimesheetService creates a new TimesheetService instance.
func NewTimesheetService(db *sql.DB) *TimesheetService {
	return &TimesheetService{db: db}
}

// List returns all time entries, optionally filtered by project ID.
func (s *TimesheetService) List(projectID int) []dto.TimeEntryOutput {
	query := "SELECT id, project_id, date, start_time, end_time, duration_seconds, description, invoiced FROM time_entries"
	var args []interface{}
	if projectID > 0 {
		query += " WHERE project_id = ?"
		args = append(args, projectID)
	}

	rows, err := s.db.Query(query, args...)
	if err != nil {
		log.Println("Error querying time entries:", err)
		return []dto.TimeEntryOutput{}
	}
	defer rows.Close()

	var entries []models.TimeEntry
	for rows.Next() {
		var t models.TimeEntry
		err := rows.Scan(&t.ID, &t.ProjectID, &t.Date, &t.StartTime, &t.EndTime, &t.DurationSeconds, &t.Description, &t.Invoiced)
		if err != nil {
			log.Println("Error scanning time entry:", err)
			continue
		}
		entries = append(entries, t)
	}
	return mapper.ToTimeEntryOutputList(entries)
}

// Get returns a single time entry by ID.
func (s *TimesheetService) Get(id int) (dto.TimeEntryOutput, error) {
	row := s.db.QueryRow("SELECT id, project_id, date, start_time, end_time, duration_seconds, description, invoiced FROM time_entries WHERE id = ?", id)
	var t models.TimeEntry
	err := row.Scan(&t.ID, &t.ProjectID, &t.Date, &t.StartTime, &t.EndTime, &t.DurationSeconds, &t.Description, &t.Invoiced)
	if err != nil {
		return dto.TimeEntryOutput{}, err
	}
	return mapper.ToTimeEntryOutput(t), nil
}

// Create adds a new time entry and returns the created entry as DTO.
func (s *TimesheetService) Create(input dto.CreateTimeEntryInput) dto.TimeEntryOutput {
	entity := mapper.ToTimeEntryEntity(input)

	stmt, err := s.db.Prepare("INSERT INTO time_entries(project_id, date, start_time, end_time, duration_seconds, description, invoiced) VALUES(?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println("Error preparing time entry insert:", err)
		return dto.TimeEntryOutput{}
	}
	defer stmt.Close()

	res, err := stmt.Exec(entity.ProjectID, entity.Date, entity.StartTime, entity.EndTime, entity.DurationSeconds, entity.Description, entity.Invoiced)
	if err != nil {
		log.Println("Error inserting time entry:", err)
		return dto.TimeEntryOutput{}
	}

	id, _ := res.LastInsertId()
	entity.ID = int(id)
	return mapper.ToTimeEntryOutput(entity)
}

// Update modifies an existing time entry and returns the updated entry as DTO.
func (s *TimesheetService) Update(input dto.UpdateTimeEntryInput) dto.TimeEntryOutput {
	stmt, err := s.db.Prepare("UPDATE time_entries SET project_id=?, date=?, start_time=?, end_time=?, duration_seconds=?, description=?, invoiced=? WHERE id=?")
	if err != nil {
		log.Println("Error preparing time entry update:", err)
		return dto.TimeEntryOutput{}
	}
	defer stmt.Close()

	_, err = stmt.Exec(input.ProjectID, input.Date, input.StartTime, input.EndTime, input.DurationSeconds, input.Description, input.Invoiced, input.ID)
	if err != nil {
		log.Println("Error updating time entry:", err)
		return dto.TimeEntryOutput{}
	}

	output, _ := s.Get(input.ID)
	return output
}

// Delete removes a time entry by ID.
func (s *TimesheetService) Delete(id int) {
	_, err := s.db.Exec("DELETE FROM time_entries WHERE id=?", id)
	if err != nil {
		log.Println("Error deleting time entry:", err)
	}
}
