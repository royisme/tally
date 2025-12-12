package services

import (
	"freelance-flow/internal/dto"
	"testing"
)

func TestReportService_AggregationAndIsolation(t *testing.T) {
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

	userA, _ := authService.Register(dto.RegisterInput{Username: "UserA", Password: "pwd"})
	userB, _ := authService.Register(dto.RegisterInput{Username: "UserB", Password: "pwd"})

	clientA := clientService.Create(userA.ID, dto.CreateClientInput{Name: "ClientA"})
	projectA := projectService.Create(userA.ID, dto.CreateProjectInput{
		ClientID:    clientA.ID,
		Name:        "ProjectA",
		HourlyRate:  100,
		Currency:    "USD",
		Description: "",
	})
	clientB := clientService.Create(userB.ID, dto.CreateClientInput{Name: "ClientB"})
	projectB := projectService.Create(userB.ID, dto.CreateProjectInput{
		ClientID:    clientB.ID,
		Name:        "ProjectB",
		HourlyRate:  200,
		Currency:    "USD",
		Description: "",
	})

	// User A entries: 2h on 2025-01-01, 1h on 2025-01-02.
	_ = timeService.Create(userA.ID, dto.CreateTimeEntryInput{
		ProjectID:       projectA.ID,
		Date:            "2025-01-01",
		StartTime:       "09:00",
		EndTime:         "11:00",
		DurationSeconds: 7200,
		Billable:        true,
	})
	_ = timeService.Create(userA.ID, dto.CreateTimeEntryInput{
		ProjectID:       projectA.ID,
		Date:            "2025-01-02",
		StartTime:       "09:00",
		EndTime:         "10:00",
		DurationSeconds: 3600,
		Billable:        true,
	})

	// User B entry: 3h on same date, should not leak to user A.
	_ = timeService.Create(userB.ID, dto.CreateTimeEntryInput{
		ProjectID:       projectB.ID,
		Date:            "2025-01-01",
		StartTime:       "09:00",
		EndTime:         "12:00",
		DurationSeconds: 10800,
		Billable:        true,
	})

	svc := NewReportService(db)

	reportA, err := svc.Get(userA.ID, dto.ReportFilter{
		StartDate: "2025-01-01",
		EndDate:   "2025-01-31",
	})
	if err != nil {
		t.Fatalf("report get failed: %v", err)
	}
	if reportA.TotalHours != 3 {
		t.Errorf("expected total hours 3, got %v", reportA.TotalHours)
	}
	if reportA.TotalIncome != 300 {
		t.Errorf("expected total income 300, got %v", reportA.TotalIncome)
	}
	if len(reportA.Rows) != 2 {
		t.Fatalf("expected 2 rows for user A, got %d", len(reportA.Rows))
	}
	for _, r := range reportA.Rows {
		if r.ClientID != clientA.ID || r.ProjectID != projectA.ID {
			t.Fatalf("unexpected row leakage: %+v", r)
		}
	}

	// Filter by client should still work.
	reportAClient, err := svc.Get(userA.ID, dto.ReportFilter{
		StartDate: "2025-01-01",
		EndDate:   "2025-01-31",
		ClientID:  clientA.ID,
	})
	if err != nil {
		t.Fatalf("report get with client filter failed: %v", err)
	}
	if reportAClient.TotalHours != 3 || reportAClient.TotalIncome != 300 {
		t.Errorf("unexpected totals with client filter: %+v", reportAClient)
	}
}
