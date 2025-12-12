package services

import (
	"freelance-flow/internal/dto"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInvoiceService_CRUD(t *testing.T) {
	db := setupFullTestDB(t)
	defer func() { _ = db.Close() }()

	auth := NewAuthService(db)
	clientSvc := NewClientService(db)
	invSvc := NewInvoiceService(db)

	user := createTestUser(t, auth, "inv_user")
	client := clientSvc.Create(user.ID, dto.CreateClientInput{Name: "Client"})

	// Create
	created := invSvc.Create(user.ID, dto.CreateInvoiceInput{
		ClientID:  client.ID,
		Number:    "INV-CR-1",
		IssueDate: "2025-01-01",
		DueDate:   "2025-01-15",
		Subtotal:  100,
		TaxRate:   0.1,
		TaxAmount: 10,
		Total:     110,
		Status:    "draft",
		Items: []dto.InvoiceItemInput{
			{Description: "Line", Quantity: 1, UnitPrice: 100, Amount: 100},
		},
	})
	assert.NotZero(t, created.ID)
	assert.Equal(t, "INV-CR-1", created.Number)
	assert.Len(t, created.Items, 1)

	// List
	list := invSvc.List(user.ID)
	assert.Len(t, list, 1)

	// Get
	got, err := invSvc.Get(user.ID, created.ID)
	assert.NoError(t, err)
	assert.Equal(t, created.Number, got.Number)

	// Update
	updated := invSvc.Update(user.ID, dto.UpdateInvoiceInput{
		ID:        created.ID,
		ClientID:  client.ID,
		Number:    "INV-CR-2",
		IssueDate: created.IssueDate,
		DueDate:   created.DueDate,
		Subtotal:  200,
		TaxRate:   0.2,
		TaxAmount: 40,
		Total:     240,
		Status:    "sent",
		Items: []dto.InvoiceItemInput{
			{Description: "Line2", Quantity: 2, UnitPrice: 100, Amount: 200},
		},
	})
	assert.Equal(t, "INV-CR-2", updated.Number)
	assert.Equal(t, 240.0, updated.Total)

	// Delete
	invSvc.Delete(user.ID, created.ID)
	assert.Len(t, invSvc.List(user.ID), 0)
}

