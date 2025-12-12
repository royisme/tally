package services

import (
	"database/sql"
	"freelance-flow/internal/dto"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

// setupFullTestDB creates an in-memory SQLite database with core tables for CRUD tests.
func setupFullTestDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	queries := []string{
		`CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			uuid TEXT UNIQUE NOT NULL,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			email TEXT,
			avatar_url TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			last_login TEXT,
			settings_json TEXT DEFAULT '{}'
		);`,
		`CREATE TABLE clients (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			name TEXT NOT NULL,
			email TEXT,
			website TEXT,
			avatar TEXT,
			contact_person TEXT,
			address TEXT,
			currency TEXT DEFAULT 'USD',
			status TEXT DEFAULT 'active',
			notes TEXT,
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE projects (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			client_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			description TEXT,
			hourly_rate REAL,
			currency TEXT,
			status TEXT DEFAULT 'active',
			deadline TEXT,
			tags TEXT,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(client_id) REFERENCES clients(id)
		);`,
		`CREATE TABLE time_entries (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			project_id INTEGER NOT NULL,
			invoice_id INTEGER,
			date TEXT,
			start_time TEXT,
			end_time TEXT,
			duration_seconds INTEGER,
			description TEXT,
			billable BOOLEAN DEFAULT 1,
			invoiced BOOLEAN DEFAULT 0,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(project_id) REFERENCES projects(id),
			FOREIGN KEY(invoice_id) REFERENCES invoices(id)
		);`,
		`CREATE TABLE invoices (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			client_id INTEGER NOT NULL,
			number TEXT UNIQUE,
			issue_date TEXT,
			due_date TEXT,
			subtotal REAL,
			tax_rate REAL,
			tax_amount REAL,
			total REAL,
			status TEXT,
			items_json TEXT,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(client_id) REFERENCES clients(id)
		);`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			t.Fatalf("failed to create table: %v", err)
		}
	}

	return db
}

func createTestUser(t *testing.T, auth *AuthService, username string) dto.UserOutput {
	t.Helper()
	user, err := auth.Register(dto.RegisterInput{Username: username, Password: "pwd"})
	if err != nil {
		t.Fatalf("failed to register user: %v", err)
	}
	return user
}

