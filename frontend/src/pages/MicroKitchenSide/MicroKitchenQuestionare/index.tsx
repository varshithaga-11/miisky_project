import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiImage } from "react-icons/fi";
import { createApiUrl } from "../../../access/access";
import { getMyMicroKitchenProfile, MicroKitchenProfile, saveMyMicroKitchenProfile } from "./api";

const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

function PhotoUploadField({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: File | string | null | undefined;
  onChange: (file: File | null) => void;
  id: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  const displaySrc = value instanceof File ? previewUrl : (typeof value === "string" && value ? getMediaUrl(value) : null);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-40 flex-shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 min-h-[100px] flex items-center justify-center">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={label}
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4">
              <FiImage className="w-10 h-10 mb-1" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        <div className="flex-1 w-full">
          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onChange(file);
              e.target.value = "";
            }}
            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 file:font-medium hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/40"
          />
          {value instanceof File && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Remove new image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MicroKitchenQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<MicroKitchenProfile> & {
    user_details?: { address?: string; city?: string; state?: string; country?: string; username?: string; first_name?: string; last_name?: string; email?: string; mobile?: string };
    status?: string;
    rating?: number;
    total_reviews?: number;
  }>({});

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
          {(data.status || data.rating != null || (data.total_reviews ?? 0) > 0) && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4 flex flex-wrap gap-4">
              {data.status && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</span>
                  <p className="font-semibold capitalize text-gray-900 dark:text-white">{data.status}</p>
                </div>
              )}
              {data.rating != null && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.rating}</p>
                </div>
              )}
              {(data.total_reviews ?? 0) > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total reviews</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.total_reviews}</p>
                </div>
              )}
              {data.user_details && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {[data.user_details.first_name, data.user_details.last_name].filter(Boolean).join(" ") || data.user_details.username || "—"}
                  </p>
                </div>
              )}
            </div>
          )}
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
              <div className="flex items-center gap-3">
                {data.fssai_cert && typeof data.fssai_cert === "string" && (
                  <a href={data.fssai_cert} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    View current certificate
                  </a>
                )}
                <input id="fssai_cert" type="file" onChange={(e) => setField("fssai_cert", e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
            </div>
            <PhotoUploadField
              label="Photo exterior"
              id="photo_exterior"
              value={data.photo_exterior}
              onChange={(file) => setField("photo_exterior", file)}
            />
            <PhotoUploadField
              label="Photo entrance"
              id="photo_entrance"
              value={data.photo_entrance}
              onChange={(file) => setField("photo_entrance", file)}
            />
            <PhotoUploadField
              label="Photo kitchen"
              id="photo_kitchen"
              value={data.photo_kitchen}
              onChange={(file) => setField("photo_kitchen", file)}
            />
            <PhotoUploadField
              label="Photo platform"
              id="photo_platform"
              value={data.photo_platform}
              onChange={(file) => setField("photo_platform", file)}
            />
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

