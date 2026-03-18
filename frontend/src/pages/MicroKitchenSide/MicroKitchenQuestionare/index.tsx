import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyMicroKitchenProfile, MicroKitchenProfile, saveMyMicroKitchenProfile } from "./api";

export default function MicroKitchenQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<MicroKitchenProfile>>({});

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
              <Label htmlFor="brand_name">Brand name *</Label>
              <Input id="brand_name" value={data.brand_name || ""} onChange={(e) => setField("brand_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="kitchen_code">Kitchen code *</Label>
              <Input id="kitchen_code" value={data.kitchen_code || ""} onChange={(e) => setField("kitchen_code", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="fssai_no">FSSAI no *</Label>
              <Input id="fssai_no" value={data.fssai_no || ""} onChange={(e) => setField("fssai_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pan_no">PAN no *</Label>
              <Input id="pan_no" value={data.pan_no || ""} onChange={(e) => setField("pan_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gst_no">GST no</Label>
              <Input id="gst_no" value={data.gst_no || ""} onChange={(e) => setField("gst_no", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cuisine_type">Cuisine type *</Label>
              <Input id="cuisine_type" value={data.cuisine_type || ""} onChange={(e) => setField("cuisine_type", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="meal_type">Meal type *</Label>
              <Input id="meal_type" value={data.meal_type || ""} onChange={(e) => setField("meal_type", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="opening_time">Opening time *</Label>
              <Input id="opening_time" type="time" value={data.opening_time || ""} onChange={(e) => setField("opening_time", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="closing_time">Closing time *</Label>
              <Input id="closing_time" type="time" value={data.closing_time || ""} onChange={(e) => setField("closing_time", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" type="number" value={data.latitude ?? ""} onChange={(e) => setField("latitude", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" type="number" value={data.longitude ?? ""} onChange={(e) => setField("longitude", e.target.value ? Number(e.target.value) : null)} />
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

