import React, { useEffect, useMemo, useState } from "react";
import { getUserById, updateUser, UserRegister } from "./api";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "../../../components/form/Select";
import { getCountryList, Country } from "../Country/countryapi";
import { getStateList, State } from "../State/stateapi";
import { getCityList, City } from "../City/cityapi";
import DatePicker2 from "../../../components/form/date-picker2";

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
  const [photo, setPhoto] = useState<File | null>(null);

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
      if (password) updateData.password = password;
      if (password || confirmPassword) updateData.password_confirm = confirmPassword;
      if (photo) updateData.photo = photo;

      await updateUser(userId, updateData);

      setPassword("");
      setConfirmPassword("");

      toast.success("User updated successfully!");

      // Delay modal close for better UX
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full 
                    text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Edit User
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
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

          {/* Email */}
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

          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={userData.role || "patient"}
              onChange={(val) => handleChange("role", val)}
              options={[
                { value: "admin", label: "Admin" },
                { value: "nutritionist", label: "Nutritionist/Dietician" },
                { value: "patient", label: "Patient" },
                { value: "supply_chain", label: "Supply Chain" },
                { value: "food_buyer", label: "Food Buyer" },
                { value: "micro_kitchen", label: "Micro Kitchen" },
                { value: "non_patient", label: "Non Patient" },
              ]}
              className="w-full"
              disabled={saving}
            />
          </div>

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
            <Label htmlFor="address">Address</Label>
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
            <DatePicker2
              id="joinedDate"
              label="Joined Date"
              value={userData.joined_date ? new Date(userData.joined_date).toISOString().split('T')[0] : ""}
              onChange={(date) => handleChange("joined_date", date)}
            />
          </div>


          {/* Password */}
          <div>
            <Label htmlFor="password">New Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={saving}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={saving}
              placeholder="Confirm new password"
            />
          </div>

          {/* Active */}
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

          {/* Buttons */}
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
