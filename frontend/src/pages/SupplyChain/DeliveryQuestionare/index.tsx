import { useEffect, useState, type ReactNode } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DeliveryProfile, downloadProfileFile, getMyDeliveryProfile, saveMyDeliveryProfile } from "./api";

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
        setSlotsText(typeof res?.available_slots === "string" ? res.available_slots : "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load delivery questionnaire");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (key: keyof DeliveryProfile, value: unknown) =>
    setData((p) => ({ ...p, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try {
      const slotsPayload = slotsText.trim() ? slotsText.trim() : null;
      const payload: Partial<DeliveryProfile> = {
        ...data,
        available_slots: slotsPayload,
      };
      await saveMyDeliveryProfile(payload);
      toast.success("Saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save (check required fields and file sizes)");
    } finally {
      setSaving(false);
    }
  };

  const fileLabel = (path: string | File | null | undefined) => {
    if (!path) return "No file";
    if (path instanceof File) return path.name;
    if (typeof path === "string") {
      const seg = path.split("/").pop();
      return seg || "Uploaded";
    }
    return "—";
  };

  const fileInputBox = (children: ReactNode) => (
    <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-900/40 px-3 py-3 mt-1">
      {children}
    </div>
  );

  const isServerFile = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

  const FileCurrentRow = ({ value }: { value: unknown }) => (
    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">Current: {fileLabel(value as string)}</p>
      {isServerFile(value) && (
        <button
          type="button"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline underline-offset-2 shrink-0"
          onClick={async () => {
            try {
              await downloadProfileFile(value, fileLabel(value));
            } catch {
              toast.error("Could not download file");
            }
          }}
        >
          Download
        </button>
      )}
    </div>
  );

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Delivery Questionnaire" description="Delivery profile and KYC" />
      <PageBreadcrumb pageTitle="Delivery Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="space-y-10 max-w-4xl pb-16">
          {data.is_verified && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              Your profile has been verified by a micro kitchen.
              {data.verified_on && (
                <span className="block text-xs mt-1 opacity-80">
                  Verified on {new Date(data.verified_on).toLocaleString()}
                </span>
              )}
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Vehicle
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_type">Vehicle type</Label>
                <Select
                  value={data.vehicle_type || ""}
                  onChange={(val) => setField("vehicle_type", (val as string) || null)}
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
              {data.vehicle_type === "other" && (
                <div>
                  <Label htmlFor="other_vehicle_name">Other vehicle name</Label>
                  <Input
                    id="other_vehicle_name"
                    value={data.other_vehicle_name || ""}
                    onChange={(e) => setField("other_vehicle_name", e.target.value)}
                  />
                </div>
              )}
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
                <Label htmlFor="register_number">Registration number</Label>
                <Input
                  id="register_number"
                  value={data.register_number || ""}
                  onChange={(e) => setField("register_number", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="license_number">Driving licence number</Label>
                <Input
                  id="license_number"
                  value={data.license_number || ""}
                  onChange={(e) => setField("license_number", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Vehicle documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license_copy">Licence copy</Label>
                <FileCurrentRow value={data.license_copy} />
                {fileInputBox(
                  <input
                    id="license_copy"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setField("license_copy", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="rc_copy">RC (registration certificate)</Label>
                <FileCurrentRow value={data.rc_copy} />
                {fileInputBox(
                  <input
                    id="rc_copy"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setField("rc_copy", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="insurance_copy">Insurance copy</Label>
                <FileCurrentRow value={data.insurance_copy} />
                {fileInputBox(
                  <input
                    id="insurance_copy"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setField("insurance_copy", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="puc_image">PUC (pollution certificate)</Label>
                <FileCurrentRow value={data.puc_image} />
                {fileInputBox(
                  <input
                    id="puc_image"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setField("puc_image", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300"
                  />
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Identity (KYC)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aadhar_number">Aadhaar number</Label>
                <Input
                  id="aadhar_number"
                  value={data.aadhar_number || ""}
                  onChange={(e) => setField("aadhar_number", e.target.value)}
                  maxLength={12}
                />
              </div>
              <div>
                <Label htmlFor="aadhar_image">Aadhaar image</Label>
                <FileCurrentRow value={data.aadhar_image} />
                {fileInputBox(
                  <input
                    id="aadhar_image"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setField("aadhar_image", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="pan_number">PAN number</Label>
                <Input
                  id="pan_number"
                  value={data.pan_number || ""}
                  onChange={(e) => setField("pan_number", e.target.value)}
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="pan_image">PAN image</Label>
                <FileCurrentRow value={data.pan_image} />
                {fileInputBox(
                  <input
                    id="pan_image"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setField("pan_image", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-300"
                  />
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Bank details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_holder_name">Account holder name</Label>
                <Input
                  id="account_holder_name"
                  value={data.account_holder_name || ""}
                  onChange={(e) => setField("account_holder_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bank_name">Bank name</Label>
                <Input
                  id="bank_name"
                  value={data.bank_name || ""}
                  onChange={(e) => setField("bank_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bank_account_number">Account number</Label>
                <Input
                  id="bank_account_number"
                  value={data.bank_account_number || ""}
                  onChange={(e) => setField("bank_account_number", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ifsc_code">IFSC code</Label>
                <Input
                  id="ifsc_code"
                  value={data.ifsc_code || ""}
                  onChange={(e) => setField("ifsc_code", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Availability
            </h2>
            <div>
              <Label htmlFor="available_slots">Preferred slots</Label>
              <textarea
                id="available_slots"
                value={slotsText}
                onChange={(e) => setSlotsText(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm dark:bg-gray-800 dark:border-gray-700"
                rows={4}
                placeholder="Example: Mon-Fri 10:00 AM to 2:00 PM"
              />
            </div>
          </section>

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
