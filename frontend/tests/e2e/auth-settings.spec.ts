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

test("register sets currency/timezone and is visible in settings", async ({
  page,
}) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for auth");

  const prefs = await registerUserAndGoDashboard(page, {
    currency: "CAD",
    timezone: "Asia/Shanghai",
  });

  await page.goto(`${baseURL}/#/settings`);

  const currencyField = page.locator(".user-settings").getByText("Currency");
  await expect(currencyField).toBeVisible();
  await expect(page.locator(".user-settings")).toContainText(prefs.currency);

  const timezoneField = page.locator(".user-settings").getByText("Timezone");
  await expect(timezoneField).toBeVisible();
  await expect(page.locator(".user-settings")).toContainText(prefs.timezone);
});

test("user settings save persists after reload", async ({ page }) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for persistence");

  await registerUserAndGoDashboard(page);
  await page.goto(`${baseURL}/#/settings`);

  const taxInput = page
    .locator(".user-settings")
    .getByLabel("Default Tax Rate");
  await taxInput.fill("0.13");

  await page.getByRole("button", { name: /^save$/i }).click();
  await expect(page.locator(".n-message__content")).toContainText(/saved/i);

  await page.reload();
  await expect(taxInput).toHaveValue("0.13");
});

test("invoice email settings save roundtrip", async ({ page }) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for persistence");

  await registerUserAndGoDashboard(page);
  await page.goto(`${baseURL}/#/settings/invoice`);

  const subjectInput = page.getByLabel("Subject Template");
  await subjectInput.fill("Invoice {{number}} (E2E)");
  await page.getByRole("button", { name: /^save$/i }).click();
  await expect(page.locator(".n-message__content")).toContainText(/saved/i);

  await page.reload();
  await expect(subjectInput).toHaveValue(/E2E/);
});

