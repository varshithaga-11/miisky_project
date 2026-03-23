import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Modal } from "../ui/modal";

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

function MapClickHandler({
  onMarkerChange,
  initialLat,
  initialLng,
}: {
  onMarkerChange: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const m = L.marker([lat, lng], { draggable: true }).addTo(map);
        m.on("dragend", () => {
          const pos = m.getLatLng();
          onMarkerChange(pos.lat, pos.lng);
        });
        markerRef.current = m;
      }
      onMarkerChange(lat, lng);
    },
  });

  useEffect(() => {
    if (initialLat != null && initialLng != null && map) {
      const m = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      m.on("dragend", () => {
        const pos = m.getLatLng();
        onMarkerChange(pos.lat, pos.lng);
      });
      markerRef.current = m;
    }
  }, [initialLat, initialLng, map, onMarkerChange]);

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

  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat ?? null);
      setSelectedLng(initialLng ?? null);
    }
  }, [isOpen, initialLat, initialLng]);

  const center: [number, number] =
    initialLat != null && initialLng != null ? [initialLat, initialLng] : DEFAULT_CENTER;

  const handleConfirm = useCallback(() => {
    if (selectedLat != null && selectedLng != null) {
      onSelect(selectedLat, selectedLng);
    }
    onClose();
  }, [selectedLat, selectedLng, onSelect, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl mx-4">
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Select location on map
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Click on the map to set the pin. Drag to move it.
        </p>
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
            <MapClickHandler
              onMarkerChange={(lat, lng) => {
                setSelectedLat(lat);
                setSelectedLng(lng);
              }}
              initialLat={initialLat}
              initialLng={initialLng}
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
