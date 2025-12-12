import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { baseURL, isDevServerReachable, hasWailsRuntime } from "./helpers";

let reachable = false;

test.beforeAll(async ({ request }) => {
  reachable = await isDevServerReachable(request);
});

test("invoice flow: select time entries, export pdf, trigger send", async ({
  page,
}) => {
  test.skip(!reachable, "dev server not running at baseURL");
  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for auth/export");

  await page.goto(baseURL);

  // navigate to invoices (menu item text)
  await page.getByText(/invoices/i).first().click();

  // open entry selector for first row
  const firstRow = page.locator(".invoice-table").getByRole("row").nth(1);
  await firstRow.getByRole("button").nth(1).click(); // edit/select entries

  // select first available time entry if any
  const rows = page.locator(".n-data-table-tbody .n-data-table-tr");
  if (await rows.count()) {
    await rows.first().click();
  }

  // apply selection
  await page.getByRole("button", { name: /apply/i }).click();

  // download PDF, assert filename and header
  await firstRow.getByRole("button").first().click();
  const exportBtn = page.getByRole("button", { name: /export pdf/i });
  if (await exportBtn.isVisible()) {
    const downloadPromise = page.waitForEvent("download");
    await exportBtn.click();
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toMatch(/^INV-.*\.pdf$/);
    const path = await download.path();
    if (path) {
      const file = await readFile(path);
      await expect(file.subarray(0, 4).toString()).toBe("%PDF");
    }
  }

  // trigger send
  await firstRow.getByRole("button").nth(2).click();

  // basic assertion: no error toast
  await expect(page.locator(".n-message__content").first()).not.toContainText(
    /error/i,
    { timeout: 2000 }
  );
});
