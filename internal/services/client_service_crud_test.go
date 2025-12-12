package services

import (
	"freelance-flow/internal/dto"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestClientService_CRUD(t *testing.T) {
	db := setupFullTestDB(t)
	defer func() { _ = db.Close() }()

	auth := NewAuthService(db)
	clientSvc := NewClientService(db)

	user := createTestUser(t, auth, "client_user")

	// Create
	created := clientSvc.Create(user.ID, dto.CreateClientInput{
		Name:           "Acme",
		Email:          "a@acme.com",
		Website:        "https://acme.com",
		ContactPerson:  "Bob",
		Address:        "1 Road",
		Currency:       "USD",
		Status:         "active",
		Notes:          "note",
		Avatar:         "",
	})
	assert.NotZero(t, created.ID)
	assert.Equal(t, "Acme", created.Name)

	// List
	list := clientSvc.List(user.ID)
	assert.Len(t, list, 1)
	assert.Equal(t, created.ID, list[0].ID)

	// Get
	got, err := clientSvc.Get(user.ID, created.ID)
	assert.NoError(t, err)
	assert.Equal(t, "a@acme.com", got.Email)

	// Update
	updated := clientSvc.Update(user.ID, dto.UpdateClientInput{
		ID:             created.ID,
		Name:           "Acme Updated",
		Email:          "new@acme.com",
		Website:        created.Website,
		Avatar:         created.Avatar,
		ContactPerson:  "Alice",
		Address:        created.Address,
		Currency:       "CAD",
		Status:         "inactive",
		Notes:          "n2",
	})
	assert.Equal(t, created.ID, updated.ID)
	assert.Equal(t, "Acme Updated", updated.Name)
	assert.Equal(t, "CAD", updated.Currency)

	// Delete
	clientSvc.Delete(user.ID, created.ID)
	listAfter := clientSvc.List(user.ID)
	assert.Len(t, listAfter, 0)
}
