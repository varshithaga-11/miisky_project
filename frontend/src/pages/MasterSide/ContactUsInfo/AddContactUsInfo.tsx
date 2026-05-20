import React, { useState } from "react";
import { toast } from "react-toastify";
import { createContactUsInfo, ContactUsInfo } from "./contactusinfoapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface AddContactUsInfoProps {
  onClose: () => void;
  onAdd: (contact: ContactUsInfo) => void;
}

const AddContactUsInfo: React.FC<AddContactUsInfoProps> = ({ onClose, onAdd }) => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone_primary, setPhonePrimary] = useState("");
  const [phone_secondary, setPhoneSecondary] = useState("");
  const [email_support, setEmailSupport] = useState("");
  const [email_general, setEmailGeneral] = useState("");
  const [whatsapp_number, setWhatsappNumber] = useState("");
  const [google_maps_url, setGoogleMapsUrl] = useState("");
  const [google_maps_embed_url, setGoogleMapsEmbedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!country.trim()) {
      toast.error("Country name is required");
      return;
    }

    setLoading(true);
    try {
      const data: ContactUsInfo = {
        country,
        state: state || undefined,
        city: city || undefined,
        address: address || undefined,
        phone_primary: phone_primary || undefined,
        phone_secondary: phone_secondary || undefined,
        email_support: email_support || undefined,
        email_general: email_general || undefined,
        whatsapp_number: whatsapp_number || undefined,
        google_maps_url: google_maps_url || undefined,
        google_maps_embed_url: google_maps_embed_url || undefined,
      };

      const created = await createContactUsInfo(data);
      toast.success("Contact information created successfully!");
      onAdd(created);
      onClose();
    } catch (error: any) {
      console.error("Error creating contact info:", error);
      toast.error(error.response?.data?.detail || "Failed to create contact info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add Contact Us Info</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Full Address</Label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={2}
              placeholder="e.g. #211, Temple Street, 9th Main Road..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="phone_primary">Primary Phone</Label>
              <Input
                id="phone_primary"
                type="text"
                value={phone_primary}
                onChange={(e) => setPhonePrimary(e.target.value)}
                placeholder="+91 9845497950"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="phone_secondary">Secondary Phone</Label>
              <Input
                id="phone_secondary"
                type="text"
                value={phone_secondary}
                onChange={(e) => setPhoneSecondary(e.target.value)}
                placeholder="+91 9845400000"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                type="text"
                value={whatsapp_number}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 9845497950"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email_support">Support Email</Label>
              <Input
                id="email_support"
                type="email"
                value={email_support}
                onChange={(e) => setEmailSupport(e.target.value)}
                placeholder="support@miisky.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="email_general">General Email</Label>
              <Input
                id="email_general"
                type="email"
                value={email_general}
                onChange={(e) => setEmailGeneral(e.target.value)}
                placeholder="info@miisky.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="google_maps_url">Google Maps Location Link (View Link)</Label>
            <Input
              id="google_maps_url"
              type="text"
              value={google_maps_url}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?cid=..."
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="google_maps_embed_url">Google Maps Embed iframe Link (src attribute)</Label>
            <textarea
              id="google_maps_embed_url"
              value={google_maps_embed_url}
              onChange={(e) => setGoogleMapsEmbedUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm font-mono"
              rows={3}
              placeholder="https://www.google.com/maps/embed?pb=..."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Contact Info"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactUsInfo;
