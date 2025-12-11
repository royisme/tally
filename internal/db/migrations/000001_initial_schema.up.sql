-- 000001_initial_schema.up.sql
-- Initial database schema for FreelanceFlow MVP

-- Users table - must be created first for foreign key references
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    settings_json TEXT DEFAULT '{}'
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
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
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
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
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    project_id INTEGER NOT NULL,
    date TEXT,
    start_time TEXT,
    end_time TEXT,
    duration_seconds INTEGER,
    description TEXT,
    billable BOOLEAN DEFAULT 1,
    invoiced BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(project_id) REFERENCES projects(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
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
);
