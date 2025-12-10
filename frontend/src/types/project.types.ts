// Project Types - Re-exports from Wails-generated DTOs
// Source of truth: wailsjs/go/models.ts (auto-generated from Go dto package)

import { dto } from "@/wailsjs/go/models";

// Re-export Wails DTO types with frontend-friendly aliases
export type Project = dto.ProjectOutput;
export type CreateProjectInput = dto.CreateProjectInput;
export type UpdateProjectInput = dto.UpdateProjectInput;

// Service Interface
export interface IProjectService {
  list(): Promise<Project[]>;
  listByClient(clientId: number): Promise<Project[]>;
  get(id: number): Promise<Project>;
  create(input: CreateProjectInput): Promise<Project>;
  update(input: UpdateProjectInput): Promise<Project>;
  delete(id: number): Promise<void>;
}
