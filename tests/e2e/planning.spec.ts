import { expect, test } from "@playwright/test";

test("filters meal choices and recalculates the shopping list from pantry amounts", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("preferences/");
  await page.getByRole("checkbox", { name: "ไม่เอาเมนูที่มีหมู" }).check();
  await page.getByRole("button", { name: "ใช้ความชอบนี้แล้วดูเมนู" }).click();

  const meals = page.getByRole("list", { name: "เมนูตามผลคำนวณ" });
  await expect(page.getByRole("heading", { name: "เลือกเมนูที่อยากทำ" })).toBeVisible();
  await expect(meals.getByRole("listitem")).toHaveCount(6);
  await expect(meals).not.toContainText("ข้าวกะเพราหมู");

  const eggMeal = meals.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "ข้าวผัดไข่ใบกะเพรา" }),
  });
  await expect(eggMeal).toBeVisible();
  await eggMeal.getByRole("button", { name: "ดูรายละเอียดเมนู" }).click();

  await expect(page.getByRole("heading", { name: "ข้าวผัดไข่ใบกะเพรา", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ที่มาของข้อมูลโภชนาการ" })).toBeVisible();
  await expect(page.getByText("ข้าวหอมมะลิ (ดิบ) · FDC #169756")).toBeVisible();
  await expect(page.getByText("USDA FDC SR Legacy · proxy · Basil, fresh")).toBeVisible();
  await page.getByRole("button", { name: /เลือกเมนูนี้เป็นแผน/ }).click();

  await expect(page.getByRole("heading", { name: "ของที่ต้องซื้อสำหรับแผนนี้" })).toBeVisible();
  const riceRow = page.getByRole("listitem").filter({ hasText: "ข้าวหอมมะลิ (ดิบ)" });
  await expect(riceRow.getByText("120 g", { exact: true })).toHaveCount(2);

  const ricePantryInput = page.getByRole("spinbutton", { name: /ปริมาณข้าวหอมมะลิ/ });
  await ricePantryInput.fill("100");
  await ricePantryInput.press("Tab");
  await expect(riceRow.getByText("20 g", { exact: true })).toBeVisible();
  await expect(riceRow).toContainText("1 แพ็ก");
  await expect(riceRow).toContainText("เหลือหลังทำ 980 g");
  await expect(page.getByText("฿160.00", { exact: true })).toBeVisible();

  await ricePantryInput.fill("120");
  await ricePantryInput.press("Tab");
  await expect(riceRow).toContainText("มีพอแล้ว ไม่ต้องซื้อ");
  await expect(page.getByText("฿105.00", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
