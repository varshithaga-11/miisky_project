import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getWebsiteInquiry, updateInquiry, WebsiteInquiry } from "./websiteinquiryapi";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";

interface EditWebsiteInquiryProps {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditWebsiteInquiry: React.FC<EditWebsiteInquiryProps> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<Partial<WebsiteInquiry>>({});

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const data = await getWebsiteInquiry(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to fetch inquiry details");
        onClose();
      } finally {
        setFetching(false);
      }
    };
    fetchInquiry();
  }, [id, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateInquiry(id, formData);
      toast.success("Inquiry updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update inquiry");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Manage Inquiry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Sender Name</Label>
              <InputField name="name" value={formData.name || ""} onChange={handleChange} required />
            </div>

            <div className="space-y-1.5">
              <Label>Sender Email</Label>
              <InputField type="email" name="email" value={formData.email || ""} onChange={handleChange} required />
            </div>

            <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <InputField name="phone" value={formData.phone || ""} onChange={handleChange} />
            </div>

            <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                    value={formData.status || ""}
                    onChange={(val) => handleSelectChange("status", val)}
                    options={[
                        { value: "new", label: "New" },
                        { value: "responded", label: "Responded" },
                        { value: "closed", label: "Closed" },
                        { value: "spam", label: "Spam" },
                    ]}
                />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-50 dark:border-gray-700">
            <Label className="uppercase text-[10px] text-gray-400 font-bold tracking-widest">Message Content</Label>
            <p className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 whitespace-pre-wrap min-h-[100px]">
                {formData.message || "No content provided."}
            </p>
          </div>

          <div className="space-y-1.5 mt-4">
            <Label>Internal Admin Notes</Label>
            <textarea
              name="admin_notes"
              value={formData.admin_notes || ""}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none text-sm"
              placeholder="What actions were taken? E.g. Called user, sent brochure..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} type="button">Close</Button>
            <Button type="submit" disabled={loading} className="px-8">{loading ? "Updating..." : "Update Leads"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWebsiteInquiry;
