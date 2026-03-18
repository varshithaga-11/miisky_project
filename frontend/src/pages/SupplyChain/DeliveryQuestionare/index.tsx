import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DeliveryProfile, getMyDeliveryProfile, saveMyDeliveryProfile } from "./api";

export default function DeliveryQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<DeliveryProfile>>({});
  const [slotsText, setSlotsText] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyDeliveryProfile();
        setData(res || {});
        setSlotsText(res?.available_slots ? JSON.stringify(res.available_slots, null, 2) : "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load delivery questionnaire");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (key: keyof DeliveryProfile, value: any) => setData((p) => ({ ...p, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<DeliveryProfile> = {
        ...data,
        available_slots: slotsText.trim() ? JSON.parse(slotsText) : null,
      };
      await saveMyDeliveryProfile(payload);
      toast.success("Saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save (check JSON fields)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Delivery Questionnaire" description="Delivery profile questionnaire" />
      <PageBreadcrumb pageTitle="Delivery Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <div>
            <Label htmlFor="vehicle_type">Vehicle type</Label>
            <Select
              value={data.vehicle_type || ""}
              onChange={(val) => setField("vehicle_type", (val as any) || null)}
              options={[
                { value: "", label: "Select" },
                { value: "bike", label: "Bike" },
                { value: "scooter", label: "Scooter" },
                { value: "car", label: "Car" },
                { value: "van", label: "Van" },
                { value: "other", label: "Other" },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="vehicle_details">Vehicle details</Label>
            <textarea
              id="vehicle_details"
              value={data.vehicle_details || ""}
              onChange={(e) => setField("vehicle_details", e.target.value)}
              className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="register_number">Register number</Label>
              <Input id="register_number" value={data.register_number || ""} onChange={(e) => setField("register_number", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="license_number">License number</Label>
              <Input id="license_number" value={data.license_number || ""} onChange={(e) => setField("license_number", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_copy">License copy</Label>
              <input id="license_copy" type="file" onChange={(e) => setField("license_copy", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <Label htmlFor="rc_copy">RC copy</Label>
              <input id="rc_copy" type="file" onChange={(e) => setField("rc_copy", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <Label htmlFor="insurance_copy">Insurance copy</Label>
              <input id="insurance_copy" type="file" onChange={(e) => setField("insurance_copy", e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
          </div>

          <div>
            <Label htmlFor="available_slots">Available slots (JSON)</Label>
            <textarea
              id="available_slots"
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              className="w-full border rounded-lg p-3 font-mono text-xs dark:bg-gray-800 dark:border-gray-700"
              rows={6}
              placeholder='Example: [{"day":"Mon","from":"10:00","to":"14:00"}]'
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

