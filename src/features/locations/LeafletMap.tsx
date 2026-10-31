"use client";

import { useEffect, useRef } from "react";
import * as L from "leaflet";
import type { SavedLocation } from "@/types";

type Coordinate = { lat: number; lon: number };

type LeafletMapProps = {
  center: Coordinate;
  locations: SavedLocation[];
  draft: Coordinate | null;
  selectedLocationId: string | null;
  onPointSelected: (point: Coordinate) => void;
  onSavedLocationSelected: (locationId: string) => void;
  onTileStatusChange: (status: "loading" | "ready" | "failed") => void;
};

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

function pinIcon(selected: boolean, draft: boolean): L.DivIcon {
  const tone = draft ? "draft" : selected ? "selected" : "saved";
  return L.divIcon({
    className: `tumraigin-map-pin tumraigin-map-pin--${tone}`,
    html: '<span class="tumraigin-map-pin__shape"></span>',
    iconSize: [28, 38],
    iconAnchor: [14, 36],
  });
}

export default function LeafletMap({
  center,
  locations,
  draft,
  selectedLocationId,
  onPointSelected,
  onSavedLocationSelected,
  onTileStatusChange,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const onPointSelectedRef = useRef(onPointSelected);
  const onSavedLocationSelectedRef = useRef(onSavedLocationSelected);
  const onTileStatusChangeRef = useRef(onTileStatusChange);

  useEffect(() => {
    onPointSelectedRef.current = onPointSelected;
    onSavedLocationSelectedRef.current = onSavedLocationSelected;
    onTileStatusChangeRef.current = onTileStatusChange;
  }, [onPointSelected, onSavedLocationSelected, onTileStatusChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [center.lat, center.lon],
      zoom: 12,
      minZoom: 3,
      maxZoom: 19,
      keyboard: true,
      zoomControl: false,
      attributionControl: true,
    });
    mapRef.current = map;
    L.control.zoom({ position: "topright" }).addTo(map);

    const pinCenterControl = new L.Control({ position: "bottomleft" });
    pinCenterControl.onAdd = () => {
      const button = L.DomUtil.create("button", "tm-map-pin-center");
      button.type = "button";
      button.textContent = "ปักหมุดกลางแผนที่";
      button.setAttribute("aria-label", "เลือกตำแหน่งตรงกลางแผนที่");
      button.title = "เลือกตำแหน่งตรงกลางแผนที่";
      L.DomEvent.disableClickPropagation(button);
      L.DomEvent.disableScrollPropagation(button);
      L.DomEvent.on(button, "click", () => {
        const mapCenter = map.getCenter();
        onPointSelectedRef.current({ lat: mapCenter.lat, lon: mapCenter.lng });
      });
      return button;
    };
    pinCenterControl.addTo(map);

    const tiles = L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
      keepBuffer: 0,
      updateWhenIdle: true,
      updateWhenZooming: false,
    }).addTo(map);
    const markers = L.layerGroup().addTo(map);
    markerLayerRef.current = markers;

    const onTileLoad = () => onTileStatusChangeRef.current("ready");
    const onTileError = () => onTileStatusChangeRef.current("failed");
    const onMapClick = (event: L.LeafletMouseEvent) => {
      onPointSelectedRef.current({ lat: event.latlng.lat, lon: event.latlng.lng });
    };

    tiles.on("tileload", onTileLoad);
    tiles.on("tileerror", onTileError);
    map.on("click", onMapClick);
    onTileStatusChangeRef.current("loading");

    const resizeFrame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => {
      window.cancelAnimationFrame(resizeFrame);
      tiles.off("tileload", onTileLoad);
      tiles.off("tileerror", onTileError);
      map.off("click", onMapClick);
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
    // The map is created once; center changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([center.lat, center.lon], Math.max(map.getZoom(), 13), { duration: 0.35 });
  }, [center.lat, center.lon]);

  useEffect(() => {
    const markerLayer = markerLayerRef.current;
    if (!markerLayer) return;

    markerLayer.clearLayers();
    for (const location of locations) {
      const selected = location.id === selectedLocationId;
      L.marker([location.lat, location.lon], {
        icon: pinIcon(selected, false),
        title: `${location.label}${selected ? " · สถานที่ที่เลือก" : " · สถานที่ที่บันทึกไว้"}`,
        alt: location.label,
        riseOnHover: true,
      })
        .on("click", () => onSavedLocationSelectedRef.current(location.id))
        .addTo(markerLayer);
    }

    if (draft) {
      L.marker([draft.lat, draft.lon], {
        icon: pinIcon(false, true),
        title: "ตำแหน่งที่กำลังเพิ่ม",
        alt: "ตำแหน่งที่กำลังเพิ่ม",
        keyboard: false,
      }).addTo(markerLayer);
    }
  }, [draft, locations, selectedLocationId]);

  return <div ref={containerRef} className="tm-map" role="region" aria-label="แผนที่เลือกสถานที่" />;
}
