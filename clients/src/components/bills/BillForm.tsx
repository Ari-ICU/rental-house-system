import React, { useState, useEffect, useRef } from 'react';
import {
    FaCalendarAlt,
    FaArrowLeft,
    FaSearch,
    FaChevronDown,
    FaCheck,
    FaUser,
    FaBolt,
    FaTint,
    FaMoneyBillWave,
    FaRegStickyNote,
    FaRegClock,
    FaHome
} from 'react-icons/fa';
import { Bill } from '@/types/bill';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';
import { useRouter } from 'next/navigation';
import CustomDropdown from '@/common/CustomDropdown';
import { formatKhmerDate } from '@/utils/dateFormatter';

import { createBill, updateBill } from '@/services/billService';
import { toast } from 'react-hot-toast';

interface BillFormProps {
    rentals: Rental[];
    bill?: Bill;
}

const BillForm: React.FC<BillFormProps> = ({ rentals, bill }) => {
    const { lang } = useLang();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [rentalSearch, setRentalSearch] = useState('');

    const activeRentals = rentals.filter(r => r.status === 'Active' || r.status === 'Reserved');

    const [formData, setFormData] = useState<Omit<Bill, 'id' | 'rentAmount' | 'electricityAmount' | 'waterAmount'> & {
        rentAmount?: number | string;
        electricityAmount: number | string;
        waterAmount: number | string;
        prevElectricityReading: number | string;
        currElectricityReading: number | string;
        prevWaterReading: number | string;
        currWaterReading: number | string;
    }>({
        rental: bill?.rental || (activeRentals.length > 0 ? activeRentals[0] : {} as Rental),
        month: bill?.month || '',
        rentAmount: bill?.rentAmount ?? bill?.rental?.rentAmount ?? '',
        prevElectricityReading: bill?.prevElectricityReading ?? 0,
        currElectricityReading: bill?.currElectricityReading ?? 0,
        electricityAmount: bill?.electricityAmount ?? '',
        prevWaterReading: bill?.prevWaterReading ?? 0,
        currWaterReading: bill?.currWaterReading ?? 0,
        waterAmount: bill?.waterAmount ?? '',
        electricityStatus: bill?.electricityStatus || 'Unpaid',
        waterStatus: bill?.waterStatus || 'Unpaid',
        notes: bill?.notes || '',
    });

    const [rates, setRates] = useState({ electricity: 0, water: 0, exchangeRate: 4100 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMonthPopup, setShowMonthPopup] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setRates({
                            electricity: Number(data.data.electricityRate || 0),
                            water: Number(data.data.waterRate || 0),
                            exchangeRate: Number(data.data.exchangeRate || 4100)
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch rates:', error);
            }
        };
        fetchRates();
    }, []);

    // Auto-calculate electricity
    useEffect(() => {
        const prev = Number(formData.prevElectricityReading);
        const curr = Number(formData.currElectricityReading);
        if (curr >= prev && rates.electricity > 0) {
            const amount = (curr - prev) * rates.electricity;
            setFormData(p => ({ ...p, electricityAmount: amount.toFixed(2) }));
        }
    }, [formData.prevElectricityReading, formData.currElectricityReading, rates.electricity]);

    // Auto-calculate water
    useEffect(() => {
        const prev = Number(formData.prevWaterReading);
        const curr = Number(formData.currWaterReading);
        if (curr >= prev && rates.water > 0) {
            const amount = (curr - prev) * rates.water;
            setFormData(p => ({ ...p, waterAmount: amount.toFixed(2) }));
        }
    }, [formData.prevWaterReading, formData.currWaterReading, rates.water]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (bill) {
            setFormData(prev => ({
                ...prev,
                rental: bill.rental,
                month: bill.month,
                rentAmount: bill.rentAmount ?? bill.rental?.rentAmount ?? '',
                prevElectricityReading: bill.prevElectricityReading ?? 0,
                currElectricityReading: bill.currElectricityReading ?? 0,
                electricityAmount: bill.electricityAmount ?? '',
                prevWaterReading: bill.prevWaterReading ?? 0,
                currWaterReading: bill.currWaterReading ?? 0,
                waterAmount: bill.waterAmount ?? '',
                electricityStatus: bill.electricityStatus,
                waterStatus: bill.waterStatus,
                notes: bill.notes || '',
            }));
        } else if (!formData.rental?.id && rentals.length > 0) {
            const firstActive = rentals.find(r => r.status === 'Active' || r.status === 'Reserved');
            if (firstActive) {
                setFormData(prev => ({ ...prev, rental: firstActive, rentAmount: firstActive.rentAmount ?? '' }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bill?.id, rentals.length]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMonthSelect = (monthStr: string) => {
        setFormData(prev => ({ ...prev, month: monthStr }));
        setShowMonthPopup(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.rental?.id) {
            toast.error(lang === 'en' ? 'Please select a rental' : 'សូមជ្រើសរើសការជួល');
            return;
        }
        if (!formData.month) {
            toast.error(lang === 'en' ? 'Please select a month' : 'សូមជ្រើសរើសខែ');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                rentalId: formData.rental.id,
                month: formData.month,
                rentAmount: (formData.rentAmount !== '' && formData.rentAmount !== undefined) ? Number(formData.rentAmount) : undefined,
                prevElectricityReading: Number(formData.prevElectricityReading),
                currElectricityReading: Number(formData.currElectricityReading),
                prevWaterReading: Number(formData.prevWaterReading),
                currWaterReading: Number(formData.currWaterReading),
                electricityAmount: formData.electricityAmount !== '' ? Number(formData.electricityAmount) : 0,
                waterAmount: formData.waterAmount !== '' ? Number(formData.waterAmount) : 0,
                electricityStatus: formData.electricityStatus,
                waterStatus: formData.waterStatus,
                notes: formData.notes
            };

            if (bill) {
                await updateBill(bill.id, payload);
                toast.success(lang === 'en' ? 'Bill updated successfully' : 'បានកែប្រែវិក័យប័ត្រដោយជោគជ័យ');
            } else {
                await createBill(payload);
                toast.success(lang === 'en' ? 'Bill created successfully' : 'បានបង្កើតវិក័យប័ត្រដោយជោគជ័យ');
            }
            router.push('/dashboard/bills');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(lang === 'en' ? 'Failed to save bill' : 'រក្សាទុកវិក័យប័ត្រមិនបានសម្រេច');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Elegant Header & Back Button */}
            <div className="flex items-center justify-between mb-8 px-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-bold text-sm bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <FaArrowLeft className="text-xs" /> {lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-violet-100/50 dark:shadow-none border border-violet-50 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700"
            >
                {/* Form Hero Section */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black tracking-tight">
                            {lang === 'km'
                                ? bill ? 'កែប្រែវិក្កយបត្រ' : 'បង្កើតវិក្កយបត្រថ្មី'
                                : bill ? 'Edit Invoice' : 'Create New Invoice'}
                        </h2>
                        <p className="text-violet-100 mt-2 font-medium opacity-90">
                            {lang === 'km'
                                ? 'បំពេញព័ត៌មានខាងក្រោមដើម្បីគ្រប់គ្រងការទូទាត់'
                                : 'Complete the billing information for the rental service'}
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {/* Section 1: Target & Date */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                                {lang === 'km' ? 'ព័ត៌មានអតិថិជន និងពេលវេលា' : 'Client & Timeline'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                            {/* Rental Dropdown */}
                            <div className="relative group" ref={dropdownRef}>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    {lang === 'km' ? 'ជ្រើសរើសការជួល *' : 'Select Rental *'}
                                </label>
                                <div
                                    className={`relative w-full px-5 py-4 border rounded-3xl cursor-pointer flex justify-between items-center transition-all ${isOpen ? 'border-violet-300 ring-4 ring-violet-50 dark:ring-violet-900/30 bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-slate-600'}`}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${formData.rental?.id ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'}`}>
                                            <FaUser />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            {formData.rental?.id ? (
                                                <>
                                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        {formData.rental.ClientName}
                                                    </span>
                                                    <span className="text-[11px] text-violet-500 font-bold uppercase">
                                                        Room {formData.rental.roomNumber}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-sm font-medium">
                                                    {lang === 'km' ? 'ជ្រើសរើសការជួល' : 'Choose a rental'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <FaChevronDown className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : ''}`} />
                                </div>

                                {isOpen && (
                                    <div className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[30px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50">
                                            <div className="relative group">
                                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm group-focus-within:text-violet-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬលេខបន្ទប់...' : 'Search...'}
                                                    value={rentalSearch}
                                                    onChange={(e) => setRentalSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20 focus:border-violet-200 dark:focus:border-violet-700 transition-all font-medium dark:text-gray-200"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {(() => {
                                                const combinedRentals = [...activeRentals];
                                                if (bill && bill.rental && !activeRentals.find(r => r.id === bill.rental.id)) {
                                                    combinedRentals.push(bill.rental);
                                                }

                                                const filtered = combinedRentals.filter(r =>
                                                    r.ClientName.toLowerCase().includes(rentalSearch.toLowerCase()) ||
                                                    r.roomNumber.toLowerCase().includes(rentalSearch.toLowerCase())
                                                );

                                                if (filtered.length === 0) {
                                                    return (
                                                        <div className="py-10 text-center">
                                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <FaSearch className="text-gray-300 text-lg" />
                                                            </div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                                                {lang === 'km' ? 'រកមិនឃើញការជួលទេ' : 'No rentals found'}
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                return filtered.map(r => (
                                                    <div
                                                        key={r.id}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, rental: r, rentAmount: r.rentAmount }));
                                                            setIsOpen(false);
                                                            setRentalSearch('');
                                                        }}
                                                        className={`px-4 py-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all mb-1 ${formData.rental?.id === r.id ? 'bg-violet-600 text-white' : 'hover:bg-violet-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold tracking-tight">
                                                                {r.ClientName}
                                                            </span>
                                                            <span className={`text-[10px] font-bold uppercase mt-0.5 ${formData.rental?.id === r.id ? 'text-violet-200' : 'text-violet-500'}`}>
                                                                Room {r.roomNumber} • {r.status}
                                                            </span>
                                                        </div>
                                                        {formData.rental?.id === r.id && <FaCheck className="text-xs" />}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Month Selector */}
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    {lang === 'km' ? 'ខែសម្រាប់វិក្កយបត្រ *' : 'Billing Month *'}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowMonthPopup(true)}
                                    className="w-full h-[62px] px-5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-3xl flex justify-between items-center hover:border-violet-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 group-hover:text-violet-600 dark:group-hover:text-violet-400 flex items-center justify-center transition-colors">
                                            <FaCalendarAlt />
                                        </div>
                                        <span>
                                            {formData.month ? formatKhmerDate(formData.month, lang) : (lang === 'km' ? 'សូមជ្រើសរើសខែ' : 'Select Month')}
                                        </span>
                                    </div>
                                    <FaRegClock className="text-gray-300 text-lg opacity-40" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Utilities */}
                    <div>
                        <div className="flex items-center gap-3 mb-6 pt-4">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                                {lang === 'km' ? 'ការប្រើប្រាស់ និងការចំណាយ' : 'Usage & Charges'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">
                            {/* Room Rent Column */}
                            <div className="space-y-6">
                                <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 rounded-[32px] border border-amber-100/50 dark:border-amber-900/30 space-y-6 h-full">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                            <FaHome size={14} />
                                        </div>
                                        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                                            {lang === 'km' ? 'ថ្លៃបន្ទប់' : 'Room Rent'}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="rentAmount"
                                            value={formData.rentAmount !== undefined && formData.rentAmount !== null ? formData.rentAmount : ''}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-lg font-black text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-50 dark:focus:ring-amber-900/20 focus:border-amber-200 dark:focus:border-amber-700 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                            placeholder="0.00"
                                            step="any"
                                        />
                                        <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</div>
                                    </div>
                                    <p className="text-xs text-gray-400 px-2 font-medium">
                                        {lang === 'km' ? 'ទុកទទេដើម្បីប្រើតម្លៃដើមរបស់បន្ទប់' : 'Leave empty to use default room price'}
                                    </p>
                                </div>
                            </div>

                            {/* Electricity Column */}
                            <div className="space-y-6">
                                <div className="p-6 bg-violet-50/30 dark:bg-violet-900/10 rounded-[32px] border border-violet-100/50 dark:border-violet-900/30 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                                            <FaBolt size={14} />
                                        </div>
                                        <span className="text-xs font-black text-violet-700 uppercase tracking-wider">
                                            {lang === 'km' ? 'អគ្គិសនី' : 'Electricity'}
                                        </span>
                                    </div>

                                    {/* Readings */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                                                {lang === 'km' ? 'លេខអំណានចាស់' : 'Prev Read'}
                                            </label>
                                            <input
                                                type="number"
                                                name="prevElectricityReading"
                                                value={formData.prevElectricityReading}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all focus:border-violet-200 dark:focus:border-violet-700"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                                                {lang === 'km' ? 'លេខអំណានថ្មី' : 'Curr Read'}
                                            </label>
                                            <input
                                                type="number"
                                                name="currElectricityReading"
                                                value={formData.currElectricityReading}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all focus:border-violet-200 dark:focus:border-violet-700"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="electricityAmount"
                                            value={formData.electricityAmount !== undefined && formData.electricityAmount !== null ? formData.electricityAmount : ''}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-lg font-black text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20 focus:border-violet-200 dark:focus:border-violet-700 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                            placeholder="0.00"
                                            required
                                        />
                                        <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</div>
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-gray-400 italic">
                                            Rate: ${rates.electricity}/kWh
                                        </span>
                                    </div>

                                    <CustomDropdown
                                        options={[
                                            { value: 'Paid', label: lang === 'km' ? 'បានបង់ (Paid)' : 'Paid' },
                                            { value: 'Unpaid', label: lang === 'km' ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid' }
                                        ]}
                                        value={formData.electricityStatus}
                                        onChange={(val: string) => setFormData(prev => ({ ...prev, electricityStatus: val as 'Paid' | 'Unpaid' }))}
                                    />
                                </div>
                            </div>

                            {/* Water Column */}
                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-[32px] border border-blue-100/50 dark:border-blue-900/30 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                            <FaTint size={14} />
                                        </div>
                                        <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                                            {lang === 'km' ? 'ទឹកស្អាត' : 'Water'}
                                        </span>
                                    </div>

                                    {/* Readings */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                                                {lang === 'km' ? 'លេខអំណានចាស់' : 'Prev Read'}
                                            </label>
                                            <input
                                                type="number"
                                                name="prevWaterReading"
                                                value={formData.prevWaterReading}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all focus:border-blue-200 dark:focus:border-blue-700"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                                                {lang === 'km' ? 'លេខអំណានថ្មី' : 'Curr Read'}
                                            </label>
                                            <input
                                                type="number"
                                                name="currWaterReading"
                                                value={formData.currWaterReading}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all focus:border-blue-200 dark:focus:border-blue-700"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="waterAmount"
                                            value={formData.waterAmount !== undefined && formData.waterAmount !== null ? formData.waterAmount : ''}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-lg font-black text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-200 dark:focus:border-blue-700 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                            placeholder="0.00"
                                            step="any"
                                            required
                                        />
                                        <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xl" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</div>
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-gray-400 italic">
                                            Rate: ${rates.water}/m³
                                        </span>
                                    </div>

                                    <CustomDropdown
                                        options={[
                                            { value: 'Paid', label: lang === 'km' ? 'បានបង់ (Paid)' : 'Paid' },
                                            { value: 'Unpaid', label: lang === 'km' ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid' }
                                        ]}
                                        value={formData.waterStatus}
                                        onChange={(val: string) => setFormData(prev => ({ ...prev, waterStatus: val as 'Paid' | 'Unpaid' }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                                {lang === 'km' ? 'សម្គាល់បន្ថែម' : 'Additional Notes'}
                            </h3>
                        </div>
                        <div className="relative group">
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-6 py-5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-[32px] text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20 focus:border-violet-200 dark:focus:border-violet-700 transition-all resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                placeholder={lang === 'km' ? 'សរសេរសម្គាល់នៅទីនេះ...' : 'Enter any special instructions or remarks...'}
                            />
                            <FaRegStickyNote className="absolute right-6 top-6 text-gray-200 text-xl" />
                        </div>

                        {/* Total Summary with KHR */}
                        <div className="mt-10 p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-violet-500/20 transition-all duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-1 text-center md:text-left">
                                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'en' ? 'Grand Total' : 'ទឹកប្រាក់សរុប'}</h4>
                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <span className="text-violet-400 text-xl font-black italic">$</span>
                                        <span className="text-4xl font-black tracking-tighter">
                                            {(Number(formData.rentAmount || 0) + Number(formData.electricityAmount || 0) + Number(formData.waterAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-px w-full md:h-12 md:w-px bg-slate-800"></div>

                                <div className="space-y-1 text-center md:text-right">
                                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'en' ? 'Total in Riel (KHR)' : 'សរុបជាប្រាក់រៀល'}</h4>
                                    <div className="flex items-baseline gap-2 justify-center md:justify-end">
                                        <span className="text-3xl font-black tracking-tighter text-emerald-400">
                                            {Math.round((Number(formData.rentAmount || 0) + Number(formData.electricityAmount || 0) + Number(formData.waterAmount || 0)) * rates.exchangeRate).toLocaleString()}
                                        </span>
                                        <span className="text-emerald-500 text-lg font-black">៛</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold italic opacity-60">
                                        * {lang === 'en' ? `Rate: 1$ = ${rates.exchangeRate}៛` : `អត្រា៖ 1$ = ${rates.exchangeRate}៛`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-10 flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-grow bg-gradient-to-br from-violet-600 to-indigo-700 text-white py-5 px-8 rounded-[28px] text-lg font-black tracking-wide shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 hover:-translate-y-1 active:translate-y-0 active:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>{lang === 'km' ? 'កំពុងរក្សាទុក...' : 'Processing...'}</span>
                                </div>
                            ) : (
                                <span>
                                    {bill
                                        ? lang === 'km' ? 'កែប្រែព័ត៌មានវិក្កយបត្រ' : 'Update Invoice Details'
                                        : lang === 'km' ? 'បង្កើតវិក្កយបត្រឥឡូវនេះ' : 'Confirm & Generate Invoice'}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Khmer Calendar Popup */}
            {showMonthPopup && (
                <KhmerCalendar
                    selectedDate={formData.month}
                    onChange={handleMonthSelect}
                    lang={lang}
                    onClose={() => setShowMonthPopup(false)}
                    isPopup={true}
                />
            )}
        </div>
    );
};

export default BillForm;
