import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateCompanyInfo, getCompanyInfoById, CompanyInfo } from "./companyinfoapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditCompanyInfo: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCompanyInfoById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCompanyInfo(id, formData as any);
      toast.success("Updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Company Details</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Company Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tagline</label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email (Support)</label>
            <input
              type="email"
              value={formData.email_support || ""}
              onChange={(e) =>
                setFormData({ ...formData, email_support: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Phone</label>
            <input
              type="tel"
              value={formData.phone_primary || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone_primary: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Address</label>
            <input
              type="text"
              value={formData.address_line1 || ""}
              onChange={(e) =>
                setFormData({ ...formData, address_line1: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">City</label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">State</label>
            <input
              type="text"
              value={formData.state || ""}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Pincode</label>
            <input
              type="text"
              value={formData.pincode || ""}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans uppercase tracking-tight">Institutional Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">Years Experience</label>
                <input
                  type="number"
                  value={formData.years_experience || ""}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest font-sans">Doctors Count</label>
                <input
                  type="text"
                  value={formData.doctors_count || ""}
                  onChange={(e) => setFormData({ ...formData, doctors_count: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest font-sans">Services Count</label>
                <input
                  type="text"
                  value={formData.services_count || ""}
                  onChange={(e) => setFormData({ ...formData, services_count: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest font-sans">Satisfied Patients</label>
                <input
                  type="text"
                  value={formData.satisfied_patients || ""}
                  onChange={(e) => setFormData({ ...formData, satisfied_patients: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans uppercase tracking-tight italic">Mission & Vision</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest font-sans">Mission Statement</label>
                <textarea
                  value={formData.mission_statement || ""}
                  onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest font-sans">Specialities (comma separated list)</label>
                  <textarea
                    value={(formData.our_specialities || []).join(", ")}
                    onChange={(e) => setFormData({ ...formData, our_specialities: e.target.value.split(",").map(i => i.trim()).filter(i => i) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest font-sans">Vision Points (comma separated list)</label>
                  <textarea
                    value={(formData.our_vision || []).join(", ")}
                    onChange={(e) => setFormData({ ...formData, our_vision: e.target.value.split(",").map(i => i.trim()).filter(i => i) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Revising..." : "Update Details"}
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

export default EditCompanyInfo;
