export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  releaseNotesUrl?: string;
  mandatory: boolean;
  minimumOsVersion?: Record<string, string>;
  platforms: Record<string, PlatformInfo>;
}

export interface PlatformInfo {
  url: string;
  signature: string;
  size: number;
}

export type UpdateStatus =
  | "none"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export interface UpdateState {
  status: UpdateStatus;
  currentVersion: string;
  latestVersion?: string;
  updateInfo?: UpdateInfo;
  downloadProgress?: number;
  error?: string;
}
