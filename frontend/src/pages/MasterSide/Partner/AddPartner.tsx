import React, { useState } from "react";
import { toast } from "react-toastify";
import { createPartner, Partner } from "./partnerapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddPartner: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: "",
    description: "",
    website_url: "",
    logo_alt_text: "",
    display_on_home: false,
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      if (logoFile) {
        data.append("logo", logoFile);
      }

      await createPartner(data as any);
      toast.success("Partner added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">New Partner</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Partner Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Partner Organization Name"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={3}
              placeholder="Brief description of the partnership"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Website URL</label>
            <input
              type="url"
              value={formData.website_url || ""}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="https://example.com"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Brand Logo (Binary)</label>
            <div className="relative group overflow-hidden bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all p-4 text-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-600 font-bold text-xs truncate max-w-full">
                  {logoFile ? logoFile.name : "Select Logo Asset"}
                </span>
                <span className="text-gray-400 text-[10px] font-semibold">SVG or PNG Preferred</span>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Logo Alt Text</label>
            <input
              type="text"
              value={formData.logo_alt_text || ""}
              onChange={(e) => setFormData({ ...formData, logo_alt_text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Partner logo description"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Position</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center group cursor-pointer inline-flex mt-2">
              <input
                type="checkbox"
                id="add_partner_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="add_partner_active" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Active Publication</label>
            </div>
            <div className="flex items-center group cursor-pointer inline-flex mt-2 ml-6">
              <input
                type="checkbox"
                id="add_partner_home"
                checked={formData.display_on_home || false}
                onChange={(e) => setFormData({ ...formData, display_on_home: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="add_partner_home" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Show on Home</label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Registering..." : "Add Partner"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPartner;
