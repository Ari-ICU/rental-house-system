"use client";

import React, { useState } from "react";
import { FaTimes, FaSave, FaTag, FaDollarSign, FaCalendarAlt, FaAlignLeft } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Expense, ExpenseCategory } from "@/types/expense";
import CustomDropdown from "@/common/CustomDropdown";

interface ExpenseFormProps {
    expense?: Expense;
    onClose: () => void;
    onSubmit: (data: Partial<Expense>) => Promise<void>;
}

const categories: { value: ExpenseCategory; label: string; labelKh: string }[] = [
    { value: "Maintenance", label: "Maintenance", labelKh: "ការថែទាំ" },
    { value: "Tax", label: "Tax", labelKh: "ពន្ធ" },
    { value: "Salary", label: "Salary", labelKh: "ប្រាក់បៀវត្សរ៍" },
    { value: "Utility", label: "Utility", labelKh: "ប្រើប្រាស់ទឹកភ្លើង" },
    { value: "Other", label: "Other", labelKh: "ផ្សេងៗ" },
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onClose, onSubmit }) => {
    const { lang } = useLang();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Expense>>(
        expense || {
            title: "",
            category: "Other",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            description: "",
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                        <FaTimes size={14} />
                    </button>
                    <h2 className="text-3xl font-black tracking-tight">
                        {expense ? (lang === 'km' ? "កែសម្រួលចំណាយ" : "Edit Expense") : (lang === 'km' ? "បន្ថែមចំណាយថ្មី" : "Add New Expense")}
                    </h2>
                    <p className="text-indigo-100 mt-2 font-medium">
                        {lang === 'km' ? "បំពេញព័ត៌មានលម្អិតអំពីការចំណាយខាងក្រោម។" : "Fill in the details about your expense below."}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest pl-1">
                                <FaTag size={12} className="text-indigo-500" />
                                {lang === 'km' ? "ចំណងជើង" : "Title"}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-2xl transition-all outline-none font-bold"
                                placeholder={lang === 'km' ? "ឧ. ជួសជុលម៉ាស៊ីនត្រជាក់" : "e.g. AC Repair"}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest pl-1">
                                    <FaTag size={12} className="text-indigo-500" />
                                    {lang === 'km' ? "ប្រភេទ" : "Category"}
                                </label>
                                <CustomDropdown
                                    options={categories.map((c) => ({
                                        value: c.value,
                                        label: lang === 'km' ? c.labelKh : c.label,
                                    }))}
                                    value={formData.category || "Other"}
                                    onChange={(val) => setFormData({ ...formData, category: val as ExpenseCategory })}
                                    className="w-full !rounded-2xl"
                                />
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest pl-1">
                                    <FaDollarSign size={12} className="text-indigo-500" />
                                    {lang === 'km' ? "ចំនួនទឹកប្រាក់" : "Amount"}
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-2xl transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest pl-1">
                                <FaCalendarAlt size={12} className="text-indigo-500" />
                                {lang === 'km' ? "កាលបរិច្ឆេទ" : "Date"}
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-2xl transition-all outline-none font-bold uppercase text-xs"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest pl-1">
                                <FaAlignLeft size={12} className="text-indigo-500" />
                                {lang === 'km' ? "ការពិពណ៌នា" : "Description"}
                            </label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-2xl transition-all outline-none font-medium text-sm resize-none"
                                placeholder={lang === 'km' ? "បន្ថែមព័ត៌មានលម្អិត..." : "Add more details..."}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all active:scale-95"
                        >
                            {lang === 'km' ? "បោះបង់" : "Cancel"}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaSave size={16} />
                                    {lang === 'km' ? "រក្សាទុក" : "Save Expense"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
