import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  EyeCloseIcon, 
  EyeIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockIcon, 
  CalenderIcon,
  PlusIcon,
  PencilIcon,
} from "../../icons";
import { FiGlobe, FiMapPin } from "react-icons/fi";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerUser } from "./signupApi.ts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "../form/Select";
import axios from "axios";
import { createApiUrl } from "../../access/access.ts";
import { MapLocationPicker } from "../common/MapLocationPicker";
import DatePicker2 from "../form/date-picker2";

const ROLE_OPTIONS = [
  { value: "patient", label: "Patient" },
  { value: "nutritionist", label: "Nutritionist" },
  { value: "micro_kitchen", label: "Micro Kitchen" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "non_patient", label: "Non-Patient" },
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "food_buyer", label: "Food Buyer" },
  { value: "master", label: "Master" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  role: string;
  gender: string;
  dob: string;
  mobile: string;
  whatsapp: string;
  lat_lng_address: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  group: string;
  caste: string;
  religion: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  photo: File | null;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    role: '',
    gender: '',
    dob: '',
    mobile: '',
    whatsapp: '',
    lat_lng_address: '',
    latitude: null,
    longitude: null,
    address: '',
    group: '',
    caste: '',
    religion: '',
    country: '',
    state: '',
    city: '',
    zip_code: '',
    photo: null
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const [countries, setCountries] = useState<{value: string, label: string}[]>([]);
  const [states, setStates] = useState<{value: string, label: string}[]>([]);
  const [cities, setCities] = useState<{value: string, label: string}[]>([]);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get(createApiUrl('api/country/?limit=250'));
      const options = response.data.results.map((c: any) => ({ value: c.id.toString(), label: c.name }));
      setCountries(options);
    } catch (err) {
      console.error("Failed to fetch countries", err);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await axios.get(createApiUrl(`api/state/?country=${countryId}&limit=100`));
      const options = response.data.results.map((s: any) => ({ value: s.id.toString(), label: s.name }));
      setStates(options);
    } catch (err) {
      console.error("Failed to fetch states", err);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await axios.get(createApiUrl(`api/city/?state=${stateId}&limit=100`));
      const options = response.data.results.map((c: any) => ({ value: c.id.toString(), label: c.name }));
      setCities(options);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password' || name === 'password_confirm') {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'password_confirm' ? value : formData.password_confirm;

      if (confirmPassword.length > 0) {
        const match = password === confirmPassword;
        setPasswordsMatch(match);
        setShowPasswordError(!match);
      } else {
        setShowPasswordError(false);
        setPasswordsMatch(true);
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'country') {
      fetchStates(value);
      setFormData(prev => ({ ...prev, country: value, state: '', city: '' }));
      setStates([]);
      setCities([]);
    } else if (name === 'state') {
      fetchCities(value);
      setFormData(prev => ({ ...prev, state: value, city: '' }));
      setCities([]);
    }
  };

  const handleLocationFromCoords = async (lat: number, lng: number) => {
    setLocationLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "MiiskyApp/1.0" } }
      );
      const data = await res.json();
      const addr = data.display_name || `${lat}, ${lng}`;
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        lat_lng_address: addr
      }));
      toast.success("Location selected from map");
    } catch (error) {
      console.error("Error reverse geocoding", error);
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        lat_lng_address: `${lat}, ${lng}`
      }));
    } finally {
      setLocationLoading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch || formData.password !== formData.password_confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isCaptchaVerified) {
      toast.error("Please verify that you are not a robot");
      return;
    }

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.password_confirm ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        ...formData,
        country: formData.country ? parseInt(formData.country) : undefined,
        state: formData.state ? parseInt(formData.state) : undefined,
        city: formData.city ? parseInt(formData.city) : undefined,
      });

      if (result.success) {
        toast.success("Registration successful. You can now Sign In.");
        // Reset form...
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full px-4 py-8 mx-auto lg:px-12">
        <div className="mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
            Sign Up
          </h1>
          <ToastContainer position="top-center" autoClose={3000} className="z-[99999]" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Firstname</Label>
                <div className="col-span-2">
                  <Input
                    name="first_name"
                    placeholder="Firstname"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Lastname</Label>
                <div className="col-span-2">
                  <Input
                    name="last_name"
                    placeholder="Lastname"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Gender</Label>
                <div className="col-span-2">
                  <Select
                    options={GENDER_OPTIONS}
                    value={formData.gender}
                    onChange={(val) => handleSelectChange('gender', val)}
                    placeholder="Please Select"
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Date Of Birth</Label>
                <div className="col-span-2">
                  <DatePicker2
                    id="dob"
                    value={formData.dob}
                    onChange={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Email</Label>
                <div className="col-span-2">
                  <Input
                    name="email"
                    type="email"
                    placeholder="abc@abc.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    leadingIcon={<EnvelopeIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Username</Label>
                <div className="col-span-2">
                  <Input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                    hint="Choose a unique username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Password</Label>
                <div className="col-span-2 relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    leadingIcon={
                      <span onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                        {showPassword ? <EyeIcon className="size-5 fill-gray-500" /> : <EyeCloseIcon className="size-5 fill-gray-500" />}
                      </span>
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Repassword</Label>
                <div className="col-span-2 relative">
                  <Input
                    name="password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Retype password"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    leadingIcon={
                      <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="cursor-pointer">
                        {showConfirmPassword ? <EyeIcon className="size-5 fill-gray-500" /> : <EyeCloseIcon className="size-5 fill-gray-500" />}
                      </span>
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Mobile</Label>
                <div className="col-span-2">
                  <Input
                    name="mobile"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-start pt-2">
                <Label className="col-span-1 mt-3">Address</Label>
                <div className="col-span-2 space-y-4">
                  <textarea
                    name="address"
                    placeholder="Enter Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:text-white/90 focus:border-brand-300 focus:ring-brand-500/20"
                    rows={3}
                  />
                  
                  <div>
                    <Label className="text-xs mb-1 block">Location Coordination</Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                      >
                        <FiMapPin size={12} />
                        Use My Location
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapPickerOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-xs font-medium"
                      >
                        <FiGlobe size={12} />
                        Select from Map
                      </button>
                    </div>
                  </div>
                  
                  <Input
                    name="lat_lng_address"
                    placeholder="Location details..."
                    value={formData.lat_lng_address}
                    onChange={handleInputChange}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Country</Label>
                <div className="col-span-2">
                  <Select
                    options={countries}
                    value={formData.country}
                    onChange={(val) => handleSelectChange('country', val)}
                    placeholder="Search Country"
                    leadingIcon={<FiGlobe className="size-5 text-gray-500" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">State</Label>
                <div className="col-span-2">
                  <Select
                    options={states}
                    value={formData.state}
                    onChange={(val) => handleSelectChange('state', val)}
                    placeholder="Search State"
                    leadingIcon={<PlusIcon className="size-5 fill-gray-500" />}
                    disabled={!formData.country}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">City</Label>
                <div className="col-span-2">
                  <Select
                    options={cities}
                    value={formData.city}
                    onChange={(val) => handleSelectChange('city', val)}
                    placeholder="Search City"
                    leadingIcon={<PlusIcon className="size-5 fill-gray-500" />}
                    disabled={!formData.state}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Zip Code</Label>
                <div className="col-span-2">
                  <Input
                    name="zip_code"
                    placeholder="Enter Zip"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Role</Label>
                <div className="col-span-2">
                  <Select
                    options={ROLE_OPTIONS}
                    value={formData.role}
                    onChange={(val) => handleSelectChange('role', val)}
                    placeholder="Search and Select Role"
                  />
                </div>
              </div>

              {/* Group, Caste, Religion etc... */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Religion</Label>
                <div className="col-span-2">
                  <Input
                    name="religion"
                    placeholder="Religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Caste</Label>
                <div className="col-span-2">
                  <Input
                    name="caste"
                    placeholder="Caste"
                    value={formData.caste}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Photo</Label>
                <div className="col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Captcha</Label>
                <div className="col-span-2">
                  <div 
                    onClick={() => setIsCaptchaVerified(!isCaptchaVerified)}
                    className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`size-5 rounded border flex items-center justify-center ${isCaptchaVerified ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-300'}`}>
                      {isCaptchaVerified && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-xs font-medium">I'm not a robot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="flex items-center justify-center px-16 py-3 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
            >
              <PencilIcon className="size-4 mr-2" />
              {isLoading ? 'Signing Up...' : 'Create Account'}
            </button>
          </div>
        </form>

        <MapLocationPicker
          isOpen={mapPickerOpen}
          onClose={() => setMapPickerOpen(false)}
          onSelect={async (lat, lng) => {
            await handleLocationFromCoords(lat, lng);
            setMapPickerOpen(false);
          }}
          initialLat={formData.latitude || undefined}
          initialLng={formData.longitude || undefined}
        />

        <div className="mt-8 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Already have an account? {""}
            <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

