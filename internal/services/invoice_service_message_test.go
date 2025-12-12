package services

import (
	"freelance-flow/internal/dto"
	"strings"
	"testing"
)

func TestInvoiceService_GetDefaultMessage_WithAndWithoutEntries(t *testing.T) {
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
		Number:    "1",
		IssueDate: "2025-01-01",
		DueDate:   "2025-01-15",
		Status:    "draft",
		Items:     []dto.InvoiceItemInput{},
	})

	// No entries linked yet -> should fallback to default template.
	msgEmpty, err := invoiceService.GetDefaultMessage(user.ID, inv.ID)
	if err != nil {
		t.Fatalf("GetDefaultMessage failed: %v", err)
	}
	if msgEmpty == "" {
		t.Fatal("expected non-empty default message")
	}

	// Link two entries.
	_ = timeService.Create(user.ID, dto.CreateTimeEntryInput{
		ProjectID:       project.ID,
		InvoiceID:       inv.ID,
		Date:            "2025-01-02",
		StartTime:       "09:00",
		EndTime:         "11:00",
		DurationSeconds: 7200,
		Billable:        true,
		Invoiced:        true,
	})
	_ = timeService.Create(user.ID, dto.CreateTimeEntryInput{
		ProjectID:       project.ID,
		InvoiceID:       inv.ID,
		Date:            "2025-01-03",
		StartTime:       "",
		EndTime:         "",
		DurationSeconds: 3600,
		Billable:        true,
		Invoiced:        true,
	})

	msg, err := invoiceService.GetDefaultMessage(user.ID, inv.ID)
	if err != nil {
		t.Fatalf("GetDefaultMessage failed: %v", err)
	}
	if msg == msgEmpty {
		t.Fatal("expected message to change when entries exist")
	}
	if want := "2025-01-02 09:00-11:00 2.0"; !strings.Contains(msg, want) {
		t.Fatalf("expected line %q in message, got %q", want, msg)
	}
}
