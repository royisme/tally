package services

import (
	"freelance-flow/internal/dto"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProjectService_CRUD(t *testing.T) {
	db := setupFullTestDB(t)
	defer func() { _ = db.Close() }()

	auth := NewAuthService(db)
	clientSvc := NewClientService(db)
	projectSvc := NewProjectService(db)

	user := createTestUser(t, auth, "project_user")
	client := clientSvc.Create(user.ID, dto.CreateClientInput{Name: "Client"})

	// Create
	created := projectSvc.Create(user.ID, dto.CreateProjectInput{
		ClientID:    client.ID,
		Name:        "Proj",
		Description: "desc",
		HourlyRate:  100,
		Currency:    "USD",
		Status:      "active",
		Deadline:    "2025-01-01",
		Tags:        []string{"a", "b"},
	})
	assert.NotZero(t, created.ID)
	assert.Equal(t, client.ID, created.ClientID)

	// List / ListByClient
	list := projectSvc.List(user.ID)
	assert.Len(t, list, 1)
	byClient := projectSvc.ListByClient(user.ID, client.ID)
	assert.Len(t, byClient, 1)

	// Get
	got, err := projectSvc.Get(user.ID, created.ID)
	assert.NoError(t, err)
	assert.ElementsMatch(t, []string{"a", "b"}, got.Tags)

	// Update (tags roundtrip)
	updated := projectSvc.Update(user.ID, dto.UpdateProjectInput{
		ID:          created.ID,
		ClientID:    client.ID,
		Name:        "Proj2",
		Description: "d2",
		HourlyRate:  120,
		Currency:    "CAD",
		Status:      "archived",
		Deadline:    "",
		Tags:        []string{"x"},
	})
	assert.Equal(t, "Proj2", updated.Name)
	assert.ElementsMatch(t, []string{"x"}, updated.Tags)

	// Delete
	projectSvc.Delete(user.ID, created.ID)
	assert.Len(t, projectSvc.List(user.ID), 0)
}

