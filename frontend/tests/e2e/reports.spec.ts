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

test("reports view loads and filters apply", async ({ page }) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for auth");

  await registerUserAndGoDashboard(page);
  await page.goto(`${baseURL}/#/reports`);

  await expect(page.getByText("Reports")).toBeVisible();
  await page.getByRole("button", { name: /apply/i }).click();

  await expect(page.locator(".n-alert--error")).toHaveCount(0);

  // Select first client option if available and re-apply
  const clientSelect = page.getByPlaceholder("Client");
  await clientSelect.click();
  const firstOption = page.locator(".n-base-select-option").first();
  if (await firstOption.isVisible()) {
    await firstOption.click();
    await page.getByRole("button", { name: /apply/i }).click();
    await expect(page.locator(".n-alert--error")).toHaveCount(0);
  }

  // Either empty state or table should show
  const empty = page.getByText(/no data for current filters/i);
  const table = page.locator(".n-data-table");
  await expect(
    (await empty.count()) > 0 || (await table.count()) > 0
  ).toBeTruthy();
});

