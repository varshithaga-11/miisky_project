import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Modal } from "../ui/modal";
import { FiSearch, FiLoader } from "react-icons/fi";

// Fix Leaflet default icon (broken in react-leaflet with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bangalore

type NominatimHit = {
  lat: string;
  lon: string;
  display_name: string;
};

function MapInteractiveLayer({
  initialLat,
  initialLng,
  onPositionChange,
  flyTo,
  onFlyConsumed,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
  onPositionChange: (lat: number, lng: number) => void;
  flyTo: { lat: number; lng: number } | null;
  onFlyConsumed: () => void;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const initialPlacedRef = useRef(false);

  const ensureMarker = useCallback(
    (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const m = L.marker([lat, lng], { draggable: true }).addTo(map);
        m.on("dragend", () => {
          const pos = m.getLatLng();
          onPositionChange(pos.lat, pos.lng);
        });
        markerRef.current = m;
      }
      onPositionChange(lat, lng);
    },
    [map, onPositionChange]
  );

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      ensureMarker(lat, lng);
    },
  });

  useEffect(() => {
    if (initialLat == null || initialLng == null || initialPlacedRef.current) return;
    ensureMarker(initialLat, initialLng);
    map.setView([initialLat, initialLng], 13);
    initialPlacedRef.current = true;
  }, [initialLat, initialLng, map, ensureMarker]);

  useEffect(() => {
    if (!flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], 15, { duration: 0.6 });
    ensureMarker(flyTo.lat, flyTo.lng);
    onFlyConsumed();
  }, [flyTo, map, ensureMarker, onFlyConsumed]);

  return null;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialLat,
  initialLng,
}) => {
  const [selectedLat, setSelectedLat] = useState<number | null>(initialLat ?? null);
  const [selectedLng, setSelectedLng] = useState<number | null>(initialLng ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat ?? null);
      setSelectedLng(initialLng ?? null);
      setSearchQuery("");
      setSearchResults([]);
      setSearchOpen(false);
      setFlyTo(null);
    }
  }, [isOpen, initialLat, initialLng]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    searchAbortRef.current?.abort();
    const t = window.setTimeout(async () => {
      const ac = new AbortController();
      searchAbortRef.current = ac;
      setSearchLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6`;
        const res = await fetch(url, {
          signal: ac.signal,
          headers: { "User-Agent": "MiiskyApp/1.0" },
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as NominatimHit[];
        setSearchResults(Array.isArray(data) ? data : []);
        setSearchOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setSearchResults([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(t);
    };
  }, [searchQuery]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const center: [number, number] =
    initialLat != null && initialLng != null ? [initialLat, initialLng] : DEFAULT_CENTER;

  const handleConfirm = useCallback(() => {
    if (selectedLat != null && selectedLng != null) {
      onSelect(selectedLat, selectedLng);
    }
    onClose();
  }, [selectedLat, selectedLng, onSelect, onClose]);

  const clearFlyTo = useCallback(() => setFlyTo(null), []);

  const pickSearchResult = (hit: NominatimHit) => {
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    setFlyTo({ lat, lng });
    setSearchOpen(false);
    setSearchQuery(hit.display_name.split(",").slice(0, 3).join(",").trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl mx-4">
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Select location on map
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Search for a city or area, or click the map to set the pin. Drag the pin to adjust.
        </p>

        <div ref={searchWrapRef} className="relative mb-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30">
            <FiSearch className="text-gray-400 shrink-0" size={18} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder="Search city, neighborhood, or place…"
              className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
              autoComplete="off"
            />
            {searchLoading && <FiLoader className="animate-spin text-blue-500 shrink-0" size={18} />}
          </div>
          {searchOpen && searchResults.length > 0 && (
            <ul className="absolute z-[2000] mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
              {searchResults.map((hit, i) => (
                <li key={`${hit.lat}-${hit.lon}-${i}`}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    onClick={() => pickSearchResult(hit)}
                  >
                    {hit.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <MapContainer
            center={center}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapInteractiveLayer
              initialLat={initialLat}
              initialLng={initialLng}
              onPositionChange={(lat, lng) => {
                setSelectedLat(lat);
                setSelectedLng(lng);
              }}
              flyTo={flyTo}
              onFlyConsumed={clearFlyTo}
            />
          </MapContainer>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedLat == null || selectedLng == null}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm location
          </button>
        </div>
      </div>
    </Modal>
  );
};
