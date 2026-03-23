import React, { useEffect, useState } from "react";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { getProfile, updateProfile } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUser, FiPhone, FiMapPin, FiCamera, FiSave, FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { createApiUrl } from "../../access/access";

import Label from "../../components/form/Label";

const ProfileInformation: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleTextAreaChange = (name: string, value: string) => {
        setProfile((prev: any) => ({ ...prev, [name]: value }));
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
                  formData.append(key, profile[key]);
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
                                            <Label>Zip Code</Label>
                                            <InputField
                                                name="zip_code"
                                                value={profile.zip_code || ""}
                                                onChange={handleChange}
                                                placeholder="XXXXXX"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end opacity-50">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-2">Location Information</p>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase text-gray-400 border border-gray-200 dark:border-white/5">
                                                ID: {profile.city || "N/A"} (City) | ID: {profile.state || "N/A"} (State)
                                            </div>
                                        </div>
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
