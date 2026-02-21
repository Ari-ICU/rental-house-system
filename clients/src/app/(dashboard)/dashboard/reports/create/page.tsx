"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { FaArrowLeft, FaFileAlt, FaTags, FaCheckCircle, FaSave, FaCalendarAlt } from "react-icons/fa";
import CustomDropdown from "@/common/CustomDropdown";
import KhmerCalendar from "@/utils/KhmerCalendar";
import * as reportService from "@/services/reportService";
import { Report } from "@/types/report";

const CreateReportPage: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();

    const [name, setName] = useState("");
    const [type, setType] = useState("Financial");
    const [status, setStatus] = useState("Completed");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await reportService.createReport({
                name,
                type,
                status: status as Report["status"],
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            router.push("/dashboard/reports");
        } catch (error) {
            console.error("Failed to create report:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 sm:p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/dashboard/reports")}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold mb-8 group"
                >
                    <FaArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {lang === 'km' ? 'ត្រឡប់ទៅរបាយការណ៍វិញ' : 'Back to reports'}
                </button>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-blue-900/5 dark:shadow-none border border-white dark:border-slate-800 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <div className="flex flex-col gap-2 mb-10">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {lang === 'km' ? 'បង្កើតរបាយការណ៍ថ្មី' : 'Create New Report'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {lang === 'km' ? 'កំណត់រចនាសម្ព័ន្ធ និងបង្កើតរបាយការណ៍អាជីវកម្មថ្មី' : 'Configure and generate a new business insights report'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            {/* Report Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <FaFileAlt size={12} className="text-blue-500" />
                                    {lang === 'km' ? 'ឈ្មោះរបាយការណ៍' : 'Report Name'}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={lang === 'km' ? 'ឧ. ការអនុវត្តការជួលក្នុងខែតុលា' : 'e.g. October Rental Performance'}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            {/* Report Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <FaTags size={12} className="text-indigo-500" />
                                    {lang === 'km' ? 'ចំណាត់ថ្នាក់ / ប្រភេទ' : 'Category / Type'}
                                </label>
                                <CustomDropdown
                                    options={[
                                        { value: "Financial", label: lang === 'km' ? 'ហិរញ្ញវត្ថុ' : 'Financial' },
                                        { value: "Occupancy", label: lang === 'km' ? 'ការកាន់កាប់' : 'Occupancy' },
                                        { value: "Maintenance", label: lang === 'km' ? 'ការថែទាំ' : 'Maintenance' },
                                        { value: "Revenue", label: lang === 'km' ? 'ចំណូល' : 'Revenue' }
                                    ]}
                                    value={type}
                                    onChange={(val) => setType(val)}
                                    className="!rounded-2xl !bg-gray-50 dark:!bg-slate-800/50 !border-gray-100 dark:!border-slate-700 !py-2 hover:!border-blue-400 transition-colors"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FaCalendarAlt size={12} className="text-blue-500" />
                                        {lang === 'km' ? 'ថ្ងៃចាប់ផ្តើម' : 'Start Date'}
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowStartCalendar(true)}
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl flex justify-between items-center hover:border-blue-400 hover:bg-white dark:hover:bg-slate-900 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 text-left"
                                        >
                                            <span>
                                                {startDate || (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select Date')}
                                            </span>
                                            <FaCalendarAlt className="text-gray-300" />
                                        </button>
                                        {showStartCalendar && (
                                            <KhmerCalendar
                                                selectedDate={startDate}
                                                onChange={(date) => {
                                                    setStartDate(date);
                                                    setShowStartCalendar(false);
                                                }}
                                                lang={lang}
                                                onClose={() => setShowStartCalendar(false)}
                                                isPopup={true}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FaCalendarAlt size={12} className="text-indigo-500" />
                                        {lang === 'km' ? 'ថ្ងៃបញ្ចប់' : 'End Date'}
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowEndCalendar(true)}
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl flex justify-between items-center hover:border-blue-400 hover:bg-white dark:hover:bg-slate-900 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 text-left"
                                        >
                                            <span>
                                                {endDate || (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select Date')}
                                            </span>
                                            <FaCalendarAlt className="text-gray-300" />
                                        </button>
                                        {showEndCalendar && (
                                            <KhmerCalendar
                                                selectedDate={endDate}
                                                onChange={(date) => {
                                                    setEndDate(date);
                                                    setShowEndCalendar(false);
                                                }}
                                                lang={lang}
                                                onClose={() => setShowEndCalendar(false)}
                                                isPopup={true}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <FaCheckCircle size={12} className="text-emerald-500" />
                                    {lang === 'km' ? 'ស្ថានភាពដំបូង' : 'Initial Status'}
                                </label>
                                <CustomDropdown
                                    options={[
                                        { value: "Completed", label: lang === 'km' ? 'បានបញ្ចប់' : 'Completed' },
                                        { value: "In-Review", label: lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review' }
                                    ]}
                                    value={status}
                                    onChange={(val) => setStatus(val)}
                                    className="!rounded-2xl !bg-gray-50 dark:!bg-slate-800/50 !border-gray-100 dark:!border-slate-700 !py-2 hover:!border-blue-400 transition-colors"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => router.push("/dashboard/reports")}
                                    className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-6 py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-bold active:scale-95"
                                >
                                    {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/25 font-bold active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {submitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <FaSave size={16} />
                                            {lang === 'km' ? 'បង្កើតរបាយការណ៍' : 'Generate Report'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReportPage;
