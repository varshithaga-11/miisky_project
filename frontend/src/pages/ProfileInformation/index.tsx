import React, { useEffect, useState } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { getProfile, updateProfile, getCountries, getStates, getCities } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUser, FiPhone, FiMapPin, FiCamera, FiSave, FiLoader, FiGlobe, FiMap } from "react-icons/fi";
import { motion } from "framer-motion";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { createApiUrl } from "../../access/access";
import Label from "../../components/form/Label";
import { MapLocationPicker } from "../../components/common/MapLocationPicker";

const ProfileInformation: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [mapPickerOpen, setMapPickerOpen] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [loadingLocations, setLoadingLocations] = useState({
        countries: false,
        states: false,
        cities: false
    });

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    // On-demand fetch handlers
    const handleCountryClick = async () => {
        if (countries.length > 0) return;
        setLoadingLocations(prev => ({ ...prev, countries: true }));
        try {
            const data = await getCountries();
            setCountries(data);
        } catch (e) {
            toast.error("Error loading countries");
        } finally {
            setLoadingLocations(prev => ({ ...prev, countries: false }));
        }
    };

    const handleStateClick = async () => {
        if (!profile?.country) {
            toast.warning("Please select a country first");
            return;
        }
        if (states.length > 0 && states[0].country === profile.country) return;
        setLoadingLocations(prev => ({ ...prev, states: true }));
        try {
            const data = await getStates(profile.country);
            setStates(data);
        } catch (e) {
            toast.error("Error loading states");
        } finally {
            setLoadingLocations(prev => ({ ...prev, states: false }));
        }
    };

    const handleCityClick = async () => {
        if (!profile?.state) {
            toast.warning("Please select a state first");
            return;
        }
        if (cities.length > 0 && cities[0].state === profile.state) return;
        setLoadingLocations(prev => ({ ...prev, cities: true }));
        try {
            const data = await getCities(profile.state);
            setCities(data);
        } catch (e) {
            toast.error("Error loading cities");
        } finally {
            setLoadingLocations(prev => ({ ...prev, cities: false }));
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProfile((prev: any) => ({ ...prev, country: val, state: "", city: "" }));
        setStates([]);
        setCities([]);
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProfile((prev: any) => ({ ...prev, state: val, city: "" }));
        setCities([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleTextAreaChange = (name: string, value: string) => {
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFieldChange = (name: string, value: any) => {
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

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
        handleFieldChange("latitude", lat);
        handleFieldChange("longitude", lng);
        const address = await reverseGeocode(lat, lng);
        if (address) {
            handleFieldChange("lat_lng_address", address);
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
        const addr = (profile?.address as string) || "";
        const cityName = cities.find((c) => String(c.id) === String(profile?.city))?.name || "";
        const stateName = states.find((s) => String(s.id) === String(profile?.state))?.name || "";
        const countryName = countries.find((c) => String(c.id) === String(profile?.country))?.name || "";
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
                handleFieldChange("latitude", parseFloat(data[0].lat));
                handleFieldChange("longitude", parseFloat(data[0].lon));
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
        setSaving(true);
        try {
            const formData = new FormData();
            // Append all serializable fields
            Object.keys(profile).forEach(key => {
                const excludedFields = ['photo', 'city_details', 'state_details', 'country_details'];
                if (!excludedFields.includes(key) && profile[key] !== null && profile[key] !== undefined) {
                    const val = profile[key];
                    formData.append(key, typeof val === 'number' ? String(val) : val);
                }
            });

            if (photo) {
                formData.append('photo', photo);
            }

            await updateProfile(formData);
            toast.success("Profile updated successfully!");
            fetchProfileData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return "/avatar-placeholder.png";
        if (path.startsWith("http")) return path;
        return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                <FiLoader className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing profile vault...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="My Profile" description="Manage your personal information and credentials" />
            <PageBreadCrumb pageTitle="Profile Settings" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Your Identity</h1>
                        <p className="text-gray-500 mt-1 font-medium italic">Manage your contact details and residency information.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Profile Photo Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-gray-800 rounded-[50px] p-10 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/40 dark:shadow-none text-center relative overflow-hidden group"
                            >
                                <div className="relative z-10">
                                    <div className="w-40 h-40 mx-auto rounded-[40px] overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner mb-6 relative border-4 border-indigo-50 dark:border-white/5">
                                        <img
                                            src={photo ? URL.createObjectURL(photo) : getImageUrl(profile?.photo)}
                                            alt="Profile"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <FiCamera className="text-white" size={32} />
                                            <input type="file" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                                        </label>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
                                        {profile.first_name || "New"} {profile.last_name || "User"}
                                    </h3>
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                        {profile.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </motion.div>

                            <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-4 dark:border-white/5">System Meta</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Account ID</p>
                                        <p className="text-sm font-black text-gray-500">#{profile.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Joined Network</p>
                                        <p className="text-sm font-black text-gray-500">{profile.joined_date ? new Date(profile.joined_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Form */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Basic Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-[50px] p-10 md:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/40 dark:shadow-none"
                            >
                                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                                    <FiUser /> Personal Identification
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <InputField
                                            name="first_name"
                                            value={profile.first_name || ""}
                                            onChange={handleChange}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <InputField
                                            name="last_name"
                                            value={profile.last_name || ""}
                                            onChange={handleChange}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <select
                                            name="gender"
                                            value={profile.gender || ""}
                                            onChange={handleChange}
                                            className="w-full px-6 h-11 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:ring-3 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <InputField
                                            type="date"
                                            name="dob"
                                            value={profile.dob || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Email Address (Locked)</Label>
                                        <InputField
                                            name="email"
                                            value={profile.email || ""}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-[50px] p-10 md:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/40 dark:shadow-none"
                            >
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                                    <FiPhone /> Communication Channels
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label>Mobile Number</Label>
                                        <InputField
                                            name="mobile"
                                            value={profile.mobile || ""}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>WhatsApp Number</Label>
                                        <InputField
                                            name="whatsapp"
                                            value={profile.whatsapp || ""}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Residency Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-[50px] p-10 md:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/40 dark:shadow-none"
                            >
                                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                                    <FiMapPin /> Residency & Address
                                </h4>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <Label>Street Address</Label>
                                        <TextArea
                                            placeholder="Full residential address..."
                                            value={profile.address || ""}
                                            onChange={(val) => handleTextAreaChange('address', val)}
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <div className="relative">
                                                <select
                                                    name="country"
                                                    value={profile.country || ""}
                                                    onFocus={handleCountryClick}
                                                    onChange={handleCountryChange}
                                                    className="w-full px-6 h-11 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:ring-3 focus:ring-brand-500/20 focus:border-brand-300 outline-none appearance-none transition-all"
                                                >
                                                    <option value="">{loadingLocations.countries ? "Loading..." : "Select Country"}</option>
                                                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    {profile.country && !countries.find(c => String(c.id) === String(profile.country)) && (
                                                        <option value={profile.country}>{profile.country_details?.name || "Selected Country"}</option>
                                                    )}
                                                </select>
                                                <FiGlobe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <div className="relative">
                                                <select
                                                    name="state"
                                                    value={profile.state || ""}
                                                    onFocus={handleStateClick}
                                                    onChange={handleStateChange}
                                                    className="w-full px-6 h-11 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:ring-3 focus:ring-brand-500/20 focus:border-brand-300 outline-none appearance-none transition-all"
                                                >
                                                    <option value="">{loadingLocations.states ? "Loading..." : "Select State"}</option>
                                                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    {profile.state && !states.find(s => String(s.id) === String(profile.state)) && (
                                                        <option value={profile.state}>{profile.state_details?.name || "Selected State"}</option>
                                                    )}
                                                </select>
                                                <FiMap className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <div className="relative">
                                                <select
                                                    name="city"
                                                    value={profile.city || ""}
                                                    onFocus={handleCityClick}
                                                    onChange={handleChange}
                                                    className="w-full px-6 h-11 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:ring-3 focus:ring-brand-500/20 focus:border-brand-300 outline-none appearance-none transition-all"
                                                >
                                                    <option value="">{loadingLocations.cities ? "Loading..." : "Select City"}</option>
                                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    {profile.city && !cities.find(c => String(c.id) === String(profile.city)) && (
                                                        <option value={profile.city}>{profile.city_details?.name || "Selected City"}</option>
                                                    )}
                                                </select>
                                                <FiMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Zip Code</Label>
                                            <InputField
                                                name="zip_code"
                                                value={profile.zip_code || ""}
                                                onChange={handleChange}
                                                placeholder="XXXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Location (home / delivery)</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-1">
                                            Choose one: use your location, get from address, select from map, or enter manually.
                                        </p>
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
                                            {/* <button
                                                type="button"
                                                onClick={handleGetFromAddress}
                                                disabled={
                                                    saving ||
                                                    locationLoading ||
                                                    (!(profile?.address as string)?.trim() && !profile?.city && !profile?.state && !profile?.country)
                                                }
                                                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                Get from address
                                            </button> */}
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
                                                setMapPickerOpen(false);
                                            }}
                                            initialLat={profile?.latitude}
                                            initialLng={profile?.longitude}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                                                <InputField
                                                    name="latitude"
                                                    type="number"
                                                    step="any"
                                                    value={profile?.latitude ?? ""}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            "latitude",
                                                            e.target.value ? parseFloat(e.target.value) : null
                                                        )
                                                    }
                                                    placeholder="e.g. 12.9716"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                                                <InputField
                                                    name="longitude"
                                                    type="number"
                                                    step="any"
                                                    value={profile?.longitude ?? ""}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            "longitude",
                                                            e.target.value ? parseFloat(e.target.value) : null
                                                        )
                                                    }
                                                    placeholder="e.g. 77.5946"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Address from map / GPS</Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Reverse-geocoded label for your coordinates; street address stays above.
                                            </p>
                                            <TextArea
                                                placeholder="Filled when you use location or map pick…"
                                                value={profile.lat_lng_address || ""}
                                                onChange={(val) => handleTextAreaChange("lat_lng_address", val)}
                                                rows={3}
                                            />
                                        </div>
                                        {(profile?.latitude != null || profile?.longitude != null) && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                Saved: {(profile?.latitude as number)?.toFixed(5) ?? "—"}, {(profile?.longitude as number)?.toFixed(5) ?? "—"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Save Actions */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-end"
                            >
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-12 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[25px] flex items-center gap-3 shadow-xl shadow-indigo-500/30 transition-all disabled:opacity-50 text-[10px] font-black uppercase tracking-[0.2em]"
                                >
                                    {saving ? <FiLoader className="animate-spin" /> : <FiSave size={18} />}
                                    {saving ? "Synchronizing..." : "Update Vault Details"}
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileInformation;
