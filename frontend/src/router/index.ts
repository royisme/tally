import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/clients", component: () => import("@/views/Clients.vue") },
  { path: "/projects", component: () => import("@/views/Projects.vue") },
  { path: "/timesheet", component: () => import("@/views/Timesheet.vue") },
  { path: "/invoices", component: () => import("@/views/Invoices.vue") },
  { path: "/reports", component: () => import("@/views/Reports.vue") },
];

const router = createRouter({
  // Use Hash history for Wails/Desktop compatibility
  history: createWebHashHistory(),
  routes,
});

export default router;
