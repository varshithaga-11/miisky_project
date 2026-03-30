import React, { useState } from "react";
import { toast } from "react-toastify";
import { createCompanyInfo, CompanyInfo } from "./companyinfoapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddCompanyInfo: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({
    name: "",
    tagline: "",
    email_support: "",
    email_general: "",
    phone_primary: "",
    phone_secondary: "",
    whatsapp_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    google_maps_url: "",
    google_maps_embed_url: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    mission_statement: "",
    open_hours: "",
    appointment_link: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCompanyInfo(formData as CompanyInfo);
      toast.success("Company information added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add company information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">Add Company Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Core Branding */}
          <section className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Core Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Legal Title *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. Miisky SVASTH Private Limited"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="tagline">Brand Tagline</Label>
                <Input
                  id="tagline"
                  type="text"
                  placeholder="Defining mission statement..."
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* Connectivity Hub */}
          <section className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Connectivity Hub</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email_support">Support Email</Label>
                <Input
                  id="email_support"
                  type="email"
                  placeholder="support@miisky.com"
                  value={formData.email_support || ""}
                  onChange={(e) => setFormData({ ...formData, email_support: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="email_general">General Inquiries Email</Label>
                <Input
                  id="email_general"
                  type="email"
                  placeholder="info@miisky.com"
                  value={formData.email_general || ""}
                  onChange={(e) => setFormData({ ...formData, email_general: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="phone_primary">Primary Phone</Label>
                <Input
                  id="phone_primary"
                  type="tel"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.phone_primary || ""}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_number">WhatsApp Business</Label>
                <Input
                  id="whatsapp_number"
                  type="tel"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.whatsapp_number || ""}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* Geographical Parameters */}
          <section className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Geographical Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address_line1">Headquarters Address</Label>
                <textarea
                  id="address_line1"
                  placeholder="Full street address..."
                  value={formData.address_line1 || ""}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  rows={2}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State/Province"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode / ZIP</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="Pincode/ZIP"
                  value={formData.pincode || ""}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Country"
                  value={formData.country || ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* Digital Social Presence */}
          <section className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Digital Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((social) => (
                <div key={social}>
                  <Label htmlFor={`${social}_url`}>{social.charAt(0).toUpperCase() + social.slice(1)} URL</Label>
                  <Input
                    id={`${social}_url`}
                    type="url"
                    placeholder={`https://${social}.com/...`}
                    value={(formData as any)[`${social}_url`] || ""}
                    onChange={(e) => setFormData({ ...formData, [`${social}_url`]: e.target.value })}
                    disabled={loading}
                  />
                </div>
              ))}
              <div>
                 <Label htmlFor="open_hours">Open Hours</Label>
                 <Input
                   id="open_hours"
                   type="text"
                   placeholder="e.g. Mon - Fri: 9AM - 6PM"
                   value={formData.open_hours || ""}
                   onChange={(e) => setFormData({ ...formData, open_hours: e.target.value })}
                   disabled={loading}
                 />
              </div>
              <div className="md:col-span-2">
                 <Label htmlFor="appointment_link">Appointment Link</Label>
                 <Input
                   id="appointment_link"
                   type="text"
                   placeholder="https://..."
                   value={formData.appointment_link || ""}
                   onChange={(e) => setFormData({ ...formData, appointment_link: e.target.value })}
                   disabled={loading}
                 />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Company Info"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyInfo;
