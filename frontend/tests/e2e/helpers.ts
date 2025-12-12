import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

export const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";

export async function isDevServerReachable(
  request: APIRequestContext
): Promise<boolean> {
  try {
    const res = await request.get(baseURL);
    return res.ok();
  } catch {
    return false;
  }
}

export async function hasWailsRuntime(page: Page): Promise<boolean> {
  return page.evaluate(() => "go" in window);
}

export async function registerUserAndGoDashboard(
  page: Page,
  opts?: { currency?: string; timezone?: string }
): Promise<{ username: string; password: string; currency: string; timezone: string }> {
  const username = `e2e_${Date.now()}`;
  const password = "pass1234";
  const currency = opts?.currency ?? "USD";
  const timezone = opts?.timezone ?? "UTC";

  await page.goto(`${baseURL}/#/register`);

  await page.getByPlaceholder(/username|用户名/i).fill(username);
  await page.getByPlaceholder(/password(?!.*confirm)|密码/i).first().fill(password);
  await page.getByPlaceholder(/confirm|确认/i).fill(password);

  const prefSelects = page.locator(".preferences-section .n-select");
  // currency select is second in preferences section
  await prefSelects.nth(1).click();
  await page.getByText(new RegExp(currency, "i")).click();
  // timezone select is third
  await prefSelects.nth(2).click();
  await page.getByText(timezone).click();

  await page.getByRole("button", { name: /create|注册|profile/i }).click();
  await expect(page).toHaveURL(/#\/dashboard/);

  return { username, password, currency, timezone };
}

export async function navigateByMenu(page: Page, label: RegExp): Promise<void> {
  await page.getByText(label).first().click();
  await test.step(`navigated to ${label}`, async () => {
    await expect(page.locator("main, .main-layout, .page-container")).toBeVisible();
  });
}

