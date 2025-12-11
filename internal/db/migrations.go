package db

import (
	"database/sql"
	"embed"
	"errors"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// MigrationRunner handles database schema migrations.
type MigrationRunner struct {
	db *sql.DB
	m  *migrate.Migrate
}

// NewMigrationRunner creates a new migration runner for the given database.
func NewMigrationRunner(db *sql.DB) (*MigrationRunner, error) {
	// Create sqlite3 driver instance
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return nil, err
	}

	// Create iofs source from embedded migrations
	source, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return nil, err
	}

	// Create migrate instance
	m, err := migrate.NewWithInstance("iofs", source, "sqlite3", driver)
	if err != nil {
		return nil, err
	}

	return &MigrationRunner{db: db, m: m}, nil
}

// Up runs all pending migrations.
func (r *MigrationRunner) Up() error {
	err := r.m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}
	return nil
}

// Down rolls back all migrations.
func (r *MigrationRunner) Down() error {
	err := r.m.Down()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}
	return nil
}

// Steps runs n migrations (positive = up, negative = down).
func (r *MigrationRunner) Steps(n int) error {
	err := r.m.Steps(n)
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}
	return nil
}

// Version returns the current migration version and dirty state.
func (r *MigrationRunner) Version() (version uint, dirty bool, err error) {
	return r.m.Version()
}

// Force sets a specific migration version without running migrations.
// Useful for fixing dirty states.
func (r *MigrationRunner) Force(version int) error {
	return r.m.Force(version)
}

// Close closes the migration runner.
func (r *MigrationRunner) Close() error {
	sourceErr, dbErr := r.m.Close()
	if sourceErr != nil {
		return sourceErr
	}
	return dbErr
}

// RunMigrations is a convenience function that runs all pending migrations.
// This is the main entry point for application startup.
func RunMigrations(db *sql.DB) error {
	runner, err := NewMigrationRunner(db)
	if err != nil {
		log.Printf("Failed to create migration runner: %v", err)
		return err
	}
	// Note: We don't close the runner here because it would close the db connection
	// The runner's Close() method is for cleanup when you're done with migrations

	if err := runner.Up(); err != nil {
		log.Printf("Failed to run migrations: %v", err)
		return err
	}

	version, dirty, err := runner.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		log.Printf("Failed to get migration version: %v", err)
	} else if err == nil {
		log.Printf("Database migrated to version %d (dirty: %v)", version, dirty)
	}

	return nil
}
