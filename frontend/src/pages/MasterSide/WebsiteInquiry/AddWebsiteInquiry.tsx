import React, { useState } from "react";
import { toast } from "react-toastify";
import { createInquiry, WebsiteInquiry } from "./websiteinquiryapi";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";

interface AddWebsiteInquiryProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AddWebsiteInquiry: React.FC<AddWebsiteInquiryProps> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<WebsiteInquiry>>({
    inquiry_type: "general_inquiry",
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "new",
  });

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
      await createInquiry(formData);
      toast.success("Manual inquiry added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Add Manual Inquiry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Sender Name <span className="text-red-500">*</span></Label>
              <InputField name="name" value={formData.name} onChange={handleChange} placeholder="Full name of the sender" required />
            </div>

            <div className="space-y-1.5">
              <Label>Sender Email <span className="text-red-500">*</span></Label>
              <InputField type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" required />
            </div>

            <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <InputField name="phone" value={formData.phone} onChange={handleChange} placeholder="Contact number" />
            </div>

            <div className="space-y-1.5">
                <Label>Inquiry Type</Label>
                <Select
                    value={formData.inquiry_type || ""}
                    onChange={(val) => handleSelectChange("inquiry_type", val)}
                    options={[
                        { value: "general_inquiry", label: "General Inquiry" },
                        { value: "appointment", label: "Appointment" },
                        { value: "product_info", label: "Product Information" },
                        { value: "partnership", label: "Partnership" },
                    ]}
                />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <InputField name="subject" value={formData.subject} onChange={handleChange} placeholder="Message subject" />
          </div>

          <div className="space-y-1.5">
            <Label>Message content <span className="text-red-500">*</span></Label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
              placeholder="What did the user write?"
              required
            ></textarea>
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

          <div className="space-y-1.5">
            <Label>Admin Notes (Internal)</Label>
            <textarea
              name="admin_notes"
              value={formData.admin_notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none text-xs"
              placeholder="Add internal notes about this lead..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8">{loading ? "Adding..." : "Save Inquiry"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebsiteInquiry;
