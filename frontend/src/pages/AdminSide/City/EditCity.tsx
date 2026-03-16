import React, { useEffect, useState } from "react";
import { getCityById, updateCity, City } from "./cityapi";
import { getStateList, State } from "../State/stateapi";
import { getCountryList, Country } from "../Country/countryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EditCityProps {
  cityId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditCity: React.FC<EditCityProps> = ({ cityId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [countryList, stateList] = await Promise.all([
          getCountryList(),
          getStateList()
        ]);
        setCountries(countryList);
        setStates(stateList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (isOpen && cityId && states.length > 0) {
      setLoading(true);
      getCityById(cityId)
        .then((data) => {
          setName(data.name);
          const cityStateId = data.state;
          setStateId(String(cityStateId || ""));

          // Find country for this state
          const stateObj = states.find(s => s.id === cityStateId);
          if (stateObj) {
            setCountryId(String(stateObj.country || ""));
          }
        })
        .catch(() => setError("Failed to load city data"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, cityId, states]);

  useEffect(() => {
    if (countryId) {
      const filtered = states.filter(s => s.country === Number(countryId));
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [countryId, states]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCity(cityId, { name, state: Number(stateId) });
      toast.success("City updated successfully!");

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating city:", err);
      if (err.response?.data) {
        const errors = err.response.data;
        Object.values(errors).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to update city");
      }
    } finally {
      setSaving(false);
    }
  };

  const countryOptions = [
    { value: "", label: "Select Country" },
    ...countries.map(c => ({ value: String(c.id), label: c.name }))
  ];

  const stateOptions = [
    { value: "", label: "Select State" },
    ...filteredStates.map(s => ({ value: String(s.id), label: s.name }))
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit City</h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading city data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select
                value={countryId}
                onChange={(val) => {
                  setCountryId(val);
                  setStateId(""); // Reset state when country changes
                }}
                options={countryOptions}
                className="w-full"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={stateId}
                onChange={(val) => setStateId(val)}
                options={stateOptions}
                className="w-full"
                disabled={saving || !countryId}
              />
            </div>
            <div>
              <Label htmlFor="name">City Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving || !stateId}
                placeholder="Enter city name"
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

export default EditCity;
