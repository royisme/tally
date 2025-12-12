import { test, expect } from "@playwright/test";
import {
  baseURL,
  isDevServerReachable,
  hasWailsRuntime,
  registerUserAndGoDashboard,
} from "./helpers";

let reachable = false;

test.beforeAll(async ({ request }) => {
  reachable = await isDevServerReachable(request);
});

test("clients/projects/timesheet pages load and basic create works", async ({
  page,
}) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for auth");

  await registerUserAndGoDashboard(page);

  // Clients: open create modal and create a client
  await page.goto(`${baseURL}/#/clients`);
  await expect(page.getByText(/clients/i)).toBeVisible();
  await page.getByRole("button", { name: /add client|新增客户|添加客户/i }).click();

  await page.getByPlaceholder(/name|名称/i).fill("E2E Client");
  await page.getByPlaceholder(/email|邮箱/i).fill("e2e@example.com");
  await page.getByRole("button", { name: /create|创建|保存/i }).click();
  await expect(page.locator(".client-table")).toContainText("E2E Client");

  // Projects: open create modal and create a project
  await page.goto(`${baseURL}/#/projects`);
  await expect(page.getByText(/projects/i)).toBeVisible();
  await page.getByRole("button", { name: /add project|新增项目|添加项目/i }).click();

  await page.getByPlaceholder(/project name|name|名称/i).first().fill("E2E Project");
  const clientSelect = page.locator(".n-modal .n-select").first();
  await clientSelect.click();
  await page.locator(".n-base-select-option").first().click();
  await page.getByRole("button", { name: /create|创建|保存/i }).click();
  await expect(page.locator(".project-table")).toContainText("E2E Project");

  // Timesheet: just load and open edit modal for first row if present
  await page.goto(`${baseURL}/#/timesheet`);
  await expect(page.getByText(/timesheet/i)).toBeVisible();
  const firstRowEdit = page
    .locator(".n-data-table-tbody .n-data-table-tr")
    .nth(0)
    .getByRole("button")
    .nth(1);
  if (await firstRowEdit.isVisible()) {
    await firstRowEdit.click();
    await expect(page.locator(".n-modal")).toBeVisible();
    await page.getByRole("button", { name: /cancel|取消/i }).click();
  }
});

