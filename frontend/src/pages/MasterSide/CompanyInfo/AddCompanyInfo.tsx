import React, { useState } from "react";
import { toast } from "react-toastify";
import { createCompanyInfo, CompanyInfo } from "./companyinfoapi";

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
    working_hours: "",
    years_experience: 30,
    doctors_count: "180+",
    services_count: "200+",
    satisfied_patients: "10k+",
    our_specialities: ["Preventive care", "Diagnostic testing", "Mental health services"],
    our_vision: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"],
    mission_statement: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCompanyInfo(formData as CompanyInfo);
      toast.success("Institutional identity established!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to secure company metadata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">System Identity Configuration</h2>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">Define primary institutional markers, connectivity endpoints, and SEO parameters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Core Branding */}
          <section>
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> Core Branding
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Legal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Miisky SVASTH Private Limited"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-5 py-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Brand Tagline</label>
                <input
                  type="text"
                  placeholder="The definitive mission statement..."
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-5 py-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Connectivity Hub */}
          <section>
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> Connectivity Hub
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Support Hotline</label>
                <input
                  type="email"
                  placeholder="support@miisky.com"
                  value={formData.email_support || ""}
                  onChange={(e) => setFormData({ ...formData, email_support: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">General Inquiries</label>
                <input
                  type="email"
                  placeholder="info@miisky.com"
                  value={formData.email_general || ""}
                  onChange={(e) => setFormData({ ...formData, email_general: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Primary Phone</label>
                <input
                  type="tel"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.phone_primary || ""}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">WhatsApp Business</label>
                <input
                  type="tel"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.whatsapp_number || ""}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                />
              </div>
            </div>
          </section>

          {/* Geographical Parameters */}
          <section>
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> Geographical Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Headquarters Address</label>
                <textarea
                  placeholder="Full street address..."
                  value={formData.address_line1 || ""}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode/ZIP"
                  value={formData.pincode || ""}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.country || ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Digital Social Presence */}
          <section>
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> Digital Presence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((social) => (
                <div key={social}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{social} URL</label>
                  <input
                    type="url"
                    placeholder={`https://${social}.com/...`}
                    value={(formData as any)[`${social}_url`] || ""}
                    onChange={(e) => setFormData({ ...formData, [`${social}_url`]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono"
                  />
                </div>
              ))}
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Working Hours</label>
                 <input
                   type="text"
                   placeholder="Mon - Fri: 9AM - 6PM"
                   value={formData.working_hours || ""}
                   onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                   className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                 />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 mt-8 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Persisting Identification..." : "Secure Identity Settings"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Yield
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyInfo;
