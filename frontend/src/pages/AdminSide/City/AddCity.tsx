import React, { useState, useEffect } from "react";
import { createCity, City } from "./cityapi";
import { getStateList, State } from "../State/stateapi";
import { getCountryList, Country } from "../Country/countryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddCityProps {
  onClose: () => void;
  onAdd: (newCity: City) => void;
}

const AddCity: React.FC<AddCityProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");

  const [hasInteractedCountries, setHasInteractedCountries] = useState(false);
  const [hasInteractedStates, setHasInteractedStates] = useState(false);

  useEffect(() => {
    if (!hasInteractedCountries && !searchCountry) return;
    const timer = setTimeout(() => {
      getCountryList(1, "all", searchCountry)
        .then((res) => setCountries(res.results))
        .catch((err) => console.error(err));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCountry, hasInteractedCountries]);

  useEffect(() => {
    if (!hasInteractedStates && !searchState) return;
    const timer = setTimeout(() => {
      getStateList(1, "all", searchState)
        .then((res) => setStates(res.results))
        .catch((err) => console.error(err));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchState, hasInteractedStates]);

  useEffect(() => {
    if (countryId) {
      const filtered = states.filter(s => s.country === Number(countryId));
      setFilteredStates(filtered);
      setStateId(""); // Reset state when country changes
    } else {
      setFilteredStates([]);
      setStateId("");
    }
  }, [countryId, states]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateId) {
      toast.error("Please select a state");
      return;
    }

    setLoading(true);
    try {
      const newCity: City = {
        name,
        state: Number(stateId),
      };

      const createdCity = await createCity(newCity);
      toast.success("City created successfully!");

      setTimeout(() => {
        onAdd(createdCity);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error creating city:", err);
      if (err.response?.data) {
        const errors = err.response.data;
        Object.values(errors).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to create city");
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New City</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="country">Country *</Label>
            <SearchableSelect
              value={countryId}
              onChange={(val) => {
                setCountryId(val as string);
                setHasInteractedCountries(true);
              }}
              onFocus={() => {
                setHasInteractedCountries(true);
              }}
              onSearch={setSearchCountry}
              options={countryOptions}
              className="w-full"
              disabled={loading}
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
              onFocus={() => {
                setHasInteractedStates(true);
              }}
              onSearch={setSearchState}
              options={stateOptions}
              className="w-full"
              disabled={loading || !countryId}
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
              disabled={loading || !stateId}
              placeholder="Enter city name"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCity;
