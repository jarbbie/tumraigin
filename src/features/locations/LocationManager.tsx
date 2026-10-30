"use client";

import dynamic from "next/dynamic";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SavedLocation, SavedLocationState } from "@/types";
import { validateSavedLocationState } from "@/lib/data/validate-saved-locations";
import { SAVED_LOCATIONS_STORAGE_KEY } from "./constants";

type Coordinate = { lat: number; lon: number };
type PersistenceMode = "loading" | "ready" | "unavailable" | "invalid" | "failed";
type TileStatus = "loading" | "ready" | "failed";

const LocationMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="tm-map tm-map--loading" role="status" aria-label="กำลังเปิดแผนที่">
      กำลังเปิดแผนที่…
    </div>
  ),
});

const DEMO_AREA: Coordinate = { lat: 13.7563, lon: 100.5018 };
const EMPTY_STATE: SavedLocationState = {
  version: 1,
  locations: [],
  selectedLocationId: null,
};

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

function readCoordinatePair(latitude: string, longitude: string): Coordinate | null {
  if (!latitude.trim() || !longitude.trim()) return null;
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }
  return { lat, lon };
}

function getPersistenceMessage(mode: PersistenceMode): string {
  switch (mode) {
    case "loading":
      return "กำลังอ่านสถานที่ที่บันทึกไว้ในเบราว์เซอร์";
    case "ready":
      return "สถานที่ที่บันทึกไว้จะอยู่ในเบราว์เซอร์นี้เท่านั้น";
    case "unavailable":
      return "เบราว์เซอร์ปิดการบันทึกไว้ สถานที่ยังใช้ได้ในหน้าต่างนี้";
    case "invalid":
      return "อ่านรายการเดิมไม่ได้ เลือกล้างรายการที่เสียหายเพื่อเริ่มบันทึกใหม่";
    case "failed":
      return "บันทึกลงเบราว์เซอร์ไม่ได้ สถานที่นี้จะอยู่จนกว่าจะปิดหรือโหลดหน้าใหม่";
  }
}

export function LocationManager() {
  const [savedState, setSavedState] = useState<SavedLocationState>(EMPTY_STATE);
  const [storageMode, setStorageMode] = useState<PersistenceMode>("loading");
  const [hydrated, setHydrated] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [label, setLabel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [tileStatus, setTileStatus] = useState<TileStatus>("loading");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let raw: string | null;
      try {
        raw = window.localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      } catch {
        setStorageMode("unavailable");
        setHydrated(true);
        return;
      }

      if (raw === null) {
        setStorageMode("ready");
        setHydrated(true);
        return;
      }

      try {
        const parsed: unknown = JSON.parse(raw);
        const validated = validateSavedLocationState(parsed);
        if (!validated) {
          setStorageMode("invalid");
        } else {
          setSavedState(validated);
          setStorageMode("ready");
        }
      } catch {
        setStorageMode("invalid");
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || storageMode !== "ready") return;
    try {
      window.localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(savedState));
    } catch {
      queueMicrotask(() => setStorageMode("failed"));
    }
  }, [hydrated, savedState, storageMode]);

  const selectedLocation = useMemo(
    () => savedState.locations.find((location) => location.id === savedState.selectedLocationId) ?? null,
    [savedState.locations, savedState.selectedLocationId],
  );
  const coordinatesForDraft = readCoordinatePair(latitude, longitude);
  const mapCenter = coordinatesForDraft ?? selectedLocation ?? DEMO_AREA;

  function setCoordinates(point: Coordinate) {
    setLatitude(formatCoordinate(point.lat));
    setLongitude(formatCoordinate(point.lon));
    setFormError(null);
  }

  function updateCoordinates(nextLatitude: string, nextLongitude: string) {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    setFormError(null);
  }

  function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = label.trim();
    const coordinates = readCoordinatePair(latitude, longitude);

    if (!name) {
      setFormError("ใส่ชื่อสถานที่ก่อนบันทึก เช่น บ้านหรือที่ทำงาน");
      return;
    }
    if (name.length > 80) {
      setFormError("ชื่อสถานที่ยาวได้ไม่เกิน 80 ตัวอักษร");
      return;
    }
    if (!coordinates) {
      setFormError("ใส่ละติจูดระหว่าง −90 ถึง 90 และลองจิจูดระหว่าง −180 ถึง 180");
      return;
    }

    const location: SavedLocation = {
      id: window.crypto.randomUUID(),
      label: name,
      ...coordinates,
    };
    setSavedState((current) => ({
      ...current,
      locations: [...current.locations, location],
      selectedLocationId: location.id,
    }));
    setLabel("");
    setLatitude("");
    setLongitude("");
    setFormError(null);
  }

  function selectLocation(locationId: string) {
    setSavedState((current) => ({ ...current, selectedLocationId: locationId }));
    setLatitude("");
    setLongitude("");
    setFormError(null);
  }

  function startEditing(location: SavedLocation) {
    setEditingId(location.id);
    setEditingLabel(location.label);
    setEditError(null);
  }

  function renameLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextLabel = editingLabel.trim();
    if (!nextLabel || nextLabel.length > 80 || !editingId) {
      setEditError("กรอกชื่อไม่เกิน 80 ตัวอักษร");
      return;
    }
    setSavedState((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === editingId ? { ...location, label: nextLabel } : location,
      ),
    }));
    setEditingId(null);
    setEditingLabel("");
    setEditError(null);
  }

  function deleteLocation(locationId: string) {
    setSavedState((current) => ({
      version: 1,
      locations: current.locations.filter((location) => location.id !== locationId),
      selectedLocationId: current.selectedLocationId === locationId ? null : current.selectedLocationId,
    }));
    if (editingId === locationId) setEditingId(null);
  }

  function clearLocations() {
    setSavedState(EMPTY_STATE);
    setEditingId(null);
    setConfirmClear(false);
    if (storageMode === "invalid") setStorageMode("ready");
  }

  function useDemoArea() {
    setSavedState((current) => ({ ...current, selectedLocationId: null }));
    setLatitude("");
    setLongitude("");
    setFormError(null);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)] lg:items-start">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight" id="map-heading">เลือกตำแหน่งบนแผนที่</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                แตะแผนที่เพื่อปักหมุด หรือกรอกพิกัดด้านล่าง
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                ข้อมูลแผนที่: <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a>
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={useDemoArea}>
              <MapPin aria-hidden="true" /> ใช้พื้นที่สาธิต
            </Button>
          </div>

          <div className="tm-map-frame">
            <LocationMap
              center={mapCenter}
              locations={savedState.locations}
              draft={coordinatesForDraft}
              selectedLocationId={savedState.selectedLocationId}
              onPointSelected={setCoordinates}
              onSavedLocationSelected={selectLocation}
              onTileStatusChange={setTileStatus}
            />
            <div className="tm-map-caption" aria-hidden="true">
              {coordinatesForDraft
                ? "ตำแหน่งที่กำลังเพิ่ม"
                : selectedLocation
                  ? `กำลังเลือก · ${selectedLocation.label}`
                  : "เริ่มต้นที่พื้นที่สาธิต · กรุงเทพฯ"}
            </div>
          </div>

          {tileStatus === "failed" ? (
            <p className="tm-map-notice" role="status">
              โหลดแผนที่ไม่ครบ — เลือกสถานที่ที่บันทึกไว้ หรือกรอกพิกัดได้ตามปกติ
            </p>
          ) : tileStatus === "loading" ? (
            <p className="text-sm text-muted-foreground" role="status">กำลังโหลดแผนที่</p>
          ) : null}
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            ผู้ให้บริการแผนที่จะเห็นบริเวณที่เปิดดู สถานที่ที่บันทึกจะไม่ถูกส่งไปยังเซิร์ฟเวอร์ของทำไรกิน
          </p>
        </div>

        <aside className="space-y-5 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <form className="space-y-4" onSubmit={saveLocation} aria-labelledby="add-location-heading">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold" id="add-location-heading">เพิ่มสถานที่</h2>
              <p className="text-sm leading-6 text-muted-foreground">ตั้งชื่อแล้วบันทึกไว้ใช้ครั้งหน้า</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-name">ชื่อสถานที่</Label>
              <Input
                id="location-name"
                value={label}
                maxLength={80}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="เช่น บ้าน ที่ทำงาน"
                aria-describedby="location-name-note"
                className="h-10 bg-card"
              />
              <p id="location-name-note" className="text-xs leading-5 text-muted-foreground">
                พิกัดของจุดที่เลือกด้านล่าง
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="location-latitude">ละติจูด</Label>
                <Input
                  id="location-latitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(event) => updateCoordinates(event.target.value, longitude)}
                  placeholder="13.756300"
                  aria-invalid={Boolean(latitude && (Number(latitude) < -90 || Number(latitude) > 90))}
                  className="h-10 bg-card tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-longitude">ลองจิจูด</Label>
                <Input
                  id="location-longitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(event) => updateCoordinates(latitude, event.target.value)}
                  placeholder="100.501800"
                  aria-invalid={Boolean(longitude && (Number(longitude) < -180 || Number(longitude) > 180))}
                  className="h-10 bg-card tabular-nums"
                />
              </div>
            </div>

            {formError ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
            <Button type="submit" className="h-10 w-full" disabled={storageMode === "loading" || storageMode === "invalid"}>
              บันทึกสถานที่
            </Button>
          </form>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold" id="saved-locations-heading">สถานที่ของฉัน</h2>
              {savedState.locations.length > 0 && !confirmClear ? (
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmClear(true)}>
                  ล้างทั้งหมด
                </Button>
              ) : null}
            </div>

            <p className="mt-1 text-sm leading-6 text-muted-foreground" aria-live="polite">
              {getPersistenceMessage(storageMode)}
            </p>

            {storageMode === "invalid" ? (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={clearLocations}>
                ล้างรายการที่อ่านไม่ได้
              </Button>
            ) : null}

            {confirmClear ? (
              <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3" role="group" aria-label="ยืนยันล้างสถานที่ทั้งหมด">
                <p className="text-sm">ลบสถานที่ที่บันทึกไว้ทั้งหมดหรือไม่?</p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant="destructive" size="sm" onClick={clearLocations}>ลบทั้งหมด</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirmClear(false)}>ยกเลิก</Button>
                </div>
              </div>
            ) : null}

            {savedState.locations.length === 0 ? (
              <p className="mt-4 border-t border-border py-4 text-sm leading-6 text-muted-foreground">
                ยังไม่มีสถานที่ แตะแผนที่หรือกรอกพิกัดเพื่อเพิ่มจุดแรก
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border" aria-labelledby="saved-locations-heading">
                {savedState.locations.map((location) => {
                  const selected = location.id === savedState.selectedLocationId;
                  return (
                    <li key={location.id} className={`py-3 ${selected ? "tm-saved-place--selected" : ""}`}>
                      {editingId === location.id ? (
                        <form onSubmit={renameLocation} className="space-y-2">
                          <Label htmlFor={`rename-${location.id}`}>ชื่อใหม่สำหรับ {location.label}</Label>
                          <Input
                            id={`rename-${location.id}`}
                            value={editingLabel}
                            maxLength={80}
                            onChange={(event) => setEditingLabel(event.target.value)}
                            className="h-9 bg-card"
                          />
                          {editError ? <p className="text-sm text-destructive" role="alert">{editError}</p> : null}
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">บันทึกชื่อ</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>ยกเลิก</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto w-full justify-start px-2 py-2 text-left"
                            aria-pressed={selected}
                            onClick={() => selectLocation(location.id)}
                          >
                            <MapPin aria-hidden="true" className={selected ? "text-primary" : "text-muted-foreground"} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{location.label}</span>
                              <span className="mt-0.5 block text-xs font-normal tabular-nums text-muted-foreground">
                                {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
                              </span>
                            </span>
                            {selected ? <span className="text-xs font-medium text-primary">เลือกอยู่</span> : null}
                          </Button>
                          <div className="flex gap-1 pl-2">
                            <Button type="button" size="sm" variant="ghost" onClick={() => startEditing(location)} aria-label={`เปลี่ยนชื่อ ${location.label}`}>
                              <Pencil aria-hidden="true" /> เปลี่ยนชื่อ
                            </Button>
                            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteLocation(location.id)} aria-label={`ลบ ${location.label}`}>
                              <Trash2 aria-hidden="true" /> ลบ
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </section>

      <p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
        หมุดนี้คือสถานที่ที่คุณเลือก ไม่ใช่ร้านค้าหรือข้อมูลว่าสาขามีสินค้า
      </p>
    </div>
  );
}
