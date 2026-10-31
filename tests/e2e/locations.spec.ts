import { expect, test } from "@playwright/test";

test("search and map pin add multiple named places without editable coordinates", async ({ page }) => {
  let photonRequests = 0;
  let releaseStaleSearch: () => void = () => {};
  const staleSearchGate = new Promise<void>((resolve) => {
    releaseStaleSearch = resolve;
  });
  await page.route(/^https:\/\/photon\.komoot\.io\/api\//, async (route) => {
    photonRequests += 1;
    const url = new URL(route.request().url());
    if (url.searchParams.get("q") === "ค้นหาก่อนแตะหมุด") {
      await staleSearchGate;
      await route.fulfill({
        contentType: "application/geo+json",
        body: JSON.stringify({
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: { type: "Point", coordinates: [100.5, 13.7] },
            properties: { osm_type: "node", osm_id: "late-result", name: "ผลค้นหาที่มาช้า" },
          }],
        }),
      });
      return;
    }
    if (url.searchParams.get("q") === "ค้นหาสถานที่ที่ใช้ทดสอบไม่ได้") {
      await route.fulfill({ status: 503, body: "Photon temporarily unavailable" });
      return;
    }
    expect(url.searchParams.get("q")).toBe("ตลาดวโรรส");
    await route.fulfill({
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
    });
  });
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "ตัวช่วยการวางแผนทำอาหารกินเองของคุณ" })).toBeVisible();
  await expect(page.getByRole("region", { name: "แผนที่เลือกสถานที่" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "เพิ่มสถานที่" })).toBeVisible();
  await expect(page.getByText("หรือปักหมุดบนแผนที่")).toBeVisible();
  await expect(page.locator('input[type="number"]')).toHaveCount(0);
  await expect(page.getByLabel("ละติจูด")).toHaveCount(0);
  await expect(page.getByLabel("ลองจิจูด")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  await page.getByLabel("ค้นหาชื่อสถานที่").fill("ตลาดวโรรส");
  expect(photonRequests).toBe(0);
  await page.getByRole("button", { name: "ค้นหา" }).click();
  await expect(page.getByRole("button", { name: /เลือก ตลาดวโรรส, เชียงใหม่ · ประเทศไทย/ })).toBeVisible();
  expect(photonRequests).toBe(1);
  await page.getByRole("button", { name: /เลือก ตลาดวโรรส/ }).click();
  await expect(page.getByLabel("ชื่อในรายการ")).toHaveValue("ตลาดวโรรส");
  await page.getByRole("button", { name: "บันทึกสถานที่" }).click();

  const savedPlaces = page.getByRole("list", { name: "สถานที่ของฉัน" });
  await expect(savedPlaces.getByRole("listitem")).toHaveCount(1);
  await expect(savedPlaces).toContainText("ตลาดวโรรส");

  const map = page.getByRole("region", { name: "แผนที่เลือกสถานที่" });
  const mapBounds = await map.boundingBox();
  if (!mapBounds) throw new Error("Map region has no visible bounds.");
  await map.click({ position: { x: mapBounds.width / 2, y: mapBounds.height / 2 } });
  await expect(page.getByText("เลือกจุดบนแผนที่แล้ว")).toBeVisible();
  await page.getByLabel("ชื่อในรายการ").fill("บ้าน");
  await page.getByRole("button", { name: "บันทึกสถานที่" }).click();
  await expect(savedPlaces.getByRole("listitem")).toHaveCount(2);
  await expect(savedPlaces).not.toContainText(/\d{2,}\.\d{3,}/);

  const staleRequest = page.waitForRequest((request) =>
    new URL(request.url()).searchParams.get("q") === "ค้นหาก่อนแตะหมุด",
  );
  await page.getByLabel("ค้นหาชื่อสถานที่").fill("ค้นหาก่อนแตะหมุด");
  expect(photonRequests).toBe(1);
  await page.getByRole("button", { name: "ค้นหา" }).click();
  await staleRequest;
  await page.getByRole("button", { name: "เลือกตำแหน่งตรงกลางแผนที่" }).click();
  releaseStaleSearch();
  await expect(page.getByText("เลือกจุดบนแผนที่แล้ว")).toBeVisible();
  await expect(page.getByRole("heading", { name: /ผลค้นหาสำหรับ/ })).toHaveCount(0);
  expect(photonRequests).toBe(2);

  const searchedPlace = savedPlaces.getByRole("listitem")
    .filter({ hasText: "ตลาดวโรรส" })
    .getByRole("button", { name: /^ตลาดวโรรส(?: เลือกอยู่)?$/ });
  await searchedPlace.click();
  await expect(searchedPlace).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("list", { name: "สถานที่ของฉัน" }).getByRole("listitem")).toHaveCount(2);
  await expect(page.getByRole("list", { name: "สถานที่ของฉัน" }).getByRole("listitem")
    .filter({ hasText: "ตลาดวโรรส" }).getByRole("button", { name: /^ตลาดวโรรส(?: เลือกอยู่)?$/ }))
    .toHaveAttribute("aria-pressed", "true");

  const centerPin = page.getByRole("button", { name: "เลือกตำแหน่งตรงกลางแผนที่" });
  await centerPin.focus();
  await centerPin.press("Enter");
  await expect(page.getByText("เลือกจุดบนแผนที่แล้ว")).toBeVisible();

  await page.getByLabel("ค้นหาชื่อสถานที่").fill("ค้นหาสถานที่ที่ใช้ทดสอบไม่ได้");
  expect(photonRequests).toBe(2);
  await page.getByRole("button", { name: "ค้นหา" }).click();
  await expect(page.getByText("ค้นหาไม่สำเร็จ ลองใหม่หรือแตะแผนที่เพื่อวางหมุด", { exact: true })).toBeVisible();
  expect(photonRequests).toBe(3);
  await centerPin.click();
  await expect(page.getByText("เลือกจุดบนแผนที่แล้ว")).toBeVisible();

  const homePlace = savedPlaces.getByRole("listitem").filter({ hasText: "บ้าน" });
  await homePlace.getByRole("button", { name: "เปลี่ยนชื่อ บ้าน" }).click();
  await page.getByLabel("ชื่อใหม่สำหรับ บ้าน").fill("บ้านใกล้ตลาด");
  await homePlace.getByRole("button", { name: "บันทึกชื่อ" }).click();
  await expect(savedPlaces).toContainText("บ้านใกล้ตลาด");
  await savedPlaces.getByRole("listitem").filter({ hasText: "บ้านใกล้ตลาด" })
    .getByRole("button", { name: "ลบ บ้านใกล้ตลาด" }).click();
  await expect(savedPlaces.getByRole("listitem")).toHaveCount(1);

  await page.getByRole("button", { name: "ล้างทั้งหมด" }).click();
  await page.getByRole("group", { name: "ยืนยันล้างสถานที่ทั้งหมด" })
    .getByRole("button", { name: "ลบทั้งหมด" }).click();
  await expect(savedPlaces.getByRole("listitem")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("list", { name: "สถานที่ของฉัน" }).getByRole("listitem")).toHaveCount(0);
});
