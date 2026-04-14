import React, { useEffect, useState, useRef } from "react";
import { getCityById, updateCity } from "./cityapi";
import { getStateList, State } from "../State/stateapi";
import { getCountryList, Country } from "../Country/countryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";
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
  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");
  const [hasInteractedCountries, setHasInteractedCountries] = useState(false);
  const [hasInteractedStates, setHasInteractedStates] = useState(false);
  const fetchingCountriesRef = useRef(false);
  const fetchingStatesRef = useRef(false);

  useEffect(() => {
    if (!hasInteractedCountries && !searchCountry) return;
    if (fetchingCountriesRef.current) return;
    fetchingCountriesRef.current = true;
    const timer = setTimeout(() => {
      getCountryList(1, "all", searchCountry)
        .then((res) => setCountries(res.results))
        .catch((err) => console.error(err))
        .finally(() => { fetchingCountriesRef.current = false; });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCountry, hasInteractedCountries]);

  useEffect(() => {
    if (!hasInteractedStates && !searchState && states.length === 0) {
       // If we need initial states for form and haven't fetched yet 
       // but here we wait for form to trigger if needed or user to focus
    }
    if (!hasInteractedStates && !searchState) return;
    if (fetchingStatesRef.current) return;
    fetchingStatesRef.current = true;
    const timer = setTimeout(() => {
      getStateList(1, "all", searchState)
        .then((res) => setStates(res.results))
        .catch((err) => console.error(err))
        .finally(() => { fetchingStatesRef.current = false; });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchState, hasInteractedStates]);

  useEffect(() => {
    if (isOpen && cityId) {
      const initializeData = async () => {
        setLoading(true);
        try {
          // Fetch required data in parallel only if needed
          const [cityData, allStates] = await Promise.all([
            getCityById(cityId),
            states.length === 0 ? getStateList(1, "all") : Promise.resolve({ results: states })
          ]);

          setName(cityData.name);
          const cityStateId = cityData.state;
          setStateId(String(cityStateId || ""));
          
          if (states.length === 0) setStates(allStates.results);

          const stateObj = allStates.results.find((s: any) => s.id === cityStateId);
          if (stateObj) {
            setCountryId(String(stateObj.country || ""));
            // Fetch country list to populate options if not already there
            if (countries.length === 0) {
                const countryRes = await getCountryList(1, "all");
                setCountries(countryRes.results);
            }
          }
        } catch (err) {
          setError("Failed to load city data");
        } finally {
          setLoading(false);
        }
      };
      initializeData();
    }
  }, [isOpen, cityId]);

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
              <SearchableSelect
                value={countryId}
                onChange={(val) => {
                  setCountryId(val as string);
                  setStateId(""); // Reset state when country changes
                  setHasInteractedCountries(true);
                }}
                onFocus={() => setHasInteractedCountries(true)}
                onSearch={setSearchCountry}
                options={countryOptions}
                className="w-full"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <SearchableSelect
                value={stateId}
                onChange={(val) => {
                  setStateId(val as string);
                  setHasInteractedStates(true);
                }}
                onFocus={() => setHasInteractedStates(true)}
                onSearch={setSearchState}
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
