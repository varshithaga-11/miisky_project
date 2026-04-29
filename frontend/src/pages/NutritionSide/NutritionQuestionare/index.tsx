import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyNutritionProfile, NutritionistProfile, saveMyNutritionProfile } from "./api";

export default function NutritionQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<Partial<NutritionistProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ReadOnlyValue = ({ value, className = "" }: { value: any; className?: string }) => (
    <div className={`bg-brand-50/30 dark:bg-brand-500/5 border border-brand-100/50 dark:border-brand-500/10 rounded-lg px-3 py-2 text-sm font-semibold text-brand-900 dark:text-brand-300 ${className}`}>
      {value || "—"}
    </div>
  );

  const validationFields = [
    "qualification",
    "years_of_experience",
    "license_number",
    "specializations",
    "certifications",
    "education",
    "languages",
    "social_media_links_website_links",
    "available_modes",
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyNutritionProfile();
        setData(res || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load nutrition profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (key: keyof NutritionistProfile, value: any) => {
    setData((p) => ({ ...p, [key]: value }));
    const fieldKey = key as string;
    if (validationFields.includes(fieldKey)) {
      if (value.length > 255) {
        setErrors((prev) => ({ ...prev, [fieldKey]: "Maximum 255 characters allowed." }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[fieldKey];
          return updated;
        });
      }
    }
  };

  const onSave = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors before saving.");
      return;
    }
    setSaving(true);
    try {
      await saveMyNutritionProfile(data);
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
      <PageMeta title="Nutrition Questionnaire" description="Nutritionist profile questionnaire" />
      <PageBreadcrumb pageTitle="Nutrition Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nutritionist Profile</h1>
              <p className="text-sm text-gray-500">Manage your professional credentials and experience</p>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              {isEditing ? (
                <Input
                  id="qualification"
                  value={data.qualification || ""}
                  onChange={(e) => setField("qualification", e.target.value)}
                  error={!!errors.qualification}
                  hint={errors.qualification}
                />
              ) : (
                <ReadOnlyValue value={data.qualification} />
              )}
            </div>
            <div>
              <Label htmlFor="years_of_experience">Years of experience</Label>
              {isEditing ? (
                <Input
                  id="years_of_experience"
                  value={data.years_of_experience || ""}
                  onChange={(e) => setField("years_of_experience", e.target.value)}
                  error={!!errors.years_of_experience}
                  hint={errors.years_of_experience}
                />
              ) : (
                <ReadOnlyValue value={data.years_of_experience} />
              )}
            </div>
            <div>
              <Label htmlFor="license_number">License number</Label>
              {isEditing ? (
                <Input
                  id="license_number"
                  value={data.license_number || ""}
                  onChange={(e) => setField("license_number", e.target.value)}
                  error={!!errors.license_number}
                  hint={errors.license_number}
                />
              ) : (
                <ReadOnlyValue value={data.license_number} />
              )}
            </div>
            <div>
              <Label htmlFor="available_modes">Available modes</Label>
              {isEditing ? (
                <Input
                  id="available_modes"
                  value={data.available_modes || ""}
                  onChange={(e) => setField("available_modes", e.target.value)}
                  placeholder="video,audio,chat,in_person"
                  error={!!errors.available_modes}
                  hint={errors.available_modes}
                />
              ) : (
                <ReadOnlyValue value={data.available_modes} />
              )}
            </div>
          </div>

          {[
            ["experience", "Experience"],
            ["specializations", "Specializations"],
            ["certifications", "Certifications"],
            ["education", "Education"],
            ["languages", "Languages"],
            ["social_media_links_website_links", "Social / Website Links"],
          ].map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              {isEditing ? (
                <>
                  <textarea
                    id={key}
                    value={(data as any)[key] || ""}
                    onChange={(e) => setField(key as any, e.target.value)}
                    className={`w-full border rounded-lg p-3 dark:bg-gray-800 focus:outline-hidden focus:ring-3 ${
                      errors[key]
                        ? "border-error-500 focus:ring-error-500/20 dark:border-error-500"
                        : "border-gray-200 focus:ring-brand-500/20 dark:border-gray-700"
                    }`}
                    rows={3}
                  />
                  {errors[key] && <p className="mt-1.5 text-xs text-error-500">{errors[key]}</p>}
                </>
              ) : (
                <ReadOnlyValue value={(data as any)[key]} className="!whitespace-pre-wrap" />
              )}
            </div>
          ))}

          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
              <Button onClick={onSave} disabled={saving} className="!px-8">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

