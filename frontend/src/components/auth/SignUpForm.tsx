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
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerUser } from "./signupApi.ts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "../form/Select";
import axios from "axios";
import { createApiUrl } from "../../access/access.ts";

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

// Form data interface
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
  address: string;
  group: string;
  caste: string;
  religion: string;
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
    address: '',
    group: '',
    caste: '',
    religion: '',
    state: '',
    city: '',
    zip_code: '',
    photo: null
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const [states, setStates] = useState<{value: string, label: string}[]>([]);
  const [cities, setCities] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get(createApiUrl('api/state/?limit=100'));
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

    // Real-time password validation
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

    if (name === 'state') {
      fetchCities(value);
      setFormData(prev => ({ ...prev, city: '' }));
    }
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
        state: formData.state ? parseInt(formData.state) : undefined,
        city: formData.city ? parseInt(formData.city) : undefined,
      });

      if (result.success) {
        toast.success("Registration successful. You can now Sign In.");
        setFormData({
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
          address: '',
          group: '',
          caste: '',
          religion: '',
          state: '',
          city: '',
          zip_code: '',
          photo: null
        });
        setIsCaptchaVerified(false);
      } else {
        const errors = result.details;
        if (typeof errors === "object") {
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => toast.error(`${msg}`));
            } else {
              toast.error(`${field}: ${messages}`);
            }
          });
        } else {
          toast.error(result.error || "Registration failed");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full px-4 py-8 mx-auto lg:px-12">
        <div className="mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign Up
          </h1>
          <ToastContainer position="top-center" autoClose={3000} className="z-[99999]" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* First Name */}
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

              {/* Last Name */}
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

              {/* Gender */}
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

              {/* DOB */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Date Of Birth</Label>
                <div className="col-span-2">
                  <Input
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    leadingIcon={<CalenderIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Email/Username */}
              <div className="grid grid-cols-3 items-start pt-2">
                <Label className="col-span-1 mt-3">Email/Username</Label>
                <div className="col-span-2">
                  <Input
                    name="username"
                    placeholder="abc@abc.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    leadingIcon={<EnvelopeIcon className="size-5 fill-gray-500" />}
                    hint="if you don't have Email-ID, you can use username as yourname@miisky.com Ex-svasth@miisky.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Password</Label>
                <div className="col-span-2 relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    leadingIcon={<LockIcon className="size-5 fill-gray-500" />}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
                  </span>
                </div>
              </div>

              {/* Repassword */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Repassword</Label>
                <div className="col-span-2 relative">
                  <Input
                    name="password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Retype password"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    leadingIcon={<LockIcon className="size-5 fill-gray-500" />}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showConfirmPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
                  </span>
                </div>
              </div>

              {/* Mobile */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Mobile</Label>
                <div className="col-span-2">
                  <Input
                    name="mobile"
                    placeholder="Enter valid Mobile Number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Location</Label>
                <div className="col-span-2">
                  <Input
                    name="lat_lng_address"
                    placeholder="Type Your Location"
                    value={formData.lat_lng_address}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-3 items-start pt-2">
                <Label className="col-span-1 mt-3">Address</Label>
                <div className="col-span-2">
                  <textarea
                    name="address"
                    placeholder="Enter Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:text-white/90 focus:border-brand-300 focus:ring-brand-500/20"
                    rows={3}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">WhatsApp</Label>
                <div className="col-span-2">
                  <Input
                    name="whatsapp"
                    placeholder="WhatsApp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Group */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Group</Label>
                <div className="col-span-2">
                  <Input
                    name="group"
                    placeholder="Group"
                    value={formData.group}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Role */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Role</Label>
                <div className="col-span-2">
                  <Select
                    options={ROLE_OPTIONS}
                    value={formData.role}
                    onChange={(val) => handleSelectChange('role', val)}
                    placeholder="Search and Select Role"
                    leadingIcon={<PlusIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Caste */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Caste</Label>
                <div className="col-span-2">
                  <Input
                    name="caste"
                    placeholder="Caste"
                    value={formData.caste}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Religion */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Religion</Label>
                <div className="col-span-2">
                  <Input
                    name="religion"
                    placeholder="Religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    leadingIcon={<PlusIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* State */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">State</Label>
                <div className="col-span-2">
                  <Select
                    options={states}
                    value={formData.state}
                    onChange={(val) => handleSelectChange('state', val)}
                    placeholder="Search State"
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* City */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">City</Label>
                <div className="col-span-2">
                  <Select
                    options={cities}
                    value={formData.city}
                    onChange={(val) => handleSelectChange('city', val)}
                    placeholder="Search City"
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                    disabled={!formData.state}
                  />
                </div>
              </div>

              {/* Zip */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Zip</Label>
                <div className="col-span-2">
                  <Input
                    name="zip_code"
                    placeholder="Enter Zip"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    leadingIcon={<UserIcon className="size-5 fill-gray-500" />}
                  />
                </div>
              </div>

              {/* Photo */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Photo</Label>
                <div className="col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              {/* Captcha */}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Captcha</Label>
                <div className="col-span-2">
                  <div 
                    onClick={() => setIsCaptchaVerified(!isCaptchaVerified)}
                    className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`size-6 rounded border-2 flex items-center justify-center ${isCaptchaVerified ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-300'}`}>
                      {isCaptchaVerified && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm font-medium">I'm not a robot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-12">
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="flex items-center justify-center px-12 py-3 text-sm font-medium text-white transition rounded-lg bg-[#3D88B9] hover:bg-[#2d6a91] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PencilIcon className="size-4 mr-2" />
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Already have an account? {""}
            <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
