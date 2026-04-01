/**
 * deviceCategoryIcons.ts
 * Central registry of all available medical device category icons.
 */

export interface DeviceIcon {
  value: string;       // stored in DB (icon_class field)
  label: string;       // displayed in dropdown
  src: string;         // public path to the SVG
}

export const DEVICE_CATEGORY_ICONS: DeviceIcon[] = [
  { value: "device-wearables",   label: "Wearables",   src: "/website/assets/images/device-icons/wearables.svg" },
  { value: "device-kiosks",      label: "Kiosks",      src: "/website/assets/images/device-icons/kiosks.svg" },
  { value: "device-ventilators", label: "Ventilators", src: "/website/assets/images/device-icons/ventilators.svg" },
  { value: "device-scanners",    label: "Scanners",    src: "/website/assets/images/device-icons/scanners.svg" },
  { value: "device-monitors",    label: "Monitors",    src: "/website/assets/images/device-icons/monitors.svg" },
  { value: "device-general",     label: "General Device", src: "/website/assets/images/device-icons/devices.svg" },
];

/**
 * Given an icon_class value, returns the matching icon object.
 * Falls back to the general device icon if not found.
 */
export function getDeviceCategoryIcon(iconClass: string): DeviceIcon {
  return (
    DEVICE_CATEGORY_ICONS.find((icon) => icon.value === iconClass) ??
    DEVICE_CATEGORY_ICONS[DEVICE_CATEGORY_ICONS.length - 1]
  );
}
