// Package db provides database initialization helpers, including Bun setup.
package db

import (
	"database/sql"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	"github.com/uptrace/bun/extra/bundebug"
)

// NewBunDB wraps an existing *sql.DB with Bun using SQLite dialect.
// Set enableQueryDebug to true to log queries during development.
func NewBunDB(sqlDB *sql.DB, enableQueryDebug bool) *bun.DB {
	db := bun.NewDB(sqlDB, sqlitedialect.New())
	if enableQueryDebug {
		db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
	}
	return db
}
