"use client";

import React from "react";
import SupportCard from "@/components/SupportCard";
import ContactForm from "@/components/ContactForm";
import { useLang } from "@/context/LangContext";
import { motion } from "framer-motion";
import { FaQuestionCircle, FaBook, FaHeadset, FaCommentDots, FaEnvelopeOpenText } from "react-icons/fa";

export default function SupportPage() {
    const { lang } = useLang();

    const t = {
        en: {
            title: "Support Hub",
            subtitle: "We're here to help you manage your rentals efficiently",
            faq: "Frequently Asked Questions",
            documentation: "Documentation",
            community: "Community Forum",
            liveChat: "Live Chat",
            contactFormTitle: "Send us a message",
            contactFormSubtitle: "Have a specific question? Reach out to us directly."
        },
        kh: {
            title: "មជ្ឈមណ្ឌលគាំទ្រ",
            subtitle: "យើងនៅទីនេះដើម្បីជួយអ្នកគ្រប់គ្រងការជួលរបស់អ្នកឱ្យមានប្រសិទ្ធភាព",
            faq: "សំណួរដែលសួរញឹកញាប់",
            documentation: "ឯកសារណែនាំ",
            community: "វេទិកាសហគមន៍",
            liveChat: "ការជជែកផ្ទាល់",
            contactFormTitle: "ផ្ញើសារមកយើង",
            contactFormSubtitle: "តើមានសំណួរជាក់លាក់មែនទេ? ទាក់ទងមកយើងដោយផ្ទាល់។"
        }
    };

    const text = lang === "km" ? t.kh : t.en;

    const quickActions = [
        { title: text.faq, icon: <FaQuestionCircle />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { title: text.documentation, icon: <FaBook />, color: "text-purple-400", bg: "bg-purple-400/10" },
        { title: text.community, icon: <FaCommentDots />, color: "text-green-400", bg: "bg-green-400/10" },
        { title: text.liveChat, icon: <FaHeadset />, color: "text-orange-400", bg: "bg-orange-400/10" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <header className="space-y-4">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black text-gray-900 dark:text-white tracking-tight"
                >
                    {text.title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 dark:text-gray-400 text-lg font-medium"
                >
                    {text.subtitle}
                </motion.p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Support Card */}
                <div className="lg:col-span-1 space-y-8">
                    <SupportCard />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <FaHeadset size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-2xl font-black tracking-tight">Need urgent help?</h3>
                            <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                                Our technical support team is available 24/7 for urgent issues related to your property management system.
                            </p>
                            <div className="flex flex-col gap-3 pt-2">
                                <span className="flex items-center gap-3 text-sm font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">📞</div>
                                    +855 12 345 678
                                </span>
                                <span className="flex items-center gap-3 text-sm font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">✉️</div>
                                    support@rentflow.com
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Support Info & Contact Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group text-left"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center text-xl transition-transform group-hover:scale-110`}>
                                    {action.icon}
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200 tracking-tight">{action.title}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Contact Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-2xl">
                                <FaEnvelopeOpenText />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {text.contactFormTitle}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    {text.contactFormSubtitle}
                                </p>
                            </div>
                        </div>

                        <ContactForm />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
