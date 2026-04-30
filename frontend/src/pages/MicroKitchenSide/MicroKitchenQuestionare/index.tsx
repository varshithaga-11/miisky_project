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
import { generateProfilePDF, ProfileSection } from "../../AdminSide/PatientAllQuestionarie/downloadHelpers";
import { FiDownload } from "react-icons/fi";

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
  isEditing = true,
}: {
  label: string;
  value: File | string | null | undefined;
  onChange: (file: File | null) => void;
  id: string;
  isEditing?: boolean;
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
        <div className={`w-full ${isEditing ? 'sm:w-40' : 'sm:w-64'} flex-shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 min-h-[100px] flex items-center justify-center transition-all`}>
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={label}
              className={`w-full ${isEditing ? 'h-32' : 'h-48'} object-cover`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4">
              <FiImage className="w-10 h-10 mb-1" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        {isEditing && (
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
        )}
      </div>
    </div>
  );
}

export default function MicroKitchenQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<Partial<MicroKitchenProfile> & {
    user_details?: { address?: string; city?: string; state?: string; country?: string; username?: string; first_name?: string; last_name?: string; email?: string; mobile?: string };
    status?: string;
    rating?: number;
    total_reviews?: number;
  }>({});

  const ReadOnlyValue = ({ value, className = "" }: { value: any; className?: string }) => (
    <div className={`bg-brand-50/30 dark:bg-brand-500/5 border border-brand-100/50 dark:border-brand-500/10 rounded-lg px-3 py-2 text-sm font-semibold text-brand-900 dark:text-brand-300 ${className}`}>
      {value === true ? "Yes" : value === false ? "No" : (value || "—")}
    </div>
  );

  const handleDownloadPDF = () => {
    const sections: ProfileSection[] = [
      {
        title: "Brand & Compliance",
        fields: [
          { label: "Brand Name", value: data.brand_name },
          { label: "Kitchen Code", value: data.kitchen_code },
          { label: "FSSAI No", value: data.fssai_no },
          { label: "PAN No", value: data.pan_no },
          { label: "GST No", value: data.gst_no },
        ]
      },
      {
        title: "Operations & Facility",
        fields: [
          { label: "Kitchen Area (sq.ft)", value: data.kitchen_area },
          { label: "Platform Area (sq.ft)", value: data.platform_area },
          { label: "Water Source", value: data.water_source },
          { label: "Purification Type", value: data.purification_type },
          { label: "No of Water Taps", value: data.no_of_water_taps },
          { label: "Cuisine Type", value: data.cuisine_type },
          { label: "Meal Type", value: data.meal_type },
        ]
      },
      {
        title: "Equipment & Safety",
        fields: [
          { label: "Has Pets", value: data.has_pets },
          { label: "Has Pests", value: data.has_pests },
          { label: "Has Hobs", value: data.has_hobs },
          { label: "Has Refrigerator", value: data.has_refrigerator },
          { label: "Has Mixer", value: data.has_mixer },
          { label: "Has Grinder", value: data.has_grinder },
          { label: "Has Blender", value: data.has_blender },
          { label: "Pest Control Frequency", value: data.pest_control_frequency },
          { label: "LPG Cylinders", value: data.lpg_cylinders },
          { label: "No of Staff", value: data.no_of_staff },
        ]
      },
      {
        title: "About & Availability",
        fields: [
          { label: "About You", value: data.about_you },
          { label: "Passion for Cooking", value: data.passion_for_cooking },
          { label: "Time Available", value: data.time_available },
        ]
      }
    ];

    const partnerName = data.user_details ? 
      ([data.user_details.first_name, data.user_details.last_name].filter(Boolean).join(" ") || data.user_details.username) : 
      data.brand_name;

    generateProfilePDF("Micro Kitchen Profile", sections, partnerName);
  };

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
      setIsEditing(false);
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
        <div className="space-y-6 max-w-4xl pb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Micro Kitchen Profile</h1>
              <p className="text-sm text-gray-500">Manage your brand details, equipment, and operations</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="!px-4 !py-2.5 !rounded-full border-gray-200 dark:border-white/10"
              >
                <FiDownload className="mr-2" />
                Download PDF
              </Button>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="!px-6 !py-2.5 !rounded-full shadow-lg hover:shadow-brand-500/20"
                >
                  Edit Questionnaire
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="!px-6 !py-2.5 !rounded-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {(data.status || data.rating != null || (data.total_reviews ?? 0) > 0) && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4 flex flex-wrap gap-4 shadow-sm">
              {data.status && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
                  <p className="font-semibold capitalize text-brand-600 dark:text-brand-400">{data.status}</p>
                </div>
              )}
              {data.rating != null && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</span>
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    {data.rating} <span className="text-yellow-500 text-xs">★</span>
                  </p>
                </div>
              )}
              {(data.total_reviews ?? 0) > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total reviews</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.total_reviews}</p>
                </div>
              )}
              {data.user_details && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kitchen Partner</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {[data.user_details.first_name, data.user_details.last_name].filter(Boolean).join(" ") || data.user_details.username || "—"}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["brand_name", "Brand name"],
              ["kitchen_code", "Kitchen code"],
              ["fssai_no", "FSSAI no"],
              ["pan_no", "PAN no"],
              ["gst_no", "GST no"],
              ["bank_name", "Bank name"],
              ["acc_no", "Account no"],
              ["ifsc_code", "IFSC code"],
              ["cuisine_type", "Cuisine type", "South Indian, North Indian, etc"],
              ["meal_type", "Meal type", "Breakfast, Lunch, Dinner, etc"],
            ].map(([key, label, placeholder]) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                {isEditing ? (
                  <Input 
                    id={key} 
                    value={(data as any)[key] || ""} 
                    onChange={(e) => setField(key as any, e.target.value)} 
                    placeholder={placeholder}
                  />
                ) : (
                  <ReadOnlyValue value={(data as any)[key]} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kitchen_area">Kitchen area (sq.ft)</Label>
              {isEditing ? (
                <Input id="kitchen_area" type="number" value={data.kitchen_area ?? ""} onChange={(e) => setField("kitchen_area", e.target.value ? Number(e.target.value) : null)} />
              ) : (
                <ReadOnlyValue value={data.kitchen_area} />
              )}
            </div>
            <div>
              <Label htmlFor="platform_area">Platform area (sq.ft)</Label>
              {isEditing ? (
                <Input id="platform_area" type="number" value={data.platform_area ?? ""} onChange={(e) => setField("platform_area", e.target.value ? Number(e.target.value) : null)} />
              ) : (
                <ReadOnlyValue value={data.platform_area} />
              )}
            </div>
            <div>
              <Label htmlFor="water_source">Water source</Label>
              {isEditing ? (
                <Input id="water_source" value={data.water_source || ""} onChange={(e) => setField("water_source", e.target.value)} placeholder="borewell/cmc/municipal" />
              ) : (
                <ReadOnlyValue value={data.water_source} />
              )}
            </div>
            <div>
              <Label htmlFor="purification_type">Purification type</Label>
              {isEditing ? (
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
              ) : (
                <ReadOnlyValue value={data.purification_type} />
              )}
            </div>
            <div>
              <Label htmlFor="no_of_water_taps">No of water taps</Label>
              {isEditing ? (
                <Input id="no_of_water_taps" type="number" value={data.no_of_water_taps ?? ""} onChange={(e) => setField("no_of_water_taps", e.target.value ? Number(e.target.value) : null)} />
              ) : (
                <ReadOnlyValue value={data.no_of_water_taps} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {[
              ["has_pets", "Has pets"],
              ["has_pests", "Has pests"],
              ["has_hobs", "Has hobs"],
              ["has_refrigerator", "Has refrigerator"],
              ["has_mixer", "Has mixer"],
              ["has_grinder", "Has grinder"],
              ["has_blender", "Has blender"],
            ].map(([k, label]) => {
              const isChecked = !!(data as any)[k];
              return (
                <label 
                  key={k} 
                  className={`flex items-center gap-2 text-sm transition-all duration-200 px-3 py-2 rounded-lg border ${
                    !isEditing 
                      ? isChecked 
                        ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/30 dark:text-brand-400 font-bold' 
                        : 'bg-transparent border-transparent opacity-20 grayscale'
                      : isChecked
                        ? 'bg-brand-50/50 border-brand-200 text-brand-600 dark:bg-brand-500/5 dark:border-brand-500/20'
                        : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-white/10 hover:border-brand-300 cursor-pointer'
                  }`}
                >
                  {isEditing ? (
                    <input type="checkbox" checked={isChecked} onChange={(e) => setField(k as any, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600" />
                  ) : isChecked && (
                    <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {label}
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["pet_details", "Pet details"],
              ["pest_details", "Pest details"],
            ].map(([k, label]) => (
              <div key={k}>
                <Label htmlFor={k}>{label}</Label>
                {isEditing ? (
                  <Input id={k} value={(data as any)[k] || ""} onChange={(e) => setField(k as any, e.target.value)} />
                ) : (
                  <ReadOnlyValue value={(data as any)[k]} />
                )}
              </div>
            ))}
            <div>
              <Label htmlFor="pest_control_frequency">Pest control frequency</Label>
              {isEditing ? (
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
              ) : (
                <ReadOnlyValue value={data.pest_control_frequency} />
              )}
            </div>
            <div>
              <Label htmlFor="lpg_cylinders">LPG cylinders</Label>
              {isEditing ? (
                <Input id="lpg_cylinders" type="number" value={data.lpg_cylinders ?? ""} onChange={(e) => setField("lpg_cylinders", e.target.value ? Number(e.target.value) : null)} />
              ) : (
                <ReadOnlyValue value={data.lpg_cylinders} />
              )}
            </div>
            <div>
              <Label htmlFor="no_of_staff">No of staff</Label>
              {isEditing ? (
                <Input id="no_of_staff" type="number" value={data.no_of_staff ?? ""} onChange={(e) => setField("no_of_staff", e.target.value ? Number(e.target.value) : null)} />
              ) : (
                <ReadOnlyValue value={data.no_of_staff} />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="other_equipment">Other equipment</Label>
            {isEditing ? (
              <textarea
                id="other_equipment"
                value={data.other_equipment || ""}
                onChange={(e) => setField("other_equipment", e.target.value)}
                className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                rows={3}
              />
            ) : (
              <ReadOnlyValue value={data.other_equipment} className="!whitespace-pre-wrap" />
            )}
          </div>

          {[
            ["about_you", "About you"],
            ["passion_for_cooking", "Passion for cooking"],
            ["health_info", "Health info"],
            ["constraints", "Constraints"],
          ].map(([k, label]) => (
            <div key={k}>
              <Label htmlFor={k}>{label}</Label>
              {isEditing ? (
                <textarea
                  id={k}
                  value={(data as any)[k] || ""}
                  onChange={(e) => setField(k as any, e.target.value)}
                  className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                />
              ) : (
                <ReadOnlyValue value={(data as any)[k]} className="!whitespace-pre-wrap" />
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kitchen_video_url">Kitchen video URL</Label>
              {isEditing ? (
                <Input id="kitchen_video_url" value={data.kitchen_video_url || ""} onChange={(e) => setField("kitchen_video_url", e.target.value)} />
              ) : (
                <ReadOnlyValue value={data.kitchen_video_url} />
              )}
            </div>
            <div>
              <Label htmlFor="time_available">Time available</Label>
              {isEditing ? (
                <Input id="time_available" value={data.time_available || ""} onChange={(e) => setField("time_available", e.target.value)} />
              ) : (
                <ReadOnlyValue value={data.time_available} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fssai_cert">FSSAI certificate</Label>
              <div className="flex flex-col gap-3 mt-2">
                {data.fssai_cert && typeof data.fssai_cert === "string" && (
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 flex justify-between items-center">
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Current Certificate</span>
                    <a href={data.fssai_cert} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-[10px] font-bold shadow-sm transition-colors">
                      VIEW FILE
                    </a>
                  </div>
                )}
                {isEditing && (
                  <input id="fssai_cert" type="file" onChange={(e) => setField("fssai_cert", e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 dark:file:bg-gray-800" />
                )}
              </div>
            </div>
            {[
              ["photo_exterior", "Photo exterior"],
              ["photo_entrance", "Photo entrance"],
              ["photo_kitchen", "Photo kitchen"],
              ["photo_platform", "Photo platform"],
            ].map(([k, label]) => (
              <PhotoUploadField
                key={k}
                label={label}
                id={k}
                value={(data as any)[k]}
                onChange={(file) => setField(k as any, file)}
                isEditing={isEditing}
              />
            ))}
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
              <Button onClick={onSave} disabled={saving} className="!px-10">
                {saving ? "Saving..." : "Save Questionnaire"}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

