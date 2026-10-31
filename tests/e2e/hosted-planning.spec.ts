import { expect, test } from "@playwright/test";

test("map-first planning journey reaches a calculated shopping list", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route(/^https:\/\/photon\.komoot\.io\/api\//, (route) =>
    route.fulfill({
      contentType: "application/geo+json",
      body: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [98.9961, 18.7907] },
            properties: {
              osm_type: "node",
              osm_id: "12345",
              name: "ตลาดวโรรส",
              city: "เชียงใหม่",
              country: "ประเทศไทย",
            },
          },
        ],
      }),
    }),
  );
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "ตัวช่วยการวางแผนทำอาหารกินเองของคุณ" })).toBeVisible();

  const map = page.getByRole("region", { name: "แผนที่เลือกสถานที่" });
  await expect(map).toBeVisible();
  await expect(page.getByText("โหลดแผนที่ไม่ครบ — ยังค้นหาชื่อสถานที่ เลือกจากรายการที่บันทึก หรือใช้พื้นที่สาธิตได้")).toBeVisible();
  await expect(page.getByLabel("ละติจูด")).toHaveCount(0);
  await expect(page.getByLabel("ลองจิจูด")).toHaveCount(0);
  await page.getByLabel("ค้นหาชื่อสถานที่").fill("ตลาดวโรรส");
  await page.getByRole("button", { name: "ค้นหา" }).click();
  await page.getByRole("button", { name: /เลือก ตลาดวโรรส/ }).click();
  await expect(page.getByLabel("ชื่อในรายการ")).toHaveValue("ตลาดวโรรส");
  await page.getByRole("button", { name: "บันทึกสถานที่" }).click();
  const savedLocation = page.getByRole("list", { name: "สถานที่ของฉัน" })
    .getByRole("listitem").filter({ hasText: "ตลาดวโรรส" })
    .getByRole("button", { name: /^ตลาดวโรรส(?: เลือกอยู่)?$/ });
  await expect(savedLocation).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.getByRole("list", { name: "สถานที่ของฉัน" })
    .getByRole("listitem").filter({ hasText: "ตลาดวโรรส" })
    .getByRole("button", { name: /^ตลาดวโรรส(?: เลือกอยู่)?$/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /ต่อไป.*ตั้งความชอบ/ }).click();

  await expect(page.getByRole("heading", { name: "อยากให้แผนอาหารคำนึงถึงอะไรบ้าง?" })).toBeVisible();
  await page.getByRole("button", { name: "ข้ามไปดูเมนูทั้งหมด" }).click();
  const meals = page.getByRole("list", { name: "เมนูตามผลคำนวณ" });
  await expect(meals.getByRole("listitem")).toHaveCount(8);

  const eggMeal = meals.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "ข้าวผัดไข่ใบกะเพรา" }),
  });
  await eggMeal.getByRole("button", { name: "ดูรายละเอียดเมนู" }).click();
  await expect(page.getByRole("heading", { name: "ข้าวผัดไข่ใบกะเพรา", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ที่มาของข้อมูลโภชนาการ" })).toBeVisible();
  await page.getByRole("button", { name: /เลือกเมนูนี้เป็นแผน/ }).click();

  await expect(page.getByRole("heading", { name: "ของที่ต้องซื้อสำหรับแผนนี้" })).toBeVisible();
  const riceRow = page.getByRole("listitem").filter({ hasText: "ข้าวหอมมะลิ (ดิบ)" });
  const ricePantryInput = page.getByRole("spinbutton", { name: /ปริมาณข้าวหอมมะลิ/ });
  await ricePantryInput.fill("100");
  await ricePantryInput.press("Tab");
  await expect(riceRow.getByText("20 g", { exact: true })).toBeVisible();
  await expect(riceRow).toContainText("1 แพ็ก");
  await expect(riceRow).toContainText("เหลือหลังทำ 980 g");
  await expect(page.getByText("฿160.00", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
