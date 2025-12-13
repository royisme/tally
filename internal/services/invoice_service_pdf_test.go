package services

import (
	"encoding/base64"
	"freelance-flow/internal/dto"
	"strings"
	"testing"
)

func TestInvoiceService_GeneratePDF_BasicStructure(t *testing.T) {
	db := setupFullTestDB(t)
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("failed to close db: %v", err)
		}
	}()

	authService := NewAuthService(db)
	clientService := NewClientService(db)
	projectService := NewProjectService(db)
	timeService := NewTimesheetService(db)
	invoiceService := NewInvoiceService(db)

	user, _ := authService.Register(dto.RegisterInput{Username: "UserA", Password: "pwd"})
	client := clientService.Create(user.ID, dto.CreateClientInput{Name: "ClientA"})
	project := projectService.Create(user.ID, dto.CreateProjectInput{
		ClientID:   client.ID,
		Name:       "ProjectA",
		HourlyRate: 100,
		Currency:   "USD",
	})

	inv := invoiceService.Create(user.ID, dto.CreateInvoiceInput{
		ClientID:  client.ID,
		Number:    "42",
		IssueDate: "2025-01-01",
		DueDate:   "2025-01-15",
		Status:    "draft",
		Items:     []dto.InvoiceItemInput{},
	})

	// Create one time entry (not linked yet)
	entry := timeService.Create(user.ID, dto.CreateTimeEntryInput{
		ProjectID:       project.ID,
		Date:            "2025-01-02",
		StartTime:       "09:00",
		EndTime:         "10:00",
		DurationSeconds: 3600,
		Billable:        true,
		Invoiced:        false,
	})
	// Link entry to invoice using SetTimeEntries
	_, _ = invoiceService.SetTimeEntries(user.ID, dto.SetInvoiceTimeEntriesInput{
		InvoiceID:    inv.ID,
		TimeEntryIDs: []int{entry.ID},
	})

	b64, err := invoiceService.GeneratePDF(user.ID, inv.ID, "Custom message")
	if err != nil {
		t.Fatalf("GeneratePDF failed: %v", err)
	}
	raw, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		t.Fatalf("base64 decode failed: %v", err)
	}
	if !strings.HasPrefix(string(raw), "%PDF") {
		t.Fatalf("expected pdf header, got %q", string(raw[:8]))
	}
}
