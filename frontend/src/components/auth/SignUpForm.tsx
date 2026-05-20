import { useState, useEffect, useRef } from "react";
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
import { FiGlobe, FiMapPin, FiHeart } from "react-icons/fi";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerUser } from "./signupApi.ts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchableSelect from "../form/SearchableSelect";
import axios from "axios";
import { createApiUrl } from "../../access/access.ts";
import { MapLocationPicker } from "../common/MapLocationPicker";
import DatePicker2 from "../form/date-picker2";
import Select from "../form/Select";

const ROLE_OPTIONS = [
  // { value: "admin", label: "Admin" },
  // { value: "master", label: "Master" },
  { value: "nutritionist", label: "Nutritionist/Dietician" },
  { value: "doctor", label: "Doctor" },
  { value: "micro_kitchen", label: "Micro Kitchen" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "patient", label: "Patient" },
  { value: "non_patient", label: "Non Patient" },
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
  alternative_email: string;
  username: string;
  password: string;
  password_confirm: string;
  roles: string[];
  gender: string;
  mobile: string;
  alternative_mobile: string;
  lat_lng_address: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
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
    alternative_email: '',
    username: '',
    password: '',
    password_confirm: '',
    roles: [],
    gender: '',
    mobile: '',
    alternative_mobile: '',
    lat_lng_address: '',
    latitude: null,
    longitude: null,
    address: '',
    country: '',
    state: '',
    city: '',
    zip_code: '',
    photo: null
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const [countries, setCountries] = useState<{ value: string, label: string }[]>([]);
  const [countryPage, setCountryPage] = useState(1);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryHasMore, setCountryHasMore] = useState(true);

  const [states, setStates] = useState<{ value: string, label: string }[]>([]);
  const [statePage, setStatePage] = useState(1);
  const [stateSearch, setStateSearch] = useState("");
  const [stateLoading, setStateLoading] = useState(false);
  const [stateHasMore, setStateHasMore] = useState(true);

  const [cities, setCities] = useState<{ value: string, label: string }[]>([]);
  const [cityPage, setCityPage] = useState(1);
  const [citySearch, setCitySearch] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityHasMore, setCityHasMore] = useState(true);

  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const countryDebounceRef = useRef<any>(null);
  const stateDebounceRef = useRef<any>(null);
  const cityDebounceRef = useRef<any>(null);

  useEffect(() => {
    fetchCountries(1, "");
    return () => {
      clearTimeout(countryDebounceRef.current);
      clearTimeout(stateDebounceRef.current);
      clearTimeout(cityDebounceRef.current);
    };
  }, []);

  const fetchCountries = async (page: number, search: string, append: boolean = false) => {
    if (countryLoading) return;
    setCountryLoading(true);
    try {
      const response = await axios.get(createApiUrl(`api/country/?page=${page}&limit=10&search=${encodeURIComponent(search)}`));
      const results = response.data.results || [];
      const options = results.map((c: any) => ({ value: c.id.toString(), label: c.name }));
      setCountries(prev => append ? [...prev, ...options] : options);
      setCountryHasMore(!!response.data.next);
      setCountryPage(page);
    } catch (err) {
      console.error("Failed to fetch countries", err);
    } finally {
      setCountryLoading(false);
    }
  };

  const fetchStates = async (countryId: string, page: number = 1, search: string = "", append: boolean = false) => {
    if (!countryId || stateLoading) return;
    setStateLoading(true);
    try {
      const response = await axios.get(createApiUrl(`api/state/?country=${countryId}&page=${page}&limit=10&search=${encodeURIComponent(search)}`));
      const results = response.data.results || [];
      const options = results.map((s: any) => ({ value: s.id.toString(), label: s.name }));
      setStates(prev => append ? [...prev, ...options] : options);
      setStateHasMore(!!response.data.next);
      setStatePage(page);
    } catch (err) {
      console.error("Failed to fetch states", err);
    } finally {
      setStateLoading(false);
    }
  };

  const fetchCities = async (stateId: string, page: number = 1, search: string = "", append: boolean = false) => {
    if (!stateId || cityLoading) return;
    setCityLoading(true);
    try {
      const response = await axios.get(createApiUrl(`api/city/?state=${stateId}&page=${page}&limit=10&search=${encodeURIComponent(search)}`));
      const results = response.data.results || [];
      const options = results.map((c: any) => ({ value: c.id.toString(), label: c.name }));
      setCities(prev => append ? [...prev, ...options] : options);
      setCityHasMore(!!response.data.next);
      setCityPage(page);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    } finally {
      setCityLoading(false);
    }
  };

  const handleCountrySearch = (term: string) => {
    setCountrySearch(term);
    clearTimeout(countryDebounceRef.current);
    countryDebounceRef.current = setTimeout(() => {
      fetchCountries(1, term);
    }, 400);
  };

  const handleCountryScrollEnd = () => {
    if (countryHasMore && !countryLoading) {
      fetchCountries(countryPage + 1, countrySearch, true);
    }
  };

  const handleStateSearch = (term: string) => {
    setStateSearch(term);
    clearTimeout(stateDebounceRef.current);
    stateDebounceRef.current = setTimeout(() => {
      if (formData.country) {
        fetchStates(formData.country, 1, term);
      }
    }, 400);
  };

  const handleStateScrollEnd = () => {
    if (stateHasMore && !stateLoading && formData.country) {
      fetchStates(formData.country, statePage + 1, stateSearch, true);
    }
  };

  const handleCitySearch = (term: string) => {
    setCitySearch(term);
    clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(() => {
      if (formData.state) {
        fetchCities(formData.state, 1, term);
      }
    }, 400);
  };

  const handleCityScrollEnd = () => {
    if (cityHasMore && !cityLoading && formData.state) {
      fetchCities(formData.state, cityPage + 1, citySearch, true);
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
        setPasswordsMatch(password === confirmPassword);
      } else {
        setPasswordsMatch(true);
      }
    }
  };

  const handleRoleChange = (roleValue: string) => {
    setFormData(prev => {
      const isSelected = prev.roles.includes(roleValue);
      if (isSelected) {
        return { ...prev, roles: prev.roles.filter(r => r !== roleValue) };
      } else {
        return { ...prev, roles: [...prev.roles, roleValue] };
      }
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'country') {
      setFormData(prev => ({ ...prev, country: value, state: '', city: '' }));
      setStates([]);
      setCities([]);
      setStatePage(1);
      setStateSearch("");
      setStateHasMore(true);
      setCityPage(1);
      setCitySearch("");
      setCityHasMore(true);
      fetchStates(value, 1, "");
    } else if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, city: '' }));
      setCities([]);
      setCityPage(1);
      setCitySearch("");
      setCityHasMore(true);
      fetchCities(value, 1, "");
    }
  };

  const handleLocationFromCoords = async (lat: number, lng: number) => {
    setLocationLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { "User-Agent": "MiiskyApp/1.0" } });
      const data = await res.json();
      const addr = data.display_name || `${lat}, ${lng}`;
      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, lat_lng_address: addr }));
      toast.success("Location selected from map");
    } catch (error) {
      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, lat_lng_address: `${lat}, ${lng}` }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleLocationFromCoords(pos.coords.latitude, pos.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        toast.error("Geolocation failed");
        setLocationLoading(false);
      }
    );
  };

  const fetchDetailsByIdentifier = async (identifier: string) => {
    if (!identifier) return;
    setIsLoading(true);
    try {
      const response = await axios.get(createApiUrl(`api/user-details-by-identifier/?identifier=${identifier}`));
      if (response.data) {
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          email: data.email || prev.email,
          username: data.username || prev.username,
          roles: data.roles || prev.roles,
          first_name: data.first_name || prev.first_name,
          last_name: data.last_name || prev.last_name,
          gender: data.gender || prev.gender,
          mobile: data.mobile || prev.mobile,
          alternative_mobile: data.alternative_mobile || prev.alternative_mobile,
          alternative_email: data.alternative_email || prev.alternative_email,
          address: data.address || prev.address,
          lat_lng_address: data.lat_lng_address || prev.lat_lng_address,
          latitude: data.latitude || prev.latitude,
          longitude: data.longitude || prev.longitude,
          zip_code: data.zip_code || prev.zip_code,
          country: data.country?.toString() || prev.country,
          state: data.state?.toString() || prev.state,
          city: data.city?.toString() || prev.city,
          password: data.password || prev.password,
          password_confirm: data.password || prev.password_confirm,
        }));

        // Dynamically fetch and prepend country if not present in options
        if (data.country) {
          const countryId = data.country.toString();
          try {
            const cRes = await axios.get(createApiUrl(`api/country/${countryId}/`));
            if (cRes.data) {
              const opt = { value: cRes.data.id.toString(), label: cRes.data.name };
              setCountries(prev => {
                if (prev.some(c => c.value === countryId)) return prev;
                return [opt, ...prev];
              });
            }
          } catch (err) {
            console.error("Failed to fetch selected country details", err);
          }
          await fetchStates(countryId);
        }

        // Dynamically fetch and prepend state if not present in options
        if (data.state) {
          const stateId = data.state.toString();
          try {
            const sRes = await axios.get(createApiUrl(`api/state/${stateId}/`));
            if (sRes.data) {
              const opt = { value: sRes.data.id.toString(), label: sRes.data.name };
              setStates(prev => {
                if (prev.some(s => s.value === stateId)) return prev;
                return [opt, ...prev];
              });
            }
          } catch (err) {
            console.error("Failed to fetch selected state details", err);
          }
          await fetchCities(stateId);
        }

        // Dynamically fetch and prepend city if not present in options
        if (data.city) {
          const cityId = data.city.toString();
          try {
            const cRes = await axios.get(createApiUrl(`api/city/${cityId}/`));
            if (cRes.data) {
              const opt = { value: cRes.data.id.toString(), label: cRes.data.name };
              setCities(prev => {
                if (prev.some(c => c.value === cityId)) return prev;
                return [opt, ...prev];
              });
            }
          } catch (err) {
            console.error("Failed to fetch selected city details", err);
          }
        }

        toast.info("Existing details fetched");
      }
    } catch (err) {
      console.log("No details found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) { toast.error("Passwords do not match"); return; }
    if (!isCaptchaVerified) { toast.error("Please verify Captcha"); return; }
    if (!formData.first_name || !formData.last_name || !formData.username || !formData.email || !formData.password || formData.roles.length === 0) {
      toast.error("Please fill in all required fields and select at least one role"); return;
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
        toast.success("Registration successful");
      } else {
        // Extract specific error messages if available in result.details
        if (result.details && typeof result.details === 'object') {
          Object.values(result.details).forEach((messages: any) => {
            if (Array.isArray(messages)) {
              messages.forEach(msg => toast.error(msg));
            } else {
              toast.error(messages);
            }
          });
        } else {
          toast.error(result.error || "Registration failed");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full px-4 py-8 mx-auto lg:px-12">
        <div className="mb-8 relative">
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
                <Label className="col-span-1">Email</Label>
                <div className="col-span-2">
                  <Input name="email" type="email" placeholder="abc@abc.com" value={formData.email} onChange={handleInputChange} onBlur={(e) => fetchDetailsByIdentifier(e.target.value)} leadingIcon={<EnvelopeIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Alternative Email</Label>
                <div className="col-span-2">
                  <Input name="alternative_email" type="email" placeholder="alt@abc.com" value={formData.alternative_email} onChange={handleInputChange} leadingIcon={<EnvelopeIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Username</Label>
                <div className="col-span-2">
                  <Input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} onBlur={(e) => fetchDetailsByIdentifier(e.target.value)} leadingIcon={<UserIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Firstname</Label>
                <div className="col-span-2">
                  <Input name="first_name" placeholder="Firstname" value={formData.first_name} onChange={handleInputChange} leadingIcon={<UserIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Lastname</Label>
                <div className="col-span-2">
                  <Input name="last_name" placeholder="Lastname" value={formData.last_name} onChange={handleInputChange} leadingIcon={<UserIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Gender</Label>
                <div className="col-span-2">
                  <Select options={GENDER_OPTIONS} value={formData.gender} onChange={(val) => handleSelectChange('gender', val)} placeholder="Please Select" leadingIcon={<UserIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Password</Label>
                <div className="col-span-2 relative">
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleInputChange} leadingIcon={<span onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">{showPassword ? <EyeIcon className="size-5 fill-gray-500" /> : <EyeCloseIcon className="size-5 fill-gray-500" />}</span>} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Repassword</Label>
                <div className="col-span-2 relative">
                  <Input name="password_confirm" type={showConfirmPassword ? "text" : "password"} placeholder="Retype password" value={formData.password_confirm} onChange={handleInputChange} leadingIcon={<span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="cursor-pointer">{showConfirmPassword ? <EyeIcon className="size-5 fill-gray-500" /> : <EyeCloseIcon className="size-5 fill-gray-500" />}</span>} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Mobile</Label>
                <div className="col-span-2">
                  <Input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleInputChange} leadingIcon={<UserIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Alternative Mobile</Label>
                <div className="col-span-2">
                  <Input name="alternative_mobile" placeholder="Alt Mobile Number" value={formData.alternative_mobile} onChange={handleInputChange} leadingIcon={<UserIcon className="size-5 fill-gray-500" />} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-start pt-2">
                <Label className="col-span-1 mt-3">Address</Label>
                <div className="col-span-2 space-y-4">
                  <textarea name="address" placeholder="Enter Address" value={formData.address} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:text-white/90 focus:border-brand-300 focus:ring-brand-500/20" rows={3} />
                  <div>
                    <Label className="text-xs mb-1 block">Location Coordination</Label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleUseMyLocation} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"><FiMapPin size={12} /> Use My Location</button>
                      <button type="button" onClick={() => setMapPickerOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium"><FiGlobe size={12} /> Select from Map</button>
                    </div>
                  </div>
                  <Input name="lat_lng_address" placeholder="Location details..." value={formData.lat_lng_address} onChange={handleInputChange} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Country</Label>
                <div className="col-span-2">
                  <SearchableSelect
                    options={countries}
                    value={formData.country}
                    onChange={(val) => handleSelectChange('country', val)}
                    placeholder="Search Country"
                    leadingIcon={<FiGlobe className="size-5 text-gray-500" />}
                    onSearch={handleCountrySearch}
                    onLoadMore={handleCountryScrollEnd}
                    isLoadingMore={countryLoading}
                    hasMore={countryHasMore}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">State</Label>
                <div className="col-span-2">
                  <SearchableSelect
                    options={states}
                    value={formData.state}
                    onChange={(val) => handleSelectChange('state', val)}
                    placeholder="Search State"
                    leadingIcon={<PlusIcon className="size-5 fill-gray-500" />}
                    disabled={!formData.country}
                    onSearch={handleStateSearch}
                    onLoadMore={handleStateScrollEnd}
                    isLoadingMore={stateLoading}
                    hasMore={stateHasMore}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">City</Label>
                <div className="col-span-2">
                  <SearchableSelect
                    options={cities}
                    value={formData.city}
                    onChange={(val) => handleSelectChange('city', val)}
                    placeholder="Search City"
                    leadingIcon={<PlusIcon className="size-5 fill-gray-500" />}
                    disabled={!formData.state}
                    onSearch={handleCitySearch}
                    onLoadMore={handleCityScrollEnd}
                    isLoadingMore={cityLoading}
                    hasMore={cityHasMore}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Zip Code</Label>
                <div className="col-span-2">
                  <Input name="zip_code" placeholder="Enter Zip" value={formData.zip_code} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-3 items-start">
                <Label className="col-span-1 mt-1">Roles</Label>
                <div className="col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                    {ROLE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-gray-600 checked:bg-brand-500 checked:border-brand-500 transition-all"
                            checked={formData.roles.includes(option.value)}
                            onChange={() => handleRoleChange(option.value)}
                          />
                          <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-500 transition-colors">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Photo</Label>
                <div className="col-span-2">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">Captcha</Label>
                <div className="col-span-2">
                  <div onClick={() => setIsCaptchaVerified(!isCaptchaVerified)} className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 hover:bg-gray-100 transition-colors">
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
            <button type="submit" disabled={isLoading || !passwordsMatch} className="flex items-center justify-center px-16 py-3 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50">
              <PencilIcon className="size-4 mr-2" />
              {isLoading ? 'Processing...' : 'Create Account'}
            </button>
          </div>
        </form>

        <MapLocationPicker isOpen={mapPickerOpen} onClose={() => setMapPickerOpen(false)} onSelect={async (lat, lng) => { await handleLocationFromCoords(lat, lng); setMapPickerOpen(false); }} initialLat={formData.latitude || undefined} initialLng={formData.longitude || undefined} />

        <div className="mt-8 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Already have an account? {" "}
            <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
