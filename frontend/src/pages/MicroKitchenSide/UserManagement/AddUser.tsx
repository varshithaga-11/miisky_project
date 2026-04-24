import React, { useEffect, useMemo, useState } from "react";
import { createUser, UserRegister } from "./api";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "../../../components/form/Select";
import { getCountryList, Country } from "../../AdminSide/Country/countryapi";
import { getStateList, State } from "../../AdminSide/State/stateapi";
import { getCityList, City } from "../../AdminSide/City/cityapi";
import DatePicker2 from "../../../components/form/date-picker2";
import { FiMapPin, FiEye, FiEyeOff } from "react-icons/fi";
import { MapLocationPicker } from "../../../components/common/MapLocationPicker";

interface AddUserProps {
  onClose: () => void;
  onAdd: (newUser: UserRegister) => void;
}

const AddUser: React.FC<AddUserProps> = ({ onClose, onAdd }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  // Fixed role for Supply Chain management
  const role: UserRegister["role"] = "supply_chain";
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<UserRegister["gender"]>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [latLngAddress, setLatLngAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [joinedDate, setJoinedDate] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const [countryId, setCountryId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [loading, setLoading] = useState(false);
  const [error] = useState("");

  useEffect(() => {
    getCountryList(1, "all")
      .then((res) => setCountries(res.results))
      .catch((err) => console.error("Error fetching countries:", err));
    getStateList(1, "all")
      .then((res) => setStates(res.results))
      .catch((err) => console.error("Error fetching states:", err));
    getCityList(1, "all")
      .then((res) => setCities(res.results))
      .catch((err) => console.error("Error fetching cities:", err));
  }, []);

  const countryOptions = useMemo(
    () => [{ value: "", label: "Select Country" }, ...countries.map((c) => ({ value: String(c.id), label: c.name }))],
    [countries]
  );

  const stateOptions = useMemo(
    () => [{ value: "", label: "Select State" }, ...states.map((s) => ({ value: String(s.id), label: s.name }))],
    [states]
  );

  const cityOptions = useMemo(
    () => [{ value: "", label: "Select City" }, ...cities.map((c) => ({ value: String(c.id), label: c.name }))],
    [cities]
  );

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "MiiskyApp/1.0" } }
      );
      const data = await res.json();
      return data?.display_name || null;
    } catch {
      return null;
    }
  };

  const handleLocationFromCoords = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    const resolved = await reverseGeocode(lat, lng);
    if (resolved) {
      setLatLngAddress(resolved);
      toast.success("Location and map address updated");
    } else {
      toast.success("Location captured (map address could not be fetched)");
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleLocationFromCoords(pos.coords.latitude, pos.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        toast.error("Could not get location. Check permissions.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleGetFromAddress = async () => {
    const cityName = cities.find((c) => String(c.id) === cityId)?.name || "";
    const stateName = states.find((s) => String(s.id) === stateId)?.name || "";
    const countryName = countries.find((c) => String(c.id) === countryId)?.name || "";
    const query = [address, cityName, stateName, countryName].filter(Boolean).join(", ");
    if (!query.trim()) {
      toast.error("Enter address or select city/state/country first");
      return;
    }
    setLocationLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { "User-Agent": "MiiskyApp/1.0" } }
      );
      const data = await res.json();
      if (data?.[0]) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        if (data[0].display_name) setLatLngAddress(data[0].display_name);
        toast.success("Coordinates from address");
      } else {
        toast.error("Address not found. Try a more complete address.");
      }
    } catch {
      toast.error("Could not get coordinates");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const newUser: UserRegister = {
        username,
        email,
        role,
        first_name: firstName,
        last_name: lastName,
        is_active: isActive,
        password,
        password_confirm: confirmPassword,
        mobile: mobile || null,
        whatsapp: whatsapp || null,
        dob: dob || null,
        gender: gender || null,
        photo: photo || null,
        address: address || null,
        lat_lng_address: latLngAddress || null,
        zip_code: zipCode || null,
        country: countryId ? Number(countryId) : null,
        state: stateId ? Number(stateId) : null,
        city: cityId ? Number(cityId) : null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        joined_date: joinedDate ? new Date(joinedDate).toISOString() : null,
      };

      const createdUser = await createUser(newUser);

      toast.success("User created successfully!");

      setTimeout(() => {
        onAdd(createdUser);
        onClose();
      }, 3500);
    } catch (err: any) {
      console.error("Error creating user:", err);

      if (err.response?.data) {
        const errors = err.response.data;
        Object.values(errors).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 ">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-[99999]"
        />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto relative mt-24">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full 
                    text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Add Supply Chain User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Role is hidden and locked to supply_chain */}
          <input type="hidden" value={role} />

          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label htmlFor="whatsapp">Whatsapp</Label>
            <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={loading} />
          </div>

          <div>
            <DatePicker2
                id="dob"
                label="Date of Birth"
                value={dob}
                onChange={(date) => setDob(date)}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={gender ?? ""}
              onChange={(val) => setGender((val as any) || null)}
              options={[
                { value: "", label: "Select Gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="photo">Photo</Label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              disabled={loading}
              className="w-full text-sm"
            />
          </div>

          <div>
            <Label htmlFor="address">Street address</Label>
            <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select value={countryId} onChange={(val) => setCountryId(val)} options={countryOptions} className="w-full" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Select value={stateId} onChange={(val) => setStateId(val)} options={stateOptions} className="w-full" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Select value={cityId} onChange={(val) => setCityId(val)} options={cityOptions} className="w-full" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input id="zipCode" type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label>Location (home / delivery)</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={loading || locationLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <FiMapPin size={14} />
                Use my location
              </button>
              <button
                type="button"
                onClick={handleGetFromAddress}
                disabled={loading || locationLoading || (!address?.trim() && !cityId && !stateId && !countryId)}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Get from address
              </button>
              <button
                type="button"
                onClick={() => setMapPickerOpen(true)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Select from map
              </button>
            </div>
            <MapLocationPicker
              isOpen={mapPickerOpen}
              onClose={() => setMapPickerOpen(false)}
              onSelect={async (lat, lng) => {
                await handleLocationFromCoords(lat, lng);
              }}
              initialLat={latitude}
              initialLng={longitude}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude ?? ""}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude ?? ""}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Label htmlFor="latLngAddress" className="text-xs">
                Address from map / GPS
              </Label>
              <textarea
                id="latLngAddress"
                rows={3}
                value={latLngAddress}
                onChange={(e) => setLatLngAddress(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <DatePicker2
              id="joinedDate"
              label="Joined Date"
              value={joinedDate}
              onChange={(date) => setJoinedDate(date)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
              className="w-4 h-4"
              disabled={loading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
