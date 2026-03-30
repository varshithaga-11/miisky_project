import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateCompanyInfo, getCompanyInfoById } from "./companyinfoapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditCompanyInfo: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [favFile, setFavFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getCompanyInfoById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load company data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (!key.endsWith('_url') && value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            data.append(key, JSON.stringify(value));
          } else {
            data.append(key, value.toString());
          }
        }
      });

      if (logoFile) data.append("logo", logoFile);
      if (favFile) data.append("favicon", favFile);

      await updateCompanyInfo(id, data as any);
      toast.success("Company information updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update company information");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">Edit Company Information</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400">Loading company details...</div>
        ) : (
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
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                   <Label htmlFor="logo">Company Logo</Label>
                   <div className="flex items-center gap-4 mb-2">
                      {formData.logo_url && (
                        <div className="w-16 h-16 rounded border bg-white overflow-hidden shrink-0 p-1">
                           <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                         {formData.logo_url ? "Replace logo" : "No logo set"}
                      </div>
                   </div>
                   <Input
                     id="logo"
                     type="file"
                     onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                     className="py-1.5"
                     disabled={loading}
                   />
                </div>
                <div>
                   <Label htmlFor="favicon">Favicon</Label>
                   <div className="flex items-center gap-4 mb-2">
                      {formData.favicon_url && (
                        <div className="w-16 h-16 rounded border bg-white overflow-hidden shrink-0 p-1">
                           <img src={formData.favicon_url} alt="Favicon" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                         {formData.favicon_url ? "Replace favicon" : "No favicon set"}
                      </div>
                   </div>
                   <Input
                     id="favicon"
                     type="file"
                     onChange={(e) => setFavFile(e.target.files?.[0] || null)}
                     className="py-1.5"
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
                    value={formData.email_support || ""}
                    onChange={(e) => setFormData({ ...formData, email_support: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_primary">Primary Phone</Label>
                  <Input
                    id="phone_primary"
                    type="tel"
                    value={formData.phone_primary || ""}
                    onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
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
                  <Input
                    id="address_line1"
                    type="text"
                    value={formData.address_line1 || ""}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="text"
                    value={formData.pincode || ""}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            {/* Digital Presence */}
            <section className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Digital Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="open_hours">Open Hours</Label>
                  <Input
                    id="open_hours"
                    type="text"
                    value={formData.open_hours || ""}
                    onChange={(e) => setFormData({ ...formData, open_hours: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_link">Appointment Link</Label>
                  <Input
                    id="appointment_link"
                    type="text"
                    value={formData.appointment_link || ""}
                    onChange={(e) => setFormData({ ...formData, appointment_link: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
               <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Institutional Stats</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="years_experience">Years Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={formData.years_experience || ""}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctors_count">Doctors Count</Label>
                    <Input
                      id="doctors_count"
                      type="text"
                      value={formData.doctors_count || ""}
                      onChange={(e) => setFormData({ ...formData, doctors_count: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="services_count">Services Count</Label>
                    <Input
                      id="services_count"
                      type="text"
                      value={formData.services_count || ""}
                      onChange={(e) => setFormData({ ...formData, services_count: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="satisfied_patients">Satisfied Patients</Label>
                    <Input
                      id="satisfied_patients"
                      type="text"
                      value={formData.satisfied_patients || ""}
                      onChange={(e) => setFormData({ ...formData, satisfied_patients: e.target.value })}
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
                {loading ? "Updating..." : "Update Company Info"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditCompanyInfo;
