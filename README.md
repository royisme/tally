# FreelanceFlow

A modern desktop application for freelance management, built with Go (Wails) and Vue 3.

## 🚀 Features

- **Client Management**: Track client details and history.
- **Projects**: Manage projects and their status.
- **Timesheets**: Log work hours.
- **Invoices**: Generate invoices from timesheets.
- **Dashboard**: At-a-glance business metrics.

## 🛠️ Tech Stack

- **Backend**: Go 1.25+ (Wails v2)
- **Frontend**: Vue 3, TypeScript, Naive UI, Pinia
- **Database**: SQLite (Local persistence)

## 📋 Prerequisites

- **Go**: [Install Go](https://go.dev/doc/install) (1.21+)
- **Wails**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- **Node.js / Bun**: [Install Bun](https://bun.sh/) (Recommended) or Node.js

## ⚡ Quick Start

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/freelance-flow.git
   cd freelance-flow
   ```

2. **Install dependencies**:

   ```bash
   # Frontend dependencies
   cd frontend
   bun install
   cd ..
   ```

3. **Run in Development Mode**:
   ```bash
   wails dev
   ```
   This will start the backend and frontend with hot-reload enabled.

## 📦 Build

To build the production application:

```bash
wails build
```

The executable will be generated in the `build/bin` directory.

## 📂 Project Structure

- `frontend/`: Vue 3 application source code.
- `internal/`: Go backend logic (Services, Models, DB).
- `main.go`: Application entry point and configuration.
- `wails.json`: Wails project configuration.
