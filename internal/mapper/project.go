package mapper

import (
	"freelance-flow/internal/dto"
	"freelance-flow/internal/models"
)

// ToProjectOutput converts a Project entity to ProjectOutput DTO.
func ToProjectOutput(e models.Project) dto.ProjectOutput {
	tags := e.Tags
	if tags == nil {
		tags = []string{}
	}
	return dto.ProjectOutput{
		ID:          e.ID,
		ClientID:    e.ClientID,
		Name:        e.Name,
		Description: e.Description,
		HourlyRate:  e.HourlyRate,
		Currency:    e.Currency,
		Status:      e.Status,
		Deadline:    e.Deadline,
		Tags:        tags,
	}
}

// ToProjectOutputList converts a slice of Project entities to ProjectOutput DTOs.
func ToProjectOutputList(entities []models.Project) []dto.ProjectOutput {
	if entities == nil {
		return []dto.ProjectOutput{}
	}
	result := make([]dto.ProjectOutput, len(entities))
	for i, e := range entities {
		result[i] = ToProjectOutput(e)
	}
	return result
}

// ToProjectEntity converts CreateProjectInput DTO to Project entity.
func ToProjectEntity(input dto.CreateProjectInput) models.Project {
	tags := input.Tags
	if tags == nil {
		tags = []string{}
	}
	return models.Project{
		ClientID:    input.ClientID,
		Name:        input.Name,
		Description: input.Description,
		HourlyRate:  input.HourlyRate,
		Currency:    input.Currency,
		Status:      input.Status,
		Deadline:    input.Deadline,
		Tags:        tags,
	}
}

// ApplyProjectUpdate applies UpdateProjectInput to an existing Project entity.
func ApplyProjectUpdate(e *models.Project, input dto.UpdateProjectInput) {
	e.ClientID = input.ClientID
	e.Name = input.Name
	e.Description = input.Description
	e.HourlyRate = input.HourlyRate
	e.Currency = input.Currency
	e.Status = input.Status
	e.Deadline = input.Deadline
	if input.Tags != nil {
		e.Tags = input.Tags
	} else {
		e.Tags = []string{}
	}
}
