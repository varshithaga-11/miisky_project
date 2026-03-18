import React, { useEffect, useState } from "react";
import { getStateById, updateState } from "./stateapi";
import { getCountryList, Country } from "../Country/countryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EditStateProps {
  stateId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditState: React.FC<EditStateProps> = ({ stateId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchCountry, setSearchCountry] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      getCountryList(1, "all", searchCountry)
        .then((res) => setCountries(res.results))
        .catch((err) => console.error("Error fetching countries:", err));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCountry]);

  useEffect(() => {
    if (isOpen && stateId) {
      setLoading(true);
      getStateById(stateId)
        .then((data) => {
          setName(data.name);
          setCountryId(String(data.country || ""));
        })
        .catch(() => setError("Failed to load state data"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, stateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateState(stateId, { name, country: Number(countryId) });
      toast.success("State updated successfully!");

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating state:", err);
      if (err.response?.data) {
        const errors = err.response.data;
        Object.values(errors).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to update state");
      }
    } finally {
      setSaving(false);
    }
  };

  const countryOptions = [
    { value: "", label: "Select Country" },
    ...countries.map(c => ({ value: String(c.id), label: c.name }))
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit State</h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading state data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <Label htmlFor="country">Country *</Label>
              <SearchableSelect
                value={countryId}
                onChange={(val) => setCountryId(val as string)}
                onSearch={setSearchCountry}
                options={countryOptions}
                className="w-full"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="name">State Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
                placeholder="Enter state name"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditState;
