// TimeEntry Types - Re-exports from Wails-generated DTOs
// Source of truth: wailsjs/go/models.ts (auto-generated from Go dto package)

import { dto } from "@/wailsjs/go/models";

// Re-export Wails DTO types with frontend-friendly aliases
export type TimeEntry = dto.TimeEntryOutput;
export type CreateTimeEntryInput = dto.CreateTimeEntryInput;
export type UpdateTimeEntryInput = dto.UpdateTimeEntryInput;

// Service Interface
export interface ITimeEntryService {
  list(projectId?: number): Promise<TimeEntry[]>;
  get(id: number): Promise<TimeEntry>;
  create(input: CreateTimeEntryInput): Promise<TimeEntry>;
  update(input: UpdateTimeEntryInput): Promise<TimeEntry>;
  delete(id: number): Promise<void>;
}
