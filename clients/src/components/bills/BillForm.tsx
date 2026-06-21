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
import { motion } from 'framer-motion';
import { Bill } from '@/types/bill';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';
import { useRouter } from 'next/navigation';
import { formatKhmerDate } from '@/utils/dateFormatter';
import { createBill, updateBill } from '@/services/billService';
import { toast } from 'react-hot-toast';

interface BillFormProps {
    rentals: Rental[];
    bill?: Bill;
}

const getInitialReadings = (rental: Rental | undefined, type: 'electricity' | 'water'): number => {
    if (!rental) return 0;
    if (rental.bills && rental.bills.length > 0) {
        const latestBill = rental.bills[0];
        return type === 'electricity' 
            ? (latestBill.currElectricityReading ?? 0)
            : (latestBill.currWaterReading ?? 0);
    }
    return type === 'electricity'
        ? (rental.startElectricityReading ?? 0)
        : (rental.startWaterReading ?? 0);
};

// Segmented slide control for payment status
const StatusToggle: React.FC<{
    value: 'Paid' | 'Unpaid';
    onChange: (val: 'Paid' | 'Unpaid') => void;
    lang: 'en' | 'km';
    id: string;
}> = ({ value, onChange, lang, id }) => {
    return (
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-full relative">
            <button
                type="button"
                onClick={() => onChange('Paid')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${
                    value === 'Paid'
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
                {value === 'Paid' && (
                    <motion.div
                        layoutId={`${id}-bg`}
                        className="absolute inset-0 bg-emerald-600 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
                {lang === 'km' ? 'បានបង់ (Paid)' : 'Paid'}
            </button>
            <button
                type="button"
                onClick={() => onChange('Unpaid')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${
                    value === 'Unpaid'
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
                {value === 'Unpaid' && (
                    <motion.div
                        layoutId={`${id}-bg`}
                        className="absolute inset-0 bg-rose-600 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
                {lang === 'km' ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid'}
            </button>
        </div>
    );
};

const BillForm: React.FC<BillFormProps> = ({ rentals, bill }) => {
    const { lang } = useLang();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [rentalSearch, setRentalSearch] = useState('');

    const activeRentals = rentals.filter(r => r.status === 'Active' || r.status === 'Reserved');
    const defaultRental = activeRentals.length > 0 ? activeRentals[0] : {} as Rental;

    const [formData, setFormData] = useState<Omit<Bill, 'id' | 'rentAmount' | 'electricityAmount' | 'waterAmount'> & {
        rentAmount?: number | string;
        electricityAmount: number | string;
        waterAmount: number | string;
        prevElectricityReading: number | string;
        currElectricityReading: number | string;
        prevWaterReading: number | string;
        currWaterReading: number | string;
    }>({
        rental: bill?.rental || defaultRental,
        month: bill?.month || '',
        rentAmount: bill?.rentAmount ?? bill?.rental?.rentAmount ?? defaultRental?.rentAmount ?? '',
        prevElectricityReading: bill?.prevElectricityReading ?? (bill ? 0 : getInitialReadings(defaultRental, 'electricity')),
        currElectricityReading: bill?.currElectricityReading ?? 0,
        electricityAmount: bill?.electricityAmount ?? '',
        prevWaterReading: bill?.prevWaterReading ?? (bill ? 0 : getInitialReadings(defaultRental, 'water')),
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
                setFormData(prev => ({
                    ...prev,
                    rental: firstActive,
                    rentAmount: firstActive.rentAmount ?? '',
                    prevElectricityReading: getInitialReadings(firstActive, 'electricity'),
                    prevWaterReading: getInitialReadings(firstActive, 'water')
                }));
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

    // Calculate live breakdown receipt values
    const liveRent = Number(formData.rentAmount || 0);
    const liveElectricity = Number(formData.electricityAmount || 0);
    const liveWater = Number(formData.waterAmount || 0);
    const liveTotal = liveRent + liveElectricity + liveWater;
    const liveTotalKHR = Math.round(liveTotal * rates.exchangeRate);

    // Calculate usage values for description
    const elecUsage = Math.max(0, Number(formData.currElectricityReading) - Number(formData.prevElectricityReading));
    const waterUsage = Math.max(0, Number(formData.currWaterReading) - Number(formData.prevWaterReading));

    return (
        <div className="max-w-[1400px] mx-auto pb-16 px-4 md:px-6">
            {/* Elegant Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all active:scale-95 mb-4"
                    >
                        <FaArrowLeft className="text-[10px]" /> {lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {bill 
                            ? (lang === 'km' ? 'កែប្រែវិក្កយបត្រ' : 'Edit Invoice')
                            : (lang === 'km' ? 'បង្កើតវិក្កយបត្រថ្មី' : 'Create Invoice')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {bill 
                            ? (lang === 'km' ? 'កែប្រែព័ត៌មានវិក្កយបត្រនៃការជួល' : 'Fill in the details below to update this billing invoice')
                            : (lang === 'km' ? 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតវិក្កយបត្រថ្មី' : 'Manage utility readings and rental payments for this period')}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold uppercase rounded-lg">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        {bill ? (lang === 'km' ? 'របៀបកែប្រែ' : 'Edit Mode') : (lang === 'km' ? 'របៀបបង្កើត' : 'Draft Mode')}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left panel: Inputs & Configuration */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="lg:col-span-7 space-y-8"
                >
                    {/* Section 1: Client & Timeline */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                {lang === 'km' ? 'ព័ត៌មានអតិថិជន និងពេលវេលា' : 'Client & Timeline'}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Rental Select Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                                    {lang === 'km' ? 'ជ្រើសរើសការជួល *' : 'Select Rental *'}
                                </label>
                                <div
                                    onClick={() => setIsOpen(!isOpen)}
                                    className={`relative w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer flex justify-between items-center transition-all ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500 bg-white dark:bg-slate-800' : 'hover:border-slate-350 dark:hover:border-slate-650'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${formData.rental?.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500'}`}>
                                            <FaUser className="text-xs" />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            {formData.rental?.id ? (
                                                <>
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                                        {formData.rental.ClientName}
                                                    </span>
                                                    <span className="text-[10px] text-indigo-600 dark:text-indigo-450 font-bold uppercase tracking-wider">
                                                        Room {formData.rental.roomNumber}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                                                    {lang === 'km' ? 'ជ្រើសរើសការជួល' : 'Choose a rental'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                                </div>

                                {isOpen && (
                                    <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                            <div className="relative">
                                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                                <input
                                                    type="text"
                                                    placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬលេខបន្ទប់...' : 'Search...'}
                                                    value={rentalSearch}
                                                    onChange={(e) => setRentalSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-850 dark:text-slate-200"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-[220px] overflow-y-auto p-1.5 custom-scrollbar">
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
                                                        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                                            {lang === 'km' ? 'រកមិនឃើញការជួលទេ' : 'No rentals found'}
                                                        </div>
                                                    );
                                                }

                                                return filtered.map(r => (
                                                    <div
                                                        key={r.id}
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                rental: r,
                                                                rentAmount: r.rentAmount ?? '',
                                                                prevElectricityReading: getInitialReadings(r, 'electricity'),
                                                                prevWaterReading: getInitialReadings(r, 'water')
                                                            }));
                                                            setIsOpen(false);
                                                            setRentalSearch('');
                                                        }}
                                                        className={`px-3.5 py-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-all mb-0.5 ${formData.rental?.id === r.id ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                                    >
                                                        <div className="flex flex-col truncate pr-2">
                                                            <span className="text-sm tracking-tight truncate">{r.ClientName}</span>
                                                            <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${formData.rental?.id === r.id ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                Room {r.roomNumber} • {r.status}
                                                            </span>
                                                        </div>
                                                        {formData.rental?.id === r.id && <FaCheck className="text-[10px]" />}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Month Select Button */}
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                                    {lang === 'km' ? 'ខែសម្រាប់វិក្កយបត្រ *' : 'Billing Month *'}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowMonthPopup(true)}
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center hover:border-slate-350 dark:hover:border-slate-655 transition-all text-sm font-bold text-slate-800 dark:text-slate-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                                            <FaCalendarAlt className="text-xs" />
                                        </div>
                                        <span>
                                            {formData.month ? formatKhmerDate(formData.month, lang) : (lang === 'km' ? 'សូមជ្រើសរើសខែ' : 'Select Month')}
                                        </span>
                                    </div>
                                    <FaRegClock className="text-slate-400 text-xs opacity-60" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Room Rent Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-amber-500 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <FaHome className="text-sm" />
                                </div>
                                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                    {lang === 'km' ? 'ថ្លៃបន្ទប់' : 'Room Rent'}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {lang === 'km' ? 'គិតជាដុល្លារ ($)' : 'USD Currency'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="relative">
                                <input
                                    type="number"
                                    name="rentAmount"
                                    value={formData.rentAmount !== undefined && formData.rentAmount !== null ? formData.rentAmount : ''}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-extrabold text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-350"
                                    placeholder="0.00"
                                    step="any"
                                />
                                <FaMoneyBillWave className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">$</div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                                {lang === 'km' 
                                    ? 'ទុកប្រឡោះនេះទំនេរ ប្រសិនបើអ្នកចង់ប្រើប្រាស់តម្លៃបន្ទប់លំនាំដើមរបស់គម្រោងជួល។' 
                                    : 'Leave empty to automatically apply the standard default rent for the selected room.'}
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Electricity & Water (2-column layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Electricity Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-violet-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-lg">
                                            <FaBolt className="text-sm" />
                                        </div>
                                        <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                                            {lang === 'km' ? 'អគ្គិសនី' : 'Electricity'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                                        Rate: ${rates.electricity}/kWh
                                    </span>
                                </div>

                                {/* Electricity readings inputs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-0.5">
                                            {lang === 'km' ? 'លេខចាស់' : 'Prev Read'}
                                        </label>
                                        <input
                                            type="number"
                                            name="prevElectricityReading"
                                            value={formData.prevElectricityReading}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-0.5">
                                            {lang === 'km' ? 'លេខថ្មី' : 'Curr Read'}
                                        </label>
                                        <input
                                            type="number"
                                            name="currElectricityReading"
                                            value={formData.currElectricityReading}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Total electricity cost input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-0.5">
                                        {lang === 'km' ? 'ថ្លៃអគ្គិសនីសរុប ($)' : 'Total Cost ($)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="electricityAmount"
                                            value={formData.electricityAmount !== undefined && formData.electricityAmount !== null ? formData.electricityAmount : ''}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-8 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                        <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">$</div>
                                    </div>
                                </div>
                            </div>

                            {/* Paid/Unpaid switch */}
                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-805">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                    {lang === 'km' ? 'ស្ថានភាពទូទាត់អគ្គិសនី' : 'Electricity Payment Status'}
                                </label>
                                <StatusToggle
                                    id="elec"
                                    value={formData.electricityStatus}
                                    onChange={(val) => setFormData(p => ({ ...p, electricityStatus: val }))}
                                    lang={lang}
                                />
                            </div>
                        </div>

                        {/* Water Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-blue-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <FaTint className="text-sm" />
                                        </div>
                                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                            {lang === 'km' ? 'ទឹកស្អាត' : 'Water'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                                        Rate: ${rates.water}/m³
                                    </span>
                                </div>

                                {/* Water readings inputs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-0.5">
                                            {lang === 'km' ? 'លេខចាស់' : 'Prev Read'}
                                        </label>
                                        <input
                                            type="number"
                                            name="prevWaterReading"
                                            value={formData.prevWaterReading}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-0.5">
                                            {lang === 'km' ? 'លេខថ្មី' : 'Curr Read'}
                                        </label>
                                        <input
                                            type="number"
                                            name="currWaterReading"
                                            value={formData.currWaterReading}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Total water cost input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-0.5">
                                        {lang === 'km' ? 'ថ្លៃទឹកសរុប ($)' : 'Total Cost ($)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="waterAmount"
                                            value={formData.waterAmount !== undefined && formData.waterAmount !== null ? formData.waterAmount : ''}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-8 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="0.00"
                                            step="any"
                                            required
                                        />
                                        <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">$</div>
                                    </div>
                                </div>
                            </div>

                            {/* Paid/Unpaid switch */}
                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-805">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                    {lang === 'km' ? 'ស្ថានភាពទូទាត់ទឹកស្អាត' : 'Water Payment Status'}
                                </label>
                                <StatusToggle
                                    id="water"
                                    value={formData.waterStatus}
                                    onChange={(val) => setFormData(p => ({ ...p, waterStatus: val }))}
                                    lang={lang}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                {lang === 'km' ? 'សម្គាល់បន្ថែម' : 'Additional Notes'}
                            </h3>
                        </div>
                        <div className="relative">
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
                                placeholder={lang === 'km' ? 'សរសេរសម្គាល់នៅទីនេះ...' : 'Enter any special instructions or remarks...'}
                            />
                            <FaRegStickyNote className="absolute right-4 top-4 text-slate-400 text-base pointer-events-none opacity-60" />
                        </div>
                    </div>
                </motion.div>

                {/* Right panel: Receipt Breakdown Summary & Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="lg:col-span-5 space-y-6 lg:sticky lg:top-6"
                >
                    {/* Invoice Receipt Breakdown */}
                    <div className="bg-slate-900 dark:bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-xl text-white relative">
                        {/* Decorative subtle header line */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-650" />
                        
                        <div className="p-6 border-b border-slate-800/80">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                {lang === 'km' ? 'សេចក្តីលម្អិតវិក្កយបត្រ' : 'Invoice Live Summary'}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="translate-no notranslate font-semibold" translate="no">
                                    {formData.rental?.id 
                                        ? `${formData.rental.ClientName}` 
                                        : (lang === 'km' ? 'មិនទាន់មានការជ្រើសរើស' : 'No Rental Selected')}
                                </span>
                                {formData.rental?.id && (
                                    <>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <span className="font-bold text-indigo-400">Room {formData.rental.roomNumber}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-4 text-sm text-slate-300">
                            {/* Room Rent row */}
                            <div className="flex justify-between items-center">
                                <span>{lang === 'km' ? 'ថ្លៃបន្ទប់ (Room Rent)' : 'Room Rent'}</span>
                                <span className="font-extrabold text-slate-100">${liveRent.toFixed(2)}</span>
                            </div>

                            {/* Electricity row */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span>{lang === 'km' ? 'ថ្លៃអគ្គិសនី (Electricity)' : 'Electricity'}</span>
                                    {elecUsage > 0 && (
                                        <span className="text-[10px] text-slate-500">
                                            {`(${formData.currElectricityReading} - ${formData.prevElectricityReading}) kWh × $${rates.electricity}`}
                                        </span>
                                    )}
                                </div>
                                <span className="font-extrabold text-slate-100">${liveElectricity.toFixed(2)}</span>
                            </div>

                            {/* Water row */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span>{lang === 'km' ? 'ថ្លៃទឹក (Water)' : 'Water'}</span>
                                    {waterUsage > 0 && (
                                        <span className="text-[10px] text-slate-500">
                                            {`(${formData.currWaterReading} - ${formData.prevWaterReading}) m³ × $${rates.water}`}
                                        </span>
                                    )}
                                </div>
                                <span className="font-extrabold text-slate-100">${liveWater.toFixed(2)}</span>
                            </div>

                            {/* Decorative invoice jagged line separator */}
                            <div className="border-t border-dashed border-slate-800 my-4" />

                            {/* Grand Totals */}
                            <div className="flex flex-col gap-2.5 pt-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {lang === 'km' ? 'ទឹកប្រាក់សរុប (USD)' : 'Total (USD)'}
                                    </span>
                                    <span className="text-3xl font-black tracking-tight text-white">
                                        ${liveTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {lang === 'km' ? 'សរុបជាប្រាក់រៀល (KHR)' : 'Total (KHR)'}
                                    </span>
                                    <span className="text-2xl font-black tracking-tight text-emerald-400">
                                        {liveTotalKHR.toLocaleString()}៛
                                    </span>
                                </div>
                                <p className="text-[9px] text-slate-500 italic text-right mt-1.5">
                                    * {lang === 'km' ? `អត្រាប្តូរប្រាក់៖ 1$ = ${rates.exchangeRate}៛` : `Exchange Rate: 1$ = ${rates.exchangeRate}៛`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-5 py-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
                        >
                            {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-4 px-6 rounded-xl shadow-md shadow-indigo-500/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>{lang === 'km' ? 'កំពុងរក្សាទុក...' : 'Processing...'}</span>
                                </>
                            ) : (
                                <span>
                                    {bill
                                        ? (lang === 'km' ? 'កែប្រែព័ត៌មាន' : 'Save Changes')
                                        : (lang === 'km' ? 'បង្កើតវិក្កយបត្រ' : 'Create Invoice')}
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
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
