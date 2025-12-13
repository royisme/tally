package services

import (
	"database/sql"
	"encoding/base64"
	"os"
	"path/filepath"
	"testing"
	"time"

	"freelance-flow/internal/dto"

	_ "github.com/mattn/go-sqlite3"
)

// This test exercises the real "create invoice -> link uninvoiced time entries -> generate PDF" flow
// using the existing local app database, without mutating it (it operates on a temp copy).
func TestInvoiceService_GeneratePDF_FromLocalDBCopy(t *testing.T) {
	t.Helper()

	homeDir, err := os.UserHomeDir()
	if err != nil {
		t.Fatalf("failed to get home dir: %v", err)
	}
	srcDB := filepath.Join(homeDir, ".freelance-flow", "freelance.db")
	if _, err := os.Stat(srcDB); err != nil {
		t.Skipf("local db not found at %s", srcDB)
	}

	tmpDir := t.TempDir()
	dstDB := filepath.Join(tmpDir, "freelance.db")
	// #nosec G304 -- reading a fixed, user-owned local app db path for an integration-style test; we only operate on a temp copy.
	raw, err := os.ReadFile(srcDB)
	if err != nil {
		t.Fatalf("failed to read local db: %v", err)
	}
	if err := os.WriteFile(dstDB, raw, 0o600); err != nil {
		t.Fatalf("failed to write temp db copy: %v", err)
	}

	db, err := sql.Open("sqlite3", dstDB)
	if err != nil {
		t.Fatalf("failed to open temp db: %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("failed to close db: %v", err)
		}
	}()

	var userID int
	if err := db.QueryRow(`SELECT id FROM users ORDER BY id LIMIT 1`).Scan(&userID); err != nil {
		t.Skipf("no users found in local db copy: %v", err)
	}

	var clientID int
	if err := db.QueryRow(`SELECT id FROM clients WHERE user_id = ? ORDER BY id LIMIT 1`, userID).Scan(&clientID); err != nil {
		t.Skipf("no clients found for user %d in local db copy: %v", userID, err)
	}

	var projectID int
	if err := db.QueryRow(`SELECT id FROM projects WHERE user_id = ? AND client_id = ? ORDER BY id LIMIT 1`, userID, clientID).Scan(&projectID); err != nil {
		t.Skipf("no projects found for user %d / client %d in local db copy: %v", userID, clientID, err)
	}

	rows, err := db.Query(`
SELECT id
FROM time_entries
WHERE user_id = ?
  AND project_id = ?
  AND billable = 1
  AND invoiced = 0
  AND (invoice_id IS NULL OR invoice_id = 0)
ORDER BY date ASC, id ASC
LIMIT 10
`, userID, projectID)
	if err != nil {
		t.Fatalf("failed to query eligible time entries: %v", err)
	}
	defer closeWithLog(rows, "closing eligible time entries rows")

	var timeEntryIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			t.Fatalf("failed to scan time entry id: %v", err)
		}
		timeEntryIDs = append(timeEntryIDs, id)
	}
	if len(timeEntryIDs) == 0 {
		t.Skip("no eligible (uninvoiced) time entries found for selected project")
	}

	invoiceService := NewInvoiceService(db)
	now := time.Now().UTC()
	issueDate := now.Format("2006-01-02")
	dueDate := now.AddDate(0, 0, 14).Format("2006-01-02")

	inv := invoiceService.Create(userID, dto.CreateInvoiceInput{
		ClientID:  clientID,
		Number:    "TEST-" + now.Format("20060102-150405.000000000"),
		IssueDate: issueDate,
		DueDate:   dueDate,
		Subtotal:  0,
		TaxRate:   0.13,
		TaxAmount: 0,
		Total:     0,
		Status:    "draft",
		Items:     []dto.InvoiceItemInput{},
	})
	if inv.ID == 0 {
		t.Fatalf("expected created invoice id, got 0")
	}

	_, err = invoiceService.SetTimeEntries(userID, dto.SetInvoiceTimeEntriesInput{
		InvoiceID:    inv.ID,
		TimeEntryIDs: timeEntryIDs,
	})
	if err != nil {
		t.Fatalf("SetTimeEntries failed: %v", err)
	}

	b64, err := invoiceService.GeneratePDF(userID, inv.ID, "")
	if err != nil {
		t.Fatalf("GeneratePDF failed: %v", err)
	}
	pdfBytes, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		t.Fatalf("base64 decode failed: %v", err)
	}
	if len(pdfBytes) < 100 || string(pdfBytes[:4]) != "%PDF" {
		t.Fatalf("expected pdf bytes, got prefix=%q len=%d", string(pdfBytes[:8]), len(pdfBytes))
	}
}
