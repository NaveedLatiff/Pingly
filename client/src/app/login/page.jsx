"use client"
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const { login, register } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("buttonCLicked")
        try {
            if (isLogin) {
                await login({ 
                    email: formData.email, 
                    password: formData.password 
                })
            } else {
                await register(formData)
            }
        } catch (err) {
            alert(err.response?.data?.message || "Authentication failed")
        }
    }

    return (
        <div className="h-screen w-full flex items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md p-8 bg-zinc-900 border border-amber-600/20 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-amber-500">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">
                        {isLogin ? 'Enter your details to stay connected' : 'Join QuickChat today'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-lg mt-1 focus:border-amber-500 outline-none text-white transition-all"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-lg mt-1 focus:border-amber-500 outline-none text-white transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-lg mt-1 focus:border-amber-500 outline-none text-white transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] mt-2 shadow-lg shadow-amber-900/20">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-zinc-500 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
                        >
                            {isLogin ? 'Create one now' : 'Login here'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthPage