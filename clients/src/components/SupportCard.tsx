"use client";

import React from "react";
import { FaLifeRing, FaChevronRight } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { motion } from "framer-motion";

interface SupportCardProps {
    className?: string;
}

const SupportCard: React.FC<SupportCardProps> = ({ className }) => {
    const { lang } = useLang();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative group p-8 rounded-[3rem] bg-gradient-to-br from-[#0d1117] to-[#080a0f] border border-slate-800/50 overflow-hidden shadow-2xl ${className}`}
        >
            {/* Animated Inner Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <FaLifeRing className="text-indigo-400 text-3xl animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-10 h-10 rounded-full border-2 border-[#0d1117] bg-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-xl shadow-black/40 overflow-hidden`}
                            >
                                {i === 3 ? (
                                    <span className="text-indigo-400">+</span>
                                ) : (
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                                        alt="Support agent"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {lang === "en" ? "Support Hub" : "មជ្ឈមណ្ឌលគាំទ្រ"}
                    </h2>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-[280px]">
                        {lang === "en"
                            ? "Get help with your rental management instantly from our dedicated team."
                            : "ទទួលបានជំនួយភ្លាមៗសម្រាប់ការគ្រប់គ្រងការជួលរបស់អ្នកពីក្រុមការងាររបស់យើង។"}
                    </p>
                </div>

                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-[2rem] text-sm font-black transition-all shadow-[0_12px_24px_-6px_rgba(79,70,229,0.5)] active:scale-[0.97] flex items-center justify-center gap-3 group/btn">
                    {lang === "en" ? "Contact Us" : "ទាក់ទងមកយើង"}
                    <FaChevronRight className="group-hover/btn:translate-x-1 transition-transform" size={12} />
                </button>
            </div>
        </motion.div>
    );
};

export default SupportCard;
