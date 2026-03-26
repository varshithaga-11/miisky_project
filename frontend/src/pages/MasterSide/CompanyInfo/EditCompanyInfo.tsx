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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Company Info</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email (Support)</label>
            <input
              type="email"
              value={formData.email_support || ""}
              onChange={(e) =>
                setFormData({ ...formData, email_support: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone_primary || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone_primary: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={formData.address_line1 || ""}
              onChange={(e) =>
                setFormData({ ...formData, address_line1: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={formData.state || ""}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Pincode</label>
            <input
              type="text"
              value={formData.pincode || ""}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded"
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
