import { useEffect, useState, type ReactNode } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DeliveryProfile, downloadProfileFile, getMyDeliveryProfile, saveMyDeliveryProfile, profileFileUrl } from "./api";
import { generateProfilePDF, ProfileSection } from "../../AdminSide/PatientAllQuestionarie/downloadHelpers";
import { FiDownload } from "react-icons/fi";

export default function DeliveryQuestionarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<Partial<DeliveryProfile>>({});
  const [slotsText, setSlotsText] = useState("");

  const ReadOnlyValue = ({ value, className = "" }: { value: any; className?: string }) => (
    <div className={`bg-brand-50/30 dark:bg-brand-500/5 border border-brand-100/50 dark:border-brand-500/10 rounded-lg px-3 py-2 text-sm font-semibold text-brand-900 dark:text-brand-300 ${className}`}>
      {value || "—"}
    </div>
  );

  const handleDownloadPDF = () => {
    const sections: ProfileSection[] = [
      {
        title: "Vehicle Details",
        fields: [
          { label: "Vehicle Type", value: data.vehicle_type },
          { label: "Other Vehicle Name", value: data.other_vehicle_name },
          { label: "Vehicle Details", value: data.vehicle_details },
          { label: "Registration Number", value: data.register_number },
          { label: "License Number", value: data.license_number },
        ]
      },
      {
        title: "Identity & KYC",
        fields: [
          { label: "Aadhaar Number", value: data.aadhar_number },
          { label: "PAN Number", value: data.pan_number },
        ]
      },
      {
        title: "Bank Details",
        fields: [
          { label: "Account Holder Name", value: data.account_holder_name },
          { label: "Bank Name", value: data.bank_name },
          { label: "Account Number", value: data.bank_account_number },
          { label: "IFSC Code", value: data.ifsc_code },
        ]
      },
      {
        title: "Availability",
        fields: [
          { label: "Preferred Slots", value: slotsText },
        ]
      },
      {
        title: "Documents (KYC)",
        fields: [
          { label: "Licence Copy", value: profileFileUrl(data.license_copy as string), type: "image" },
          { label: "RC Copy", value: profileFileUrl(data.rc_copy as string), type: "image" },
          { label: "Insurance Copy", value: profileFileUrl(data.insurance_copy as string), type: "image" },
          { label: "Aadhaar Image", value: profileFileUrl(data.aadhar_image as string), type: "image" },
          { label: "PAN Image", value: profileFileUrl(data.pan_image as string), type: "image" },
          { label: "PUC Image", value: profileFileUrl(data.puc_image as string), type: "image" },
        ].filter(f => f.value && typeof f.value === "string" && (f.value.includes(".jpg") || f.value.includes(".jpeg") || f.value.includes(".png") || f.value.includes(".webp"))) as any
      }
    ];

    const partnerName = data.user_details ? 
      ([data.user_details.first_name, data.user_details.last_name].filter(Boolean).join(" ")) : 
      "Delivery Partner";

    generateProfilePDF("Delivery Profile", sections, partnerName);
  };

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
      setIsEditing(false);
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

  const getDocPreviewUrl = (path: any) => {
    if (!path) return "";
    if (path instanceof File) return URL.createObjectURL(path);
    return profileFileUrl(path);
  };

  const isImageFile = (path: any) => {
    if (!path) return false;
    const name = path instanceof File ? path.name : String(path);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(name);
  };

  const FileCurrentRow = ({ value, label, id }: { value: unknown; label: string; id: string }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const isImg = isImageFile(value);

    useEffect(() => {
      if (value instanceof File && isImg) {
        const url = URL.createObjectURL(value);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      }
      return () => {};
    }, [value, isImg]);

    const displaySrc = value instanceof File ? preview : (isServerFile(value) && isImg ? profileFileUrl(value) : null);

    return (
      <div className="group relative flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">{label}</span>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
              {fileLabel(value as string)}
            </p>
          </div>
          <div className="flex gap-1">
            {isServerFile(value) && (
              <button
                type="button"
                className="bg-gray-100 dark:bg-white/10 hover:bg-brand-500 hover:text-white text-gray-600 dark:text-gray-400 p-1.5 rounded-lg transition-colors"
                title="Download"
                onClick={async () => {
                  try {
                    await downloadProfileFile(value, fileLabel(value));
                  } catch {
                    toast.error("Could not download file");
                  }
                }}
              >
                <FiDownload className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {displaySrc ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 group-hover:ring-2 ring-brand-500/20 transition-all">
            <img
              src={displaySrc}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <a 
                href={displaySrc} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-sm"
              >
                VIEW FULL
              </a>
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-8 h-8 mb-1 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-tighter italic">Document Only</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Delivery Questionnaire" description="Delivery profile and KYC" />
      <PageBreadcrumb pageTitle="Delivery Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : (
        <div className="space-y-8 max-w-4xl pb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Profile & KYC</h1>
              <p className="text-sm text-gray-500">Manage your vehicle details and identity documents</p>
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
                {isEditing ? (
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
                ) : (
                  <ReadOnlyValue value={data.vehicle_type} />
                )}
              </div>
              {data.vehicle_type === "other" && (
                <div>
                  <Label htmlFor="other_vehicle_name">Other vehicle name</Label>
                  {isEditing ? (
                    <Input
                      id="other_vehicle_name"
                      value={data.other_vehicle_name || ""}
                      onChange={(e) => setField("other_vehicle_name", e.target.value)}
                    />
                  ) : (
                    <ReadOnlyValue value={data.other_vehicle_name} />
                  )}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="vehicle_details">Vehicle details</Label>
              {isEditing ? (
                <textarea
                  id="vehicle_details"
                  value={data.vehicle_details || ""}
                  onChange={(e) => setField("vehicle_details", e.target.value)}
                  className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                />
              ) : (
                <ReadOnlyValue value={data.vehicle_details} className="!whitespace-pre-wrap" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="register_number">Registration number</Label>
                {isEditing ? (
                  <Input
                    id="register_number"
                    value={data.register_number || ""}
                    onChange={(e) => setField("register_number", e.target.value)}
                  />
                ) : (
                  <ReadOnlyValue value={data.register_number} />
                )}
              </div>
              <div>
                <Label htmlFor="license_number">Driving licence number</Label>
                {isEditing ? (
                  <Input
                    id="license_number"
                    value={data.license_number || ""}
                    onChange={(e) => setField("license_number", e.target.value)}
                  />
                ) : (
                  <ReadOnlyValue value={data.license_number} />
                )}
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
                <FileCurrentRow value={data.license_copy} label="Licence" id="license_copy" />
                {isEditing && fileInputBox(
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
                <FileCurrentRow value={data.rc_copy} label="RC" id="rc_copy" />
                {isEditing && fileInputBox(
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
                <FileCurrentRow value={data.insurance_copy} label="Insurance" id="insurance_copy" />
                {isEditing && fileInputBox(
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
                <FileCurrentRow value={data.puc_image} label="PUC" id="puc_image" />
                {isEditing && fileInputBox(
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
                {isEditing ? (
                  <Input
                    id="aadhar_number"
                    value={data.aadhar_number || ""}
                    onChange={(e) => setField("aadhar_number", e.target.value)}
                    maxLength={12}
                  />
                ) : (
                  <ReadOnlyValue value={data.aadhar_number} />
                )}
              </div>
              <div>
                <Label htmlFor="aadhar_image">Aadhaar image</Label>
                <FileCurrentRow value={data.aadhar_image} label="Aadhaar" id="aadhar_image" />
                {isEditing && fileInputBox(
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
                {isEditing ? (
                  <Input
                    id="pan_number"
                    value={data.pan_number || ""}
                    onChange={(e) => setField("pan_number", e.target.value)}
                    maxLength={10}
                  />
                ) : (
                  <ReadOnlyValue value={data.pan_number} />
                )}
              </div>
              <div>
                <Label htmlFor="pan_image">PAN image</Label>
                <FileCurrentRow value={data.pan_image} label="PAN" id="pan_image" />
                {isEditing && fileInputBox(
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
                {isEditing ? (
                  <Input
                    id="account_holder_name"
                    value={data.account_holder_name || ""}
                    onChange={(e) => setField("account_holder_name", e.target.value)}
                  />
                ) : (
                  <ReadOnlyValue value={data.account_holder_name} />
                )}
              </div>
              <div>
                <Label htmlFor="bank_name">Bank name</Label>
                {isEditing ? (
                  <Input
                    id="bank_name"
                    value={data.bank_name || ""}
                    onChange={(e) => setField("bank_name", e.target.value)}
                  />
                ) : (
                  <ReadOnlyValue value={data.bank_name} />
                )}
              </div>
              <div>
                <Label htmlFor="bank_account_number">Account number</Label>
                {isEditing ? (
                  <Input
                    id="bank_account_number"
                    value={data.bank_account_number || ""}
                    onChange={(e) => setField("bank_account_number", e.target.value)}
                  />
                ) : (
                  <ReadOnlyValue value={data.bank_account_number} />
                )}
              </div>
              <div>
                <Label htmlFor="ifsc_code">IFSC code</Label>
                {isEditing ? (
                  <Input
                    id="ifsc_code"
                    value={data.ifsc_code || ""}
                    onChange={(e) => setField("ifsc_code", e.target.value)}
                  />
                ) : (
                  <ReadOnlyValue value={data.ifsc_code} />
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Availability
            </h2>
            <div>
              <Label htmlFor="available_slots">Preferred slots</Label>
              {isEditing ? (
                <textarea
                  id="available_slots"
                  value={slotsText}
                  onChange={(e) => setSlotsText(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm dark:bg-gray-800 dark:border-gray-700"
                  rows={4}
                  placeholder="Example: Mon-Fri 10:00 AM to 2:00 PM"
                />
              ) : (
                <ReadOnlyValue value={slotsText} className="!whitespace-pre-wrap" />
              )}
            </div>
          </section>

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
