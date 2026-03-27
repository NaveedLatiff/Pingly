"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Axios from '../../../axios';
import { Camera, User, Mail, Info, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import img from '../../assets/main.png'


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
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return toast.error("Image must be less than 2MB");

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setFormData({ ...formData, profilePic: reader.result });
    };

    return (
        <div className="h-screen w-full bg-gradient-to-b from-black via-zinc-900 to-black grid lg:grid-cols-2 overflow-hidden font-outfit relative">

            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-30 flex items-center gap-2 cursor-pointer text-zinc-500 hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Chat</span>
            </button>

            <div className="hidden lg:flex items-center justify-center  relative">
                <Image
                    src={img}
                    alt="Branding Image"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="flex flex-col items-center gap-3 mb-2">
                            <div className="relative">
                                <div className="size-28 rounded-full border-4 border-zinc-800 overflow-hidden shadow-inner bg-zinc-900">
                                    {formData.profilePic ? (
                                        <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="size-12 text-zinc-700" />
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-amber-500 p-2 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg">
                                    <Camera className="w-4 h-4 text-black" />
                                    <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Personal Avatar</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1 mb-1 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-900/80 border-none text-[#e9edef] py-3 px-4 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-[#8696a0]"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1 mb-1 block">Email (ReadOnly)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                                    <div className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800/50 rounded-xl text-zinc-500 text-sm italic">
                                        {user?.email || "user@example.com"}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1 mb-1 block">Bio</label>
                                <div className="relative">
                                    <Info className="absolute left-3 top-4 size-4 text-zinc-500" />
                                    <textarea
                                        rows="2"
                                        className="w-full bg-zinc-900/80 border-none text-[#e9edef] py-3 px-4 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-[#8696a0]"
                                        placeholder="Briefly describe yourself..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isUpdating}
                            className="w-full bg-gradient-to-r from-orange-400 via-orange-700 to-orange-900 text-white cursor-pointer  hover:bg-none hover:bg-white hover:text-black  font-bold  py-3 rounded-lg transition-all transform active:scale-[0.98] mt-4 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <Loader2 className="animate-spin size-5" /> : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;