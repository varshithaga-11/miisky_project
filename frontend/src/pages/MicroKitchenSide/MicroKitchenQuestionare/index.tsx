import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMapPin } from "react-icons/fi";
import { getMyMicroKitchenProfile, MicroKitchenProfile, saveMyMicroKitchenProfile } from "./api";
import { MapLocationPicker } from "../../../components/common/MapLocationPicker";

export default function MicroKitchenQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [data, setData] = useState<Partial<MicroKitchenProfile> & { user_details?: { address?: string; city?: string; state?: string; country?: string } }>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyMicroKitchenProfile();
        setData(res || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load micro kitchen profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (key: keyof MicroKitchenProfile, value: any) => setData((p) => ({ ...p, [key]: value }));

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setField("latitude", pos.coords.latitude);
        setField("longitude", pos.coords.longitude);
        toast.success("Location captured");
        setLocationLoading(false);
      },
      () => {
        toast.error("Could not get location. Check permissions.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleGetFromAddress = async () => {
    const ud = data.user_details;
    const addr = ud?.address || "";
    const query = [addr, ud?.city, ud?.state, ud?.country].filter(Boolean).join(", ");
    if (!query.trim()) {
      toast.error("Update your address in Profile first (Profile Settings)");
      return;
    }
    setLocationLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { "User-Agent": "MiiskyApp/1.0" } }
      );
      const result = await res.json();
      if (result?.[0]) {
        setField("latitude", parseFloat(result[0].lat));
        setField("longitude", parseFloat(result[0].lon));
        toast.success("Coordinates from address");
      } else {
        toast.error("Address not found. Try a more complete address in Profile.");
      }
    } catch {
      toast.error("Could not get coordinates");
    } finally {
      setLocationLoading(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await saveMyMicroKitchenProfile(data);
      toast.success("Saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Micro Kitchen Questionnaire" description="Micro kitchen questionnaire" />
      <PageBreadcrumb pageTitle="Micro Kitchen Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand_name">Brand name</Label>
              <Input id="brand_name" value={data.brand_name || ""} onChange={(e) => setField("brand_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="kitchen_code">Kitchen code</Label>
              <Input id="kitchen_code" value={data.kitchen_code || ""} onChange={(e) => setField("kitchen_code", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="fssai_no">FSSAI no</Label>
              <Input id="fssai_no" value={data.fssai_no || ""} onChange={(e) => setField("fssai_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pan_no">PAN no</Label>
              <Input id="pan_no" value={data.pan_no || ""} onChange={(e) => setField("pan_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gst_no">GST no</Label>
              <Input id="gst_no" value={data.gst_no || ""} onChange={(e) => setField("gst_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bank_name">Bank name</Label>
              <Input id="bank_name" value={data.bank_name || ""} onChange={(e) => setField("bank_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="acc_no">Account no</Label>
              <Input id="acc_no" value={data.acc_no || ""} onChange={(e) => setField("acc_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ifsc_code">IFSC code</Label>
              <Input id="ifsc_code" value={data.ifsc_code || ""} onChange={(e) => setField("ifsc_code", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cuisine_type">Cuisine type</Label>
              <Input id="cuisine_type" value={data.cuisine_type || ""} onChange={(e) => setField("cuisine_type", e.target.value)} placeholder="South Indian,North Indian,etc" />
            </div>
            <div>
              <Label htmlFor="meal_type">Meal type</Label>
              <Input id="meal_type" value={data.meal_type || ""} onChange={(e) => setField("meal_type", e.target.value)} placeholder="Breakfast,Lunch,Dinner,etc" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kitchen_area">Kitchen area (sq.ft)</Label>
              <Input id="kitchen_area" type="number" value={data.kitchen_area ?? ""} onChange={(e) => setField("kitchen_area", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="platform_area">Platform area (sq.ft)</Label>
              <Input id="platform_area" type="number" value={data.platform_area ?? ""} onChange={(e) => setField("platform_area", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="water_source">Water source</Label>
              <Input id="water_source" value={data.water_source || ""} onChange={(e) => setField("water_source", e.target.value)} placeholder="borewell/cmc/municipal" />
            </div>
            <div>
              <Label htmlFor="purification_type">Purification type</Label>
              <Select
                value={data.purification_type || ""}
                onChange={(val) => setField("purification_type", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "ro", label: "RO" },
                  { value: "uv", label: "UV" },
                  { value: "ionized", label: "Ionized" },
                  { value: "none", label: "None" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="no_of_water_taps">No of water taps</Label>
              <Input id="no_of_water_taps" type="number" value={data.no_of_water_taps ?? ""} onChange={(e) => setField("no_of_water_taps", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ["has_pets", "Has pets"],
              ["has_pests", "Has pests"],
              ["has_hobs", "Has hobs"],
              ["has_refrigerator", "Has refrigerator"],
              ["has_mixer", "Has mixer"],
              ["has_grinder", "Has grinder"],
              ["has_blender", "Has blender"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={!!(data as any)[k]} onChange={(e) => setField(k as any, e.target.checked)} className="w-4 h-4" />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pet_details">Pet details</Label>
              <Input id="pet_details" value={data.pet_details || ""} onChange={(e) => setField("pet_details", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pest_details">Pest details</Label>
              <Input id="pest_details" value={data.pest_details || ""} onChange={(e) => setField("pest_details", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pest_control_frequency">Pest control frequency</Label>
              <Select
                value={data.pest_control_frequency || ""}
                onChange={(val) => setField("pest_control_frequency", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "half_yearly", label: "Half yearly" },
                  { value: "annually", label: "Annually" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="lpg_cylinders">LPG cylinders</Label>
              <Input id="lpg_cylinders" type="number" value={data.lpg_cylinders ?? ""} onChange={(e) => setField("lpg_cylinders", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="no_of_staff">No of staff</Label>
              <Input id="no_of_staff" type="number" value={data.no_of_staff ?? ""} onChange={(e) => setField("no_of_staff", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <div>
            <Label htmlFor="other_equipment">Other equipment</Label>
            <textarea
              id="other_equipment"
              value={data.other_equipment || ""}
              onChange={(e) => setField("other_equipment", e.target.value)}
              className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
              rows={3}
            />
          </div>

          {[
            ["about_you", "About you"],
            ["passion_for_cooking", "Passion for cooking"],
            ["health_info", "Health info"],
            ["constraints", "Constraints"],
          ].map(([k, label]) => (
            <div key={k}>
              <Label htmlFor={k}>{label}</Label>
              <textarea
                id={k}
                value={(data as any)[k] || ""}
                onChange={(e) => setField(k as any, e.target.value)}
                className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                rows={3}
              />
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kitchen_video_url">Kitchen video URL</Label>
              <Input id="kitchen_video_url" value={data.kitchen_video_url || ""} onChange={(e) => setField("kitchen_video_url", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time_available">Time available</Label>
              <Input id="time_available" value={data.time_available || ""} onChange={(e) => setField("time_available", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fssai_cert">FSSAI certificate</Label>
              <input id="fssai_cert" type="file" onChange={(e) => setField("fssai_cert", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <Label htmlFor="photo_exterior">Photo exterior</Label>
              <input id="photo_exterior" type="file" accept="image/*" onChange={(e) => setField("photo_exterior", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <Label htmlFor="photo_entrance">Photo entrance</Label>
              <input id="photo_entrance" type="file" accept="image/*" onChange={(e) => setField("photo_entrance", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <Label htmlFor="photo_kitchen">Photo kitchen</Label>
              <input id="photo_kitchen" type="file" accept="image/*" onChange={(e) => setField("photo_kitchen", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <Label htmlFor="photo_platform">Photo platform</Label>
              <input id="photo_platform" type="file" accept="image/*" onChange={(e) => setField("photo_platform", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
          </div>

          <div>
            <Label>Location (stored in your user profile)</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-1">
              Use your location, get from address, select from map, or enter manually.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={saving || locationLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <FiMapPin size={14} />
                Use my location
              </button>
              <button
                type="button"
                onClick={handleGetFromAddress}
                disabled={
                  saving ||
                  locationLoading ||
                  !(
                    data.user_details?.address ||
                    data.user_details?.city ||
                    data.user_details?.state ||
                    data.user_details?.country
                  )
                }
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Get from address
              </button>
              <button
                type="button"
                onClick={() => setMapPickerOpen(true)}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Select from map
              </button>
            </div>
            <MapLocationPicker
              isOpen={mapPickerOpen}
              onClose={() => setMapPickerOpen(false)}
              onSelect={(lat, lng) => {
                setField("latitude", lat);
                setField("longitude", lng);
                setMapPickerOpen(false);
              }}
              initialLat={data.latitude ?? null}
              initialLng={data.longitude ?? null}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                <Input id="latitude" type="number" step="any" value={data.latitude ?? ""} onChange={(e) => setField("latitude", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 12.9716" />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                <Input id="longitude" type="number" step="any" value={data.longitude ?? ""} onChange={(e) => setField("longitude", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 77.5946" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

