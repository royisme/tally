package mapper

import (
	"freelance-flow/internal/dto"
	"freelance-flow/internal/models"
)

// ToTimeEntryOutput converts a TimeEntry entity to TimeEntryOutput DTO.
func ToTimeEntryOutput(e models.TimeEntry) dto.TimeEntryOutput {
	return dto.TimeEntryOutput{
		ID:              e.ID,
		ProjectID:       e.ProjectID,
		Date:            e.Date,
		StartTime:       e.StartTime,
		EndTime:         e.EndTime,
		DurationSeconds: e.DurationSeconds,
		Description:     e.Description,
		Invoiced:        e.Invoiced,
	}
}

// ToTimeEntryOutputList converts a slice of TimeEntry entities to TimeEntryOutput DTOs.
func ToTimeEntryOutputList(entities []models.TimeEntry) []dto.TimeEntryOutput {
	if entities == nil {
		return []dto.TimeEntryOutput{}
	}
	result := make([]dto.TimeEntryOutput, len(entities))
	for i, e := range entities {
		result[i] = ToTimeEntryOutput(e)
	}
	return result
}

// ToTimeEntryEntity converts CreateTimeEntryInput DTO to TimeEntry entity.
func ToTimeEntryEntity(input dto.CreateTimeEntryInput) models.TimeEntry {
	return models.TimeEntry{
		ProjectID:       input.ProjectID,
		Date:            input.Date,
		StartTime:       input.StartTime,
		EndTime:         input.EndTime,
		DurationSeconds: input.DurationSeconds,
		Description:     input.Description,
		Invoiced:        input.Invoiced,
	}
}

// ApplyTimeEntryUpdate applies UpdateTimeEntryInput to an existing TimeEntry entity.
func ApplyTimeEntryUpdate(e *models.TimeEntry, input dto.UpdateTimeEntryInput) {
	e.ProjectID = input.ProjectID
	e.Date = input.Date
	e.StartTime = input.StartTime
	e.EndTime = input.EndTime
	e.DurationSeconds = input.DurationSeconds
	e.Description = input.Description
	e.Invoiced = input.Invoiced
}
