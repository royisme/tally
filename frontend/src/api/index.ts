// API Layer - Central service registry
// Automatically uses Wails bindings in production, mock services in dev

import {
  mockClientService,
  mockProjectService,
  mockTimeEntryService,
  mockInvoiceService,
} from "./mock";
import * as WailsClientService from "@/wailsjs/go/services/ClientService";
import * as WailsProjectService from "@/wailsjs/go/services/ProjectService";
import * as WailsTimesheetService from "@/wailsjs/go/services/TimesheetService";
import * as WailsInvoiceService from "@/wailsjs/go/services/InvoiceService";
import type {
  IClientService,
  IProjectService,
  ITimeEntryService,
  IInvoiceService,
} from "@/types";

// Check if we're in Wails runtime (window.go exists)
const isWailsRuntime = typeof window !== "undefined" && "go" in window;

// Wails service adapters - types are now aligned via re-exports
const wailsClientService: IClientService = {
  list: () => WailsClientService.List(),
  get: (id) => WailsClientService.Get(id),
  create: (input) => WailsClientService.Create(input),
  update: (input) => WailsClientService.Update(input),
  delete: (id) => WailsClientService.Delete(id),
};

const wailsProjectService: IProjectService = {
  list: () => WailsProjectService.List(),
  listByClient: (clientId) => WailsProjectService.ListByClient(clientId),
  get: (id) => WailsProjectService.Get(id),
  create: (input) => WailsProjectService.Create(input),
  update: (input) => WailsProjectService.Update(input),
  delete: (id) => WailsProjectService.Delete(id),
};

const wailsTimeEntryService: ITimeEntryService = {
  list: (projectId) => WailsTimesheetService.List(projectId ?? 0),
  get: (id) => WailsTimesheetService.Get(id),
  create: (input) => WailsTimesheetService.Create(input),
  update: (input) => WailsTimesheetService.Update(input),
  delete: (id) => WailsTimesheetService.Delete(id),
};

const wailsInvoiceService: IInvoiceService = {
  list: () => WailsInvoiceService.List(),
  get: (id) => WailsInvoiceService.Get(id),
  create: (input) => WailsInvoiceService.Create(input),
  update: (input) => WailsInvoiceService.Update(input),
  delete: (id) => WailsInvoiceService.Delete(id),
  generatePdf: (id) => WailsInvoiceService.GeneratePDF(id),
  sendEmail: (id) => WailsInvoiceService.SendEmail(id),
};

// Export the appropriate service based on runtime environment
export const api = isWailsRuntime
  ? {
      clients: wailsClientService,
      projects: wailsProjectService,
      timeEntries: wailsTimeEntryService,
      invoices: wailsInvoiceService,
    }
  : {
      clients: mockClientService,
      projects: mockProjectService,
      timeEntries: mockTimeEntryService,
      invoices: mockInvoiceService,
    };

// Re-export types for convenience
export type {
  IClientService,
  IProjectService,
  ITimeEntryService,
  IInvoiceService,
};
