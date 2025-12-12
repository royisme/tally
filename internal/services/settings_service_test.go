package services

import (
	"encoding/json"
	"freelance-flow/internal/dto"
	"testing"
)

func TestSettingsService_GetDefaultsWhenEmpty(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("failed to close db: %v", err)
		}
	}()

	authService := NewAuthService(db)
	user, err := authService.Register(dto.RegisterInput{Username: "u1", Password: "pwd"})
	if err != nil {
		t.Fatalf("register failed: %v", err)
	}

	svc := NewSettingsService(db)
	settings := svc.Get(user.ID)

	if settings.Currency != "USD" {
		t.Errorf("expected default currency USD, got %q", settings.Currency)
	}
	if settings.Timezone != "UTC" {
		t.Errorf("expected default timezone UTC, got %q", settings.Timezone)
	}
	if settings.InvoiceTerms == "" {
		t.Error("expected default invoice terms to be set")
	}
	if settings.DefaultMessageTemplate == "" {
		t.Error("expected default message template to be set")
	}
}

func TestSettingsService_UpdateNormalizesAndPersists(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("failed to close db: %v", err)
		}
	}()

	authService := NewAuthService(db)
	user, err := authService.Register(dto.RegisterInput{Username: "u2", Password: "pwd"})
	if err != nil {
		t.Fatalf("register failed: %v", err)
	}

	svc := NewSettingsService(db)
	input := dto.UserSettings{
		Currency:               "",
		DefaultTaxRate:         -5,
		DateFormat:             "",
		Timezone:               "Asia/Shanghai",
		SenderName:             "  Alice  ",
		InvoiceTerms:           "   ",
		DefaultMessageTemplate: "   ",
	}

	updated, err := svc.Update(user.ID, input)
	if err != nil {
		t.Fatalf("update failed: %v", err)
	}

	if updated.Currency != "USD" {
		t.Errorf("expected normalized currency USD, got %q", updated.Currency)
	}
	if updated.DefaultTaxRate != 0 {
		t.Errorf("expected normalized tax rate 0, got %v", updated.DefaultTaxRate)
	}
	if updated.SenderName != "Alice" {
		t.Errorf("expected trimmed sender name 'Alice', got %q", updated.SenderName)
	}
	if updated.InvoiceTerms == "" || updated.InvoiceTerms == "   " {
		t.Error("expected normalized invoice terms to be set")
	}
	if updated.DefaultMessageTemplate == "" || updated.DefaultMessageTemplate == "   " {
		t.Error("expected normalized default message template to be set")
	}
	if updated.Timezone != "Asia/Shanghai" {
		t.Errorf("expected timezone preserved, got %q", updated.Timezone)
	}

	// Verify persisted JSON round-trip.
	raw := "{}"
	if err := db.QueryRow("SELECT settings_json FROM users WHERE id = ?", user.ID).Scan(&raw); err != nil {
		t.Fatalf("failed to load settings_json: %v", err)
	}
	var stored dto.UserSettings
	if err := json.Unmarshal([]byte(raw), &stored); err != nil {
		t.Fatalf("failed to unmarshal stored settings: %v", err)
	}
	if stored.SenderName != "Alice" || stored.Timezone != "Asia/Shanghai" {
		t.Errorf("unexpected stored settings: %+v", stored)
	}
}

