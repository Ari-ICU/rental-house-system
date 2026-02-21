"use client";

import { useState } from "react";
import InputField from "./InputField";
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaHome } from "react-icons/fa";
import { motion } from "framer-motion";

interface AuthFormProps {
    onSubmit: (data: { email: string; password: string }) => void;
}

const AuthForm = ({ onSubmit }: AuthFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
        >
            <form
                onSubmit={handleSubmit}
                className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col gap-8 relative overflow-hidden"
            >
                {/* Decorative Background Mesh */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none" />

                {/* Logo Section */}
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <FaHome className="text-white text-3xl" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest px-2">
                            Secure Dashboard Access
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <InputField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        icon={<FaEnvelope />}
                        required
                    />

                    <InputField
                        label="Account Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={<FaLock />}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="group relative w-full mt-2 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all duration-300 active:scale-[0.98] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-3">
                        Authenticate
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>

                <div className="text-center pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Authorized Personnel Only<br />
                        <span className="text-slate-300 opacity-50 mt-2 block font-medium tracking-normal text-[10px]">
                            Access to this system is restricted and monitored.
                        </span>
                    </p>
                </div>
            </form>
        </motion.div>
    );
};

export default AuthForm;
