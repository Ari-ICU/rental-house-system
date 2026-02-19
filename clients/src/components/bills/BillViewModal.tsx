import React from "react";
import { FaTimes, FaUser, FaCalendarAlt, FaBolt, FaTint, FaHome, FaInfoCircle } from "react-icons/fa";
import { Bill } from "@/types/bill";
import { useLang } from "@/context/LangContext";

interface BillViewModalProps {
    bill: Bill | null;
    onClose: () => void;
}

const statusColors: Record<"Paid" | "Unpaid", string> = {
    Paid: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Unpaid: "bg-rose-50 text-rose-700 border border-rose-100",
};

export default function BillViewModal({ bill, onClose }: BillViewModalProps) {
    const { lang } = useLang();
    if (!bill) return null;

    const translateStatus = (status: "Paid" | "Unpaid") => {
        if (lang === "en") return status;
        return status === "Paid" ? "បានបង់" : "មិនទាន់បង់";
    };

    const totalAmount = (bill.rental?.rentAmount || 0) + (bill.electricityAmount || 0) + (bill.waterAmount || 0);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Header with Background */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-10 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-all active:scale-95"
                        title={lang === "en" ? "Close" : "បិទ"}
                    >
                        <FaTimes />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <FaInfoCircle className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight leading-tight">
                                {lang === "en" ? "Invoice Summary" : "សេចក្តីសង្ខេបវិក្កយបត្រ"}
                            </h2>
                            <p className="text-violet-100 text-sm font-medium opacity-90 mt-1">
                                {lang === 'en' ? 'Detailed overview of this billing cycle' : 'ទិដ្ឋភាពទូទៅនៃវដ្តវិក្កយបត្រនេះ'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-10 space-y-8">
                    {/* Primary Info Area */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mb-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'Client' : 'អតិថិជន'}</p>
                            <div className="flex items-center gap-2">
                                <FaUser className="text-violet-500 text-xs" />
                                <p className="text-sm font-bold text-gray-800 truncate">{bill.rental?.ClientName || "N/A"}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'Room' : 'លេខបន្ទប់'}</p>
                            <div className="flex items-center gap-2">
                                <FaHome className="text-violet-500 text-xs" />
                                <p className="text-sm font-bold text-gray-800">Room {bill.rental?.roomNumber || "N/A"}</p>
                            </div>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-gray-100 mt-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'Billing Period' : 'រយៈពេលវិក្កយបត្រ'}</p>
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-violet-500 text-xs" />
                                        <p className="text-sm font-bold text-gray-700">{bill.month}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'ID' : 'លេខសម្គាល់'}</p>
                                    <p className="text-xs font-mono font-bold text-gray-500">#{bill.id.toString().padStart(6, '0')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <FaHome size={16} />
                                </div>
                                <span className="text-gray-500 text-sm font-bold">{lang === 'en' ? 'Base Rent' : 'ថ្លៃបន្ទប់សរុប'}</span>
                            </div>
                            <span className="text-gray-800 font-black">${bill.rental?.rentAmount?.toLocaleString() || '0.00'}</span>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all relative">
                                    <FaBolt size={16} />
                                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${bill.electricityStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-sm font-bold">{lang === 'en' ? 'Electricity' : 'ថ្លៃអគ្គិសនី'}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border w-fit mt-1 ${statusColors[bill.electricityStatus]}`}>
                                        {translateStatus(bill.electricityStatus)}
                                    </span>
                                </div>
                            </div>
                            <span className="text-gray-800 font-black">${bill.electricityAmount?.toLocaleString() || '0.00'}</span>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all relative">
                                    <FaTint size={16} />
                                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${bill.waterStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-sm font-bold">{lang === 'en' ? 'Water Service' : 'ថ្លៃទឹកស្អាត'}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border w-fit mt-1 ${statusColors[bill.waterStatus]}`}>
                                        {translateStatus(bill.waterStatus)}
                                    </span>
                                </div>
                            </div>
                            <span className="text-gray-800 font-black">${bill.waterAmount?.toLocaleString() || '0.00'}</span>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="pt-8 border-t border-dashed border-gray-200">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'en' ? 'Grand Total Due' : 'ទឹកប្រាក់សរុប'}</h4>
                                <p className="text-gray-400 text-[10px] mt-1 italic opacity-60">* {lang === 'en' ? 'Taxes may not be included' : 'មិនគិតបញ្ចូលពន្ធ'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-3xl font-black text-gray-900">
                                <span className="text-violet-600 text-xl font-bold italic">$</span>
                                <span>{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95"
                    >
                        {lang === "en" ? "Dismiss" : "បិទថាស"}
                    </button>
                </div>
            </div>
        </div>
    );
}
