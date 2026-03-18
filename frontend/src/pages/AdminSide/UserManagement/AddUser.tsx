import React, { useEffect, useMemo, useState } from "react";
import { createUser, UserRegister } from "./api";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "../../../components/form/Select";
import { getCountryList, Country } from "../Country/countryapi";
import { getStateList, State } from "../State/stateapi";
import { getCityList, City } from "../City/cityapi";


interface AddUserProps {
  onClose: () => void;
  onAdd: (newUser: UserRegister) => void;
}

const AddUser: React.FC<AddUserProps> = ({ onClose, onAdd }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRegister["role"]>("patient");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<UserRegister["gender"]>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [joinedDate, setJoinedDate] = useState("");

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
      zip_code: zipCode || null,
      country: countryId ? Number(countryId) : null,
      state: stateId ? Number(stateId) : null,
      city: cityId ? Number(cityId) : null,
      joined_date: joinedDate ? new Date(joinedDate).toISOString() : null,
    };

    const createdUser = await createUser(newUser);

    toast.success("User created successfully!");

    // Close modal after a short delay
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
          Add New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
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

          {/* Email */}
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

          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onChange={(val) => setRole(val)}
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
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label htmlFor="whatsapp">Whatsapp</Label>
            <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} />
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
            <Label htmlFor="address">Address</Label>
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
            <Label htmlFor="joinedDate">Joined Date</Label>
            <Input
              id="joinedDate"
              type="datetime-local"
              value={joinedDate}
              onChange={(e) => setJoinedDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Active */}
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

          {/* Buttons */}
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
