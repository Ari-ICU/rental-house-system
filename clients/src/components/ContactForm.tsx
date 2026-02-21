"use client";

import React, { useState } from "react";
import { useLang } from "@/context/LangContext";
import { FaPaperPlane, FaUser, FaEnvelope, FaTag, FaCommentAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import CustomDropdown from "@/common/CustomDropdown";

const ContactForm = () => {
    const { lang } = useLang();
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
    });

    const isKhmer = lang === "km";

    const subjects = [
        { value: "General Inquiry", label: isKhmer ? "ការសាកសួរទូទៅ" : "General Inquiry" },
        { value: "Technical Support", label: isKhmer ? "ការគាំទ្របច្ចេកទេស" : "Technical Support" },
        { value: "Billing Issue", label: isKhmer ? "បញ្ហាវិក្កយបត្រ" : "Billing Issue" },
        { value: "Feedback", label: isKhmer ? "មតិយោបល់" : "Feedback" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success(
            isKhmer
                ? "សាររបស់អ្នកត្រូវបានបញ្ជូនដោយជោគជ័យ! យើងនឹងទាក់ទងមកវិញឆាប់ៗនេះ។"
                : "Your message has been sent successfully! We'll get back to you soon."
        );

        setFormData({
            name: "",
            email: "",
            subject: "General Inquiry",
            message: "",
        });
        setSending(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <FaUser className="text-indigo-400" />
                        {isKhmer ? "ឈ្មោះ" : "Name"}
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder={isKhmer ? "ឈ្មោះរបស់អ្នក" : "Your Name"}
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <FaEnvelope className="text-indigo-400" />
                        {isKhmer ? "អ៊ីមែល" : "Email"}
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="example@mail.com"
                    />
                </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <FaTag className="text-indigo-400" />
                    {isKhmer ? "ប្រធានបទ" : "Subject"}
                </label>
                <CustomDropdown
                    options={subjects}
                    value={formData.subject}
                    onChange={(val) => setFormData({ ...formData, subject: val })}
                    placeholder={isKhmer ? "ជ្រើសរើសប្រធានបទ" : "Select Subject"}
                />
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <FaCommentAlt className="text-indigo-400" />
                    {isKhmer ? "សារ" : "Message"}
                </label>
                <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    placeholder={isKhmer ? "តើយើងអាចជួយអ្នកបានយ៉ាងដូចម្តេច?" : "How can we help you?"}
                />
            </div>

            <button
                type="submit"
                disabled={sending}
                className={`
                    w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-3
                    ${sending
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25 active:scale-[0.98]"
                    }
                `}
            >
                {sending ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        <FaPaperPlane className="text-lg" />
                        <span>{isKhmer ? "ផ្ញើសារ" : "Send Message"}</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default ContactForm;
