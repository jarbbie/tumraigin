"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, MapPin, Navigation, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fixtureDataset } from "@/data/fixtures";
import { PlannerShell } from "@/features/planning/PlannerShell";
import { SAVED_LOCATIONS_STORAGE_KEY } from "@/features/locations/constants";
import { validateSavedLocationState } from "@/lib/data/validate-saved-locations";
import { buildDirectionsUrl, haversineMeters, type GeoPoint } from "@/lib/domain/geo";
import type { SavedLocation } from "@/types";

const DEMO_AREA: GeoPoint = { lat: 13.7563, lon: 100.5018 };

type OriginState = {
  point: GeoPoint;
  label: string;
  source: "loading" | "saved" | "demo" | "unavailable" | "invalid";
};

const DEMO_ORIGIN: OriginState = {
  point: DEMO_AREA,
  label: "พื้นที่สาธิต · กรุงเทพฯ",
  source: "loading",
};

function getSelectedLocation(raw: string | null): SavedLocation | null {
  if (raw === null) return null;

  try {
    const state = validateSavedLocationState(JSON.parse(raw) as unknown);
    if (!state || !state.selectedLocationId) return null;
    return state.locations.find((location) => location.id === state.selectedLocationId) ?? null;
  } catch {
    return null;
  }
}

function formatStraightLineDistance(meters: number): string {
  if (meters < 1_000) {
    return `ประมาณ ${new Intl.NumberFormat("th-TH").format(meters)} ม. (ระยะเส้นตรง)`;
  }
  return `ประมาณ ${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 }).format(meters / 1_000)} กม. (ระยะเส้นตรง)`;
}

function resolveStoreProvenance(store: (typeof fixtureDataset.stores)[number]): string {
  if (store.locationSource === "demo") return "พิกัดตัวอย่างในชุดข้อมูล · จุดจำลอง ไม่ใช่สาขาจริง";
  return "ข้อมูลตำแหน่งร้านจาก OpenStreetMap";
}

export function StoreDiscoveryScreen() {
  const [origin, setOrigin] = useState<OriginState>(DEMO_ORIGIN);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let raw: string | null;
      try {
        raw = window.localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      } catch {
        setOrigin({ ...DEMO_ORIGIN, source: "unavailable" });
        return;
      }

      if (raw === null) {
        setOrigin({ ...DEMO_ORIGIN, source: "demo" });
        return;
      }

      const location = getSelectedLocation(raw);
      if (location) {
        setOrigin({
          point: { lat: location.lat, lon: location.lon },
          label: location.label,
          source: "saved",
        });
        return;
      }

      try {
        const validState = validateSavedLocationState(JSON.parse(raw) as unknown);
        setOrigin({ ...DEMO_ORIGIN, source: validState ? "demo" : "invalid" });
      } catch {
        setOrigin({ ...DEMO_ORIGIN, source: "invalid" });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const stores = useMemo(() => fixtureDataset.stores.map((store) => {
    const distanceMeters = origin.source === "loading" ? null : haversineMeters(origin.point, store);
    const directionsUrl = origin.source === "loading" ? null : buildDirectionsUrl(origin.point, store);
    const offers = fixtureDataset.productOffers.filter((offer) => offer.retailerChainId === store.retailerChainId);
    const coveredIngredients = new Set(offers.map((offer) => offer.ingredientId)).size;

    return { store, distanceMeters, directionsUrl, offerCount: offers.length, coveredIngredients };
  }), [origin.point, origin.source]);

  const originNotice = origin.source === "saved"
    ? `ใช้สถานที่ “${origin.label}” ที่เลือกไว้จากรายการในเบราว์เซอร์นี้`
    : origin.source === "unavailable"
      ? "อ่านสถานที่ที่บันทึกไว้ไม่ได้ในเบราว์เซอร์นี้ จึงใช้พื้นที่สาธิตแทน"
      : origin.source === "invalid"
        ? "ข้อมูลสถานที่ที่บันทึกไว้อ่านไม่ได้ จึงใช้พื้นที่สาธิตแทน"
        : origin.source === "loading"
          ? "กำลังตรวจสอบสถานที่ที่เลือกไว้ในเบราว์เซอร์"
          : "ยังไม่มีสถานที่ที่เลือก จึงใช้พื้นที่สาธิตแทน";

  return (
    <PlannerShell
      step={3}
      title="จุดร้านและการเดินทาง"
      description="ดูจุดร้านตัวอย่างใกล้สถานที่ที่เลือก แล้วเปิดลิงก์นำทางเมื่อพร้อม"
    >
      <div className="max-w-5xl space-y-7">
        <section aria-labelledby="origin-heading" className="border-y border-border py-5">
          <div className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 id="origin-heading" className="font-semibold">จุดเริ่มต้น</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground" aria-live="polite">{originNotice}</p>
              {origin.source !== "saved" ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{origin.label}</p>
              ) : null}
              <Button nativeButton={false} render={<Link href="/" />} variant="link" className="mt-2 h-auto px-0 py-1">
                เปลี่ยนหรือเพิ่มสถานที่ <ArrowUpRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="stores-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">ข้อมูลร้านและราคาตัวอย่าง</p>
              <h2 id="stores-heading" className="mt-1 text-xl font-semibold">จุดร้านที่มีในชุดข้อมูล</h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-muted-foreground">รายการนี้แสดงได้แม้แผนที่หรือบริการภายนอกโหลดไม่ได้</p>
          </div>

          {stores.length === 0 ? (
            <div className="border-y border-border py-7">
              <h3 className="font-semibold">ยังไม่มีจุดร้านในชุดข้อมูล</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">คุณยังใช้รายการซื้อของและแผนอาหารได้ตามปกติ</p>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {stores.map(({ store, distanceMeters, directionsUrl, offerCount, coveredIngredients }) => (
                <li key={store.id} className="grid gap-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <article className="min-w-0">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                        <StoreIcon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{store.displayName}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{resolveStoreProvenance(store)}</p>
                        {store.locationSource === "osm" && store.osmUrl ? (
                          <p className="mt-1 text-xs leading-5">
                            <a href={store.osmUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">ดูแหล่งข้อมูล OpenStreetMap</a>
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-3 pl-[3.25rem] text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">ระยะจาก {origin.label}</dt>
                        <dd className="mt-1 font-medium tabular-nums">
                          {origin.source === "loading"
                            ? "กำลังอ่านสถานที่ที่เลือก"
                            : distanceMeters === null
                              ? "พิกัดไม่ถูกต้อง"
                              : formatStraightLineDistance(distanceMeters)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">ราคาที่มีในชุดข้อมูล</dt>
                        <dd className="mt-1 font-medium">{offerCount} รายการ · {coveredIngredients} วัตถุดิบ</dd>
                      </div>
                    </dl>
                    <p className="mt-3 pl-[3.25rem] text-xs leading-5 text-muted-foreground">
                      ราคาทั้งหมดเป็นข้อมูลจำลองระดับชุดข้อมูล และไม่ยืนยันว่าร้านหรือสาขาจริงมีสินค้านี้
                    </p>
                  </article>

                  {origin.source === "loading" ? (
                    <p className="text-sm text-muted-foreground" role="status">กำลังเตรียมลิงก์นำทาง</p>
                  ) : directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Navigation aria-hidden="true" className="size-4" /> เปิดลิงก์นำทาง
                    </a>
                  ) : (
                    <p className="text-sm text-destructive" role="status">ยังสร้างลิงก์นำทางไม่ได้เพราะพิกัดไม่ถูกต้อง</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="border-l-2 border-accent bg-accent/10 px-4 py-3 text-sm leading-6">
          <p className="font-semibold">ข้อจำกัดของข้อมูลตัวอย่าง</p>
          <p className="mt-1 text-muted-foreground">
            จุดร้านนี้เป็นจุดจำลอง ไม่ใช่สาขาจริง และไม่มีข้อมูลสต็อกยืนยัน ระยะทางเป็นเส้นตรงโดยประมาณ ไม่ใช่ระยะทางขับรถหรือเวลาเดินทาง
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            เมื่อกดเปิดลิงก์นำทาง พิกัดต้นทางและปลายทางจะถูกส่งให้ Google Maps เพื่อเปิดเส้นทาง
          </p>
        </aside>

        <Button nativeButton={false} render={<Link href="/shopping-list" />} variant="outline" className="h-10">
          <ArrowLeft aria-hidden="true" /> กลับไปรายการซื้อของ
        </Button>
      </div>
    </PlannerShell>
  );
}
