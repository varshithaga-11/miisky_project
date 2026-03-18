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
  const [data, setData] = useState<Partial<NutritionistProfile>>({});

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

  const setField = (key: keyof NutritionistProfile, value: any) => setData((p) => ({ ...p, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try {
      await saveMyNutritionProfile(data);
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
      <PageMeta title="Nutrition Questionnaire" description="Nutritionist profile questionnaire" />
      <PageBreadcrumb pageTitle="Nutrition Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" value={data.qualification || ""} onChange={(e) => setField("qualification", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="years_of_experience">Years of experience</Label>
              <Input id="years_of_experience" value={data.years_of_experience || ""} onChange={(e) => setField("years_of_experience", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="license_number">License number</Label>
              <Input id="license_number" value={data.license_number || ""} onChange={(e) => setField("license_number", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="available_modes">Available modes</Label>
              <Input id="available_modes" value={data.available_modes || ""} onChange={(e) => setField("available_modes", e.target.value)} placeholder="video,audio,chat,in_person" />
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
              <textarea
                id={key}
                value={(data as any)[key] || ""}
                onChange={(e) => setField(key as any, e.target.value)}
                className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                rows={3}
              />
            </div>
          ))}

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

