import React, { useEffect, useMemo, useState } from "react";
import { getUserById, updateUser, UserRegister } from "./api";
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

interface EditUserProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ userId, isOpen, onClose, onUpdated }) => {
  const [userData, setUserData] = useState<Partial<UserRegister>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    getCountryList(1, "all")
      .then((res) => setCountries(res.results))
      .catch((err) => console.error(err));
    getStateList(1, "all")
      .then((res) => setStates(res.results))
      .catch((err) => console.error(err));
    getCityList(1, "all")
      .then((res) => setCities(res.results))
      .catch((err) => console.error(err));
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
    handleChange("latitude", lat);
    handleChange("longitude", lng);
    const resolved = await reverseGeocode(lat, lng);
    if (resolved) {
      handleChange("lat_lng_address", resolved);
      toast.success("Location and map address updated");
    } else {
      toast.success("Location captured (map address could not be fetched)");
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError("");
    getUserById(userId)
      .then((data) => setUserData(data))
      .catch(() => setError("Failed to load user data"))
      .finally(() => setLoading(false));
  }, [isOpen, userId]);

  const handleChange = (field: keyof UserRegister, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
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
    const addr = (userData.address as string) || "";
    const cityName = cities.find((c) => String(c.id) === String(userData.city))?.name || "";
    const stateName = states.find((s) => String(s.id) === String(userData.state))?.name || "";
    const countryName = countries.find((c) => String(c.id) === String(userData.country))?.name || "";
    const query = [addr, cityName, stateName, countryName].filter(Boolean).join(", ");
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
        handleChange("latitude", parseFloat(data[0].lat));
        handleChange("longitude", parseFloat(data[0].lon));
        if (data[0].display_name) handleChange("lat_lng_address", data[0].display_name);
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

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }

    setSaving(true);
    try {
      const updateData: Partial<UserRegister> = { ...userData };
      // Ensure role stays supply_chain
      updateData.role = "supply_chain";
      
      if (password) updateData.password = password;
      if (password || confirmPassword) updateData.password_confirm = confirmPassword;
      if (photo) updateData.photo = photo;

      await updateUser(userId, updateData);

      setPassword("");
      setConfirmPassword("");

      toast.success("User updated successfully!");

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating user:", err);

      if (err.response?.data) {
        const errors = err.response.data;
        Object.values(errors).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to update user");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-black dark:text-white">
          Loading user data...
        </div>
      </div>
    );
  }

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
          Edit Supply Chain User
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={userData.username || ""}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={userData.first_name || ""}
              onChange={(e) => handleChange("first_name", e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={userData.last_name || ""}
              onChange={(e) => handleChange("last_name", e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Role hidden and locked */}
          <input type="hidden" value="supply_chain" />

          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" type="tel" value={userData.mobile || ""} onChange={(e) => handleChange("mobile", e.target.value)} disabled={saving} />
          </div>

          <div>
            <Label htmlFor="whatsapp">Whatsapp</Label>
            <Input id="whatsapp" type="tel" value={userData.whatsapp || ""} onChange={(e) => handleChange("whatsapp", e.target.value)} disabled={saving} />
          </div>

          <div>
            <DatePicker2
              id="dob"
              label="Date of Birth"
              value={(userData.dob as any) || ""}
              onChange={(date) => handleChange("dob", date)}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={(userData.gender as any) || ""}
              onChange={(val) => handleChange("gender", (val as any) || null)}
              options={[
                { value: "", label: "Select Gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              className="w-full"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="photo">Photo</Label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              disabled={saving}
              className="w-full text-sm"
            />
          </div>

          <div>
            <Label htmlFor="address">Street address</Label>
            <Input id="address" type="text" value={userData.address || ""} onChange={(e) => handleChange("address", e.target.value)} disabled={saving} />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              value={userData.country ? String(userData.country) : ""}
              onChange={(val) => handleChange("country", val ? Number(val) : null)}
              options={countryOptions}
              className="w-full"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Select
              value={userData.state ? String(userData.state) : ""}
              onChange={(val) => handleChange("state", val ? Number(val) : null)}
              options={stateOptions}
              className="w-full"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Select
              value={userData.city ? String(userData.city) : ""}
              onChange={(val) => handleChange("city", val ? Number(val) : null)}
              options={cityOptions}
              className="w-full"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input id="zipCode" type="text" value={userData.zip_code || ""} onChange={(e) => handleChange("zip_code", e.target.value)} disabled={saving} />
          </div>

          <div>
            <Label>Location (home / delivery)</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={saving || locationLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <FiMapPin size={14} />
                Use my location
              </button>
              <button
                type="button"
                onClick={handleGetFromAddress}
                disabled={
                  saving ||
                  locationLoading ||
                  (!(userData.address as string)?.trim() && !userData.city && !userData.state && !userData.country)
                }
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Get from address
              </button>
              <button
                type="button"
                onClick={() => setMapPickerOpen(true)}
                disabled={saving}
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
              initialLat={userData.latitude as number | null | undefined}
              initialLng={userData.longitude as number | null | undefined}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={userData.latitude ?? ""}
                  onChange={(e) => handleChange("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={saving}
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={userData.longitude ?? ""}
                  onChange={(e) => handleChange("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={saving}
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
                value={(userData.lat_lng_address as string) || ""}
                onChange={(e) => handleChange("lat_lng_address", e.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <DatePicker2
              id="joinedDate"
              label="Joined Date"
              value={userData.joined_date ? new Date(userData.joined_date).toISOString().split('T')[0] : ""}
              onChange={(date) => handleChange("joined_date", date)}
            />
          </div>

          <div>
            <Label htmlFor="password">New Password (optional)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={saving}
                placeholder="Leave blank to keep current password"
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
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={saving}
                placeholder="Confirm new password"
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
              checked={!!userData.is_active}
              onChange={() => handleChange("is_active", !userData.is_active)}
              className="w-4 h-4"
              disabled={saving}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
