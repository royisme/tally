// Package main provides a simple CLI for running database migrations.
package main

import (
	"flag"
	"fmt"
	"log"

	"freelance-flow/internal/db"
)

func main() {
	action := flag.String("action", "up", "migration action: up, down, steps, version, force")
	steps := flag.Int("steps", 0, "steps for -action steps (positive=up, negative=down)")
	forceVersion := flag.Int("version", -1, "version for -action force or output for -action version")
	flag.Parse()

	sqlDB, dbPath, err := db.Open()
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer func() {
		if cerr := sqlDB.Close(); cerr != nil {
			log.Printf("failed to close database: %v", cerr)
		}
	}()

	runner, err := db.NewMigrationRunner(sqlDB)
	if err != nil {
		log.Fatalf("failed to create migration runner: %v", err)
	}

	switch *action {
	case "up":
		if err := runner.Up(); err != nil {
			log.Fatalf("migration up failed: %v", err)
		}
		fmt.Printf("migrations applied on %s\n", dbPath)
	case "down":
		if err := runner.Down(); err != nil {
			log.Fatalf("migration down failed: %v", err)
		}
		fmt.Printf("all migrations rolled back on %s\n", dbPath)
	case "steps":
		if *steps == 0 {
			log.Fatal("steps must be non-zero when action=steps")
		}
		if err := runner.Steps(*steps); err != nil {
			log.Fatalf("migration steps failed: %v", err)
		}
		fmt.Printf("ran %d migration steps on %s\n", *steps, dbPath)
	case "version":
		version, dirty, err := runner.Version()
		if err != nil {
			log.Fatalf("failed to get version: %v", err)
		}
		fmt.Printf("version=%d dirty=%v on %s\n", version, dirty, dbPath)
	case "force":
		if *forceVersion < 0 {
			log.Fatal("version must be provided when action=force")
		}
		if err := runner.Force(*forceVersion); err != nil {
			log.Fatalf("failed to force version: %v", err)
		}
		fmt.Printf("forced version=%d on %s\n", *forceVersion, dbPath)
	default:
		log.Fatalf("unknown action: %s", *action)
	}
}
