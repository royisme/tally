import type {
  AppModule,
  ModuleID,
  ModuleMessages,
  ModuleNavItem,
  ModuleSettingsPage,
} from "@/modules/types";
import { financeModule } from "@/modules/finance/module";
import type { RouteRecordRaw } from "vue-router";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ProjectOutlined,
  SettingOutlined,
  UserOutlined,
} from "@vicons/antd";

export type EnabledModulesInput = {
  moduleOverrides?: Partial<Record<ModuleID, boolean>> | null;
};

export function normalizeModuleOverrides(
  values: Record<string, unknown> | null | undefined
): Partial<Record<ModuleID, boolean>> | null {
  if (!values) return null;
  const out: Partial<Record<ModuleID, boolean>> = {};
  for (const [k, v] of Object.entries(values)) {
    if (typeof v !== "boolean") continue;
    out[k as ModuleID] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

const baseModules: AppModule[] = [
  {
    id: "dashboard",
    enabledByDefault: true,
    toggleable: false,
    nav: {
      labelKey: "nav.dashboard",
      key: "dashboard",
      icon: DashboardOutlined,
    },
    routes: [
      {
        path: "/dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "dashboard" },
      },
    ],
  },
  {
    id: "clients",
    enabledByDefault: true,
    toggleable: false,
    nav: { labelKey: "nav.clients", key: "clients", icon: UserOutlined },
    routes: [
      {
        path: "/clients",
        component: () => import("@/views/Clients.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "clients" },
      },
    ],
  },
  {
    id: "projects",
    enabledByDefault: true,
    toggleable: false,
    nav: { labelKey: "nav.projects", key: "projects", icon: ProjectOutlined },
    routes: [
      {
        path: "/projects",
        component: () => import("@/views/Projects.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "projects" },
      },
      {
        path: "/projects/:id",
        component: () => import("@/views/ProjectDetail.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "projects" },
      },
    ],
  },
  {
    id: "timesheet",
    enabledByDefault: true,
    toggleable: false,
    nav: {
      labelKey: "nav.timesheet",
      key: "timesheet",
      icon: ClockCircleOutlined,
    },
    routes: [
      {
        path: "/timesheet",
        component: () => import("@/views/Timesheet.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "timesheet" },
      },
    ],
  },
  {
    id: "invoices",
    enabledByDefault: true,
    toggleable: false,
    nav: { labelKey: "nav.invoices", key: "invoices", icon: FileTextOutlined },
    routes: [
      {
        path: "/invoices",
        component: () => import("@/views/Invoices.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "invoices" },
      },
    ],
  },
  {
    id: "reports",
    enabledByDefault: true,
    toggleable: false,
    nav: { labelKey: "nav.reports", key: "reports", icon: BarChartOutlined },
    routes: [
      {
        path: "/reports",
        component: () => import("@/views/Reports.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "reports" },
      },
    ],
  },
];

const settingsBaseChildren: Array<{
  key: string;
  order: number;
  labelKey: string;
  component: RouteRecordRaw["component"];
}> = [
  {
    key: "general",
    order: 10,
    labelKey: "settings.general.title",
    component: () => import("@/views/settings/GeneralSettings.vue"),
  },
  {
    key: "profile",
    order: 20,
    labelKey: "settings.profile.title",
    component: () => import("@/views/settings/ProfileSettings.vue"),
  },
  {
    key: "invoice",
    order: 30,
    labelKey: "settings.invoice.title",
    component: () => import("@/views/settings/InvoiceSettings.vue"),
  },
  {
    key: "email",
    order: 40,
    labelKey: "settings.email.title",
    component: () => import("@/views/settings/EmailSettings.vue"),
  },
];

function createSettingsModule(contribPages: ModuleSettingsPage[]): AppModule {
  const pages = [...contribPages].sort((a, b) => a.order - b.order);
  const settingsChildren = [
    { path: "", redirect: "/settings/general" },
    ...settingsBaseChildren.map((p) => ({
      path: p.key,
      component: p.component,
    })),
    ...pages.map((p) => ({
      path: p.key,
      component: p.component,
      meta: { moduleID: p.moduleID },
    })),
  ];

  return {
    id: "settings",
    enabledByDefault: true,
    toggleable: false,
    nav: {
      labelKey: "nav.settings",
      key: "settings",
      icon: SettingOutlined,
      children: [
        ...settingsBaseChildren.map((p) => ({
          key: `settings/${p.key}`,
          labelKey: p.labelKey,
          moduleID: "settings",
        })),
        ...pages.map((p) => ({
          key: `settings/${p.key}`,
          labelKey: p.labelKey,
          moduleID: p.moduleID,
        })),
      ],
    },
    routes: [
      {
        path: "/settings",
        component: () => import("@/views/settings/SettingsLayout.vue"),
        meta: { requiresAuth: true, layout: "main", moduleID: "settings" },
        children: settingsChildren,
      },
    ],
  };
}

const nonSettingsModules: AppModule[] = [...baseModules, financeModule];

export const allModules: AppModule[] = [
  ...nonSettingsModules,
  createSettingsModule(
    nonSettingsModules.flatMap((m) => m.settingsPages ?? [])
  ),
];

export function isModuleEnabled(
  module: AppModule,
  input: EnabledModulesInput | null
): boolean {
  const overrides = input?.moduleOverrides ?? null;
  if (overrides && overrides[module.id] !== undefined) {
    return overrides[module.id] === true;
  }
  return module.enabledByDefault;
}

export function collectModuleMessages(modules: AppModule[]): ModuleMessages[] {
  return modules.flatMap((m) => (m.messages ? [m.messages] : []));
}

export function collectNavItems(modules: AppModule[]): ModuleNavItem[] {
  return modules.flatMap((m) => (m.nav ? [m.nav] : []));
}

export function getModuleByID(moduleID: ModuleID): AppModule | null {
  return allModules.find((m) => m.id === moduleID) ?? null;
}

export function isModuleIDEnabled(
  moduleID: ModuleID,
  overrides: EnabledModulesInput["moduleOverrides"] | null
): boolean {
  const mod = getModuleByID(moduleID);
  if (!mod) return true;
  return isModuleEnabled(mod, { moduleOverrides: overrides });
}
