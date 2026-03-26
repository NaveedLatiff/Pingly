"use client"
import { createContext, useContext, useEffect, useState } from "react";
import Axios from "../../axios";
import { useRouter, usePathname } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const AuthContext = createContext();
const SOCKET_URL = "http://localhost:3003"; 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    const router = useRouter();
    const pathname = usePathname();

    const connectSocket = (userId) => {
        if (socket?.connected) return;
        const newSocket = io(SOCKET_URL, { 
            query: { userId },
            reconnection: true 
        });
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
        return newSocket;
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    const checkAuth = async () => {
        try {
            const res = await Axios.get("/auth/check");
            if (res.data.success) {
                setUser(res.data.user);
                connectSocket(res.data.user._id);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (formData) => {
        try {
            const res = await Axios.post("/auth/login", formData);
            if (res.data.success) {
                setUser(res.data.user);
                connectSocket(res.data.user._id);
                toast.success(`Welcome back, ${res.data.user.fullName}`);
                router.push("/");
            }
            return res.data;
        } catch (error) {
            const msg = error.response?.data?.message || "Login failed";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const signup = async (formData) => {
        try {
            const res = await Axios.post("/auth/register", formData);
            if (res.data.success) {
                setUser(res.data.user);
                connectSocket(res.data.user._id);
                toast.success("Account created successfully!");
                router.push("/");
            }
            return res.data;
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await Axios.post("/auth/logout");
            disconnectSocket();
            setUser(null);
            toast.info("Logged out successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Logout failed");
            console.error("Logout failed", error);
        }
    };

    useEffect(() => {
        if (!loading) {
            const publicPages = ["/login", "/signup"];
            const isPublicPage = publicPages.includes(pathname);
            if (!user && !isPublicPage) {
                router.push("/login");
            } else if (user && isPublicPage) {
                router.push("/");
            }
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ 
            user, loading, login, signup, logout, socket, onlineUsers, setUser, connectSocket 
        }}>
            {!loading ? children : (
                <div className="h-screen w-screen bg-[#0b141a] flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 mb-8">
                        <div className="absolute inset-0 border-4 border-[#202c33] rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#00a884] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-[#e9edef] text-xl font-light tracking-wider">QuickChat</h1>
                        <div className="flex items-center gap-2 text-[#8696a0] text-sm font-light">
                            <span className="animate-pulse">End-to-end encrypted</span>
                        </div>
                    </div>

                    <div className="absolute bottom-10 w-48 h-1 bg-[#202c33] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00a884] w-1/2 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                    </div>

                    <style jsx>{`
                        @keyframes loading {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(200%); }
                        }
                    `}</style>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);