"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Axios from '../../../axios';
import { Camera, User, Mail, Info, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        profilePic: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                bio: user.bio || "",
                profilePic: user.profilePic || ""
            });
        }
    }, [user]);

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            const res = await Axios.put("/auth/updateProfile", formData);
            if (res.data.success) {
                setUser(res.data.user);
                toast.success("Profile updated successfully");
                router.push('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Image must be less than 2MB");
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setFormData({ ...formData, profilePic: reader.result });
        };
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-10 pb-10 font-[family-name:var(--font-outfit)]">
            <div className="max-w-2xl mx-auto p-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <form onSubmit={handleUpload} className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-2xl space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <p className="text-zinc-500 mt-2">Manage your account settings</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            {formData.profilePic ? (
                                <img
                                    src={formData.profilePic}
                                    alt="Profile"
                                    className="size-32 rounded-full object-cover border-4 border-zinc-800 group-hover:border-amber-600/50 transition-all"
                                />
                            ) : (
                                <div className="size-32 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center group-hover:border-amber-600/50 transition-all">
                                    <User className="size-16 text-zinc-500" />
                                </div>
                            )}
                            
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-amber-500 p-2.5 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl">
                                <Camera className="w-5 h-5 text-zinc-900" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-zinc-500">Click the camera to change photo</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" /> Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 bg-zinc-800/50 rounded-xl border border-zinc-700 text-white outline-none focus:border-amber-500 transition-all"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 opacity-70">
                            <label className="text-sm text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Address
                            </label>
                            <div className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-zinc-700 text-zinc-500 cursor-not-allowed select-none">
                                {user?.email || "loading..."}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-400 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Bio
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Tell us something about yourself..."
                                className="w-full px-4 py-3 bg-zinc-800/50 rounded-xl border border-zinc-700 text-white outline-none focus:border-amber-500 transition-all resize-none"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating...
                                </>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;