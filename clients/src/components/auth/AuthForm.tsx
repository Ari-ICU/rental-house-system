"use client";

import { useState } from "react";
import InputField from "./InputField";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
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
                className="bg-white/10 dark:bg-slate-950/40 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-white/10 dark:border-slate-900/50 flex flex-col gap-8 relative overflow-hidden"
            >
                {/* Decorative Background Mesh */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none" />

                {/* Logo Section */}
                <div className="flex flex-col items-center gap-4 mb-2">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl p-3 border border-white/20">
                        <img src="/logo.png" alt="RentFlow Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-405 mt-1.5 uppercase tracking-[0.25em] px-2">
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
                        icon={<FaEnvelope className="text-sm" />}
                        required
                    />

                    <InputField
                        label="Account Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={<FaLock className="text-sm" />}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="group relative w-full mt-2 bg-indigo-600 text-white py-4.5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:bg-indigo-700 transition-all duration-300 active:scale-[0.98] overflow-hidden cursor-pointer"
                >
                    <span className="relative flex items-center justify-center gap-3">
                        Authenticate
                        <FaArrowRight className="group-hover:translate-x-1.5 transition-transform text-xs" />
                    </span>
                </button>

                <div className="text-center pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Authorized Personnel Only<br />
                        <span className="text-slate-500 opacity-60 mt-2 block font-medium tracking-normal text-[9px]">
                            Access to this system is restricted and monitored.
                        </span>
                    </p>
                </div>
            </form>
        </motion.div>
    );
};

export default AuthForm;
