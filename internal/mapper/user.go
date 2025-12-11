package mapper

import (
	"freelance-flow/internal/dto"
	"freelance-flow/internal/models"
)

// ToUserOutput converts a User entity to UserOutput DTO.
func ToUserOutput(e models.User) dto.UserOutput {
	return dto.UserOutput{
		ID:           e.ID,
		UUID:         e.UUID,
		Username:     e.Username,
		Email:        e.Email,
		AvatarURL:    e.AvatarURL,
		CreatedAt:    e.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		LastLogin:    e.LastLogin.Format("2006-01-02T15:04:05Z07:00"),
		SettingsJSON: e.SettingsJSON,
	}
}

// ToUserOutputList converts a slice of User entities to UserOutput DTOs.
func ToUserOutputList(entities []models.User) []dto.UserOutput {
	if entities == nil {
		return []dto.UserOutput{}
	}
	result := make([]dto.UserOutput, len(entities))
	for i, e := range entities {
		result[i] = ToUserOutput(e)
	}
	return result
}

// ToUserListItem converts a User entity to a minimal UserListItem DTO.
func ToUserListItem(e models.User) dto.UserListItem {
	return dto.UserListItem{
		ID:        e.ID,
		Username:  e.Username,
		AvatarURL: e.AvatarURL,
	}
}

// ToUserListItemList converts a slice of User entities to UserListItem DTOs.
func ToUserListItemList(entities []models.User) []dto.UserListItem {
	if entities == nil {
		return []dto.UserListItem{}
	}
	result := make([]dto.UserListItem, len(entities))
	for i, e := range entities {
		result[i] = ToUserListItem(e)
	}
	return result
}
