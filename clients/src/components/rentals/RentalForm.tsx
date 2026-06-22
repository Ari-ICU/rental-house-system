'use client';

import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    ArrowLeft, 
    User, 
    DoorOpen, 
    Phone, 
    Mail, 
    MapPin, 
    IdCard, 
    AlertTriangle, 
    FileText, 
    DollarSign, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    Home, 
    Send, 
    Zap, 
    Droplet 
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Rental, RentalStatus } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';
import FileUploader from '@/common/FileUploader';
import { createRental, RentalPayload } from '@/services/rentalService';
import { ApiError } from '@/lib/api';
import CustomDropdown from '@/common/CustomDropdown';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

const RentalForm: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState<Omit<Rental, 'id'>>({
        ClientName: '',
        image: '',
        roomNumber: '',
        status: 'Active',
        rentAmount: 50,
        depositAmount: 0,
        startDate: '',
        endDate: '',
        notes: '',
        clientPhone: '',
        clientEmail: '',
        clientAddress: '',
        nationality: '',
        gender: '',
        occupation: '',
        idCardType: '',
        memberCount: 1,
        clientIDCard: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        telegramChatId: '',
        startElectricityReading: 0,
        startWaterReading: 0,
        depositStatus: 'Unpaid',
        paymentDueDay: 5,
        contractAgreement: '',
        clientImageCard: {
            front: '',
            back: '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [editingDateField, setEditingDateField] = useState<'startDate' | 'endDate' | null>(null);

    useEffect(() => {
        const queryRoomNumber = searchParams.get('roomNumber');
        const queryStatus = searchParams.get('status');
        if (queryRoomNumber) {
            setFormData((prev) => ({ ...prev, roomNumber: queryRoomNumber }));
        }
        if (queryStatus && ['Active', 'Reserved', 'Completed', 'Maintenance'].includes(queryStatus)) {
            setFormData((prev) => ({ ...prev, status: queryStatus as RentalStatus }));
        }
    }, [searchParams]);

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [contractPreview, setContractPreview] = useState<string | null>(null);

    // OCR States
    const [ocrText, setOcrText] = useState<string>('');
    const [isExtracting, setIsExtracting] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<'rental' | 'tenant' | 'documents'>('rental');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const numericFields = ['rentAmount', 'depositAmount', 'memberCount', 'startElectricityReading', 'startWaterReading', 'paymentDueDay'];
        setFormData((prev) => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value,
        }));
    };

    const handleContractFileChange = (file: File | null) => {
        if (!file) {
            setFormData((prev) => ({ ...prev, contractAgreement: '' }));
            setContractPreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setFormData((prev) => ({ ...prev, contractAgreement: base64 }));
            setContractPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleDateFieldClick = (field: 'startDate' | 'endDate') => {
        setEditingDateField(field);
        setShowDatePopup(true);
    };

    const handleDateChange = (dateStr: string) => {
        if (editingDateField) {
            setFormData((prev) => ({ ...prev, [editingDateField]: dateStr }));
            setShowDatePopup(false);
        }
    };

    const handleProfileImageChange = (file: File | null) => {
        if (!file) {
            setFormData((prev) => ({ ...prev, image: '' }));
            setProfilePreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setFormData((prev) => ({ ...prev, image: base64 }));
            setProfilePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleCardImageChange = (side: 'front' | 'back', file: File | null) => {
        if (!file) {
            setFormData((prev) => ({
                ...prev,
                clientImageCard: { ...prev.clientImageCard, [side]: '' },
            }));
            if (side === 'front') setFrontPreview(null);
            if (side === 'back') setBackPreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            setFormData((prev) => ({
                ...prev,
                clientImageCard: { ...prev.clientImageCard, [side]: base64 },
            }));
            if (side === 'front') setFrontPreview(base64);
            if (side === 'back') setBackPreview(base64);

            if (side === 'front' && base64.startsWith('data:image')) {
                setIsExtracting(true);
                try {
                    const { data: { text } } = await Tesseract.recognize(
                        file,
                        'khm', // Strict Khmer for best results
                        { logger: m => console.log(m) }
                    );
                    setOcrText(text);

                    // Parse OCR Text for auto-population
                    const idNumberMatch = text.match(/\b\d{9}\b/) || text.match(/\b\d{3}\s\d{3}\s\d{3}\b/);
                    let detectedGender = "";
                    if (text.includes("ប្រុស") || text.toLowerCase().includes("male") || text.includes("ប") || text.includes("ប៉")) {
                        detectedGender = "Male";
                    } else if (text.includes("ស្រី") || text.toLowerCase().includes("female") || text.includes("ស")) {
                        detectedGender = "Female";
                    }
                    
                    let detectedNationality = "";
                    if (text.includes("ខ្មែរ") || text.toLowerCase().includes("khmer")) {
                        detectedNationality = lang === 'km' ? 'ខ្មែរ' : 'Khmer';
                    }

                    const parsedId = idNumberMatch ? idNumberMatch[0].replace(/\s/g, '') : "";

                    if (parsedId || detectedGender || detectedNationality) {
                        setFormData((prev) => ({
                            ...prev,
                            ...(parsedId ? { clientIDCard: parsedId } : {}),
                            ...(detectedGender ? { gender: detectedGender } : {}),
                            ...(detectedNationality ? { nationality: detectedNationality } : {}),
                        }));
                        setToast({
                            type: 'success',
                            message: lang === 'km' 
                                ? 'បានបំពេញទិន្នន័យដោយស្វ័យប្រវត្តពីអត្តសញ្ញាណប័ណ្ណ!' 
                                : 'Auto-populated fields from ID card scan!'
                        });
                        setTimeout(() => setToast(null), 3000);
                    }
                } catch (error) {
                    console.error("OCR Extraction failed:", error);
                } finally {
                    setIsExtracting(false);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields and redirect to proper tab if missing
        if (!formData.ClientName) {
            setActiveTab('rental');
            setToast({ type: 'error', message: lang === 'km' ? 'សូមបញ្ចូលឈ្មោះអតិថិជន' : 'Please enter client name' });
            return;
        }
        if (!formData.roomNumber) {
            setActiveTab('rental');
            setToast({ type: 'error', message: lang === 'km' ? 'សូមបញ្ចូលលេខបន្ទប់' : 'Please enter room number' });
            return;
        }
        if (!formData.rentAmount) {
            setActiveTab('rental');
            setToast({ type: 'error', message: lang === 'km' ? 'សូមបញ្ចូលតម្លៃជួល' : 'Please enter rent amount' });
            return;
        }
        if (!formData.startDate) {
            setActiveTab('rental');
            setToast({ type: 'error', message: lang === 'km' ? 'សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម' : 'Please select start date' });
            return;
        }
        if (!formData.endDate) {
            setActiveTab('rental');
            setToast({ type: 'error', message: lang === 'km' ? 'សូមជ្រើសរើសថ្ងៃបញ្ចប់' : 'Please select end date' });
            return;
        }

        setIsSubmitting(true);
        setToast(null);
        try {
            const payload = {
                ...formData,
                clientImageCardFront: formData.clientImageCard?.front ?? '',
                clientImageCardBack: formData.clientImageCard?.back ?? '',
            };
            const { clientImageCard, ...rest } = payload;
            void clientImageCard;
            await createRental(rest as RentalPayload);
            setToast({
                type: 'success',
                message: lang === 'km' ? 'ការជួលត្រូវបានបន្ថែម!' : 'Rental created successfully!',
            });
            setTimeout(() => router.push('/dashboard/rentals'), 1500);
        } catch (error) {
            const msg =
                error instanceof ApiError
                    ? error.message
                    : lang === 'km'
                        ? 'មានបញ្ហាក្នុងការដាក់ស្នើ'
                        : 'Failed to submit rental';
            setToast({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: lang === 'km' ? 'កំពុងជួល' : 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-300 dark:border-emerald-800/50' },
        { value: 'Reserved', label: lang === 'km' ? 'កក់ទុក' : 'Reserved', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-300 dark:border-blue-800/50' },
        { value: 'Completed', label: lang === 'km' ? 'បានបញ្ចប់' : 'Completed', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-slate-800/50', border: 'border-gray-300 dark:border-slate-700' },
        { value: 'Maintenance', label: lang === 'km' ? 'កំពុងជួសជុល' : 'Maintenance', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-300 dark:border-rose-800/50' },
    ];

    const depositStatusOptions = [
        { value: 'Unpaid', label: lang === 'km' ? 'មិនទាន់បង់ (Unpaid)' : 'Unpaid', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-300 dark:border-amber-800/50' },
        { value: 'Paid', label: lang === 'km' ? 'បានបង់ (Paid)' : 'Paid', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-300 dark:border-emerald-800/50' },
        { value: 'Refunded', label: lang === 'km' ? 'បានបង្វិលសង (Refunded)' : 'Refunded', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-slate-800/50', border: 'border-gray-300 dark:border-slate-700' },
    ];

    const genderOptions = [
        { value: 'Male', label: lang === 'km' ? 'ប្រុស' : 'Male' },
        { value: 'Female', label: lang === 'km' ? 'ស្រី' : 'Female' },
        { value: 'Other', label: lang === 'km' ? 'ផ្សេងៗ' : 'Other' },
    ];

    const idCardTypeOptions = [
        { value: 'National ID', label: lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ' : 'National ID' },
        { value: 'Passport', label: lang === 'km' ? 'លិខិតឆ្លងដែន' : 'Passport' },
        { value: 'Family Book', label: lang === 'km' ? 'សៀវភៅគ្រួសារ' : 'Family Book' },
        { value: 'Driver License', label: lang === 'km' ? 'ប័ណ្ណបើកបរ' : 'Driver License' },
    ];


    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Toast */}
            {toast && (
                <div
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold shadow-lg border animate-fadeIn ${toast.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-200 shadow-red-100'
                        }`}
                >
                    {toast.type === 'success'
                        ? <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                        : <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-8 shadow-xl shadow-indigo-100">
                {/* Decorative circles — pointer-events-none so they don't block button clicks */}
                <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-all hover:-translate-x-1 w-fit"
                    aria-label={lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Go back'}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">{lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                        <Home className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {lang === 'km' ? 'បន្ថែមការជួលថ្មី' : 'Add New Rental'}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {lang === 'km'
                                ? 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតកំណត់ត្រាជួលថ្មី。'
                                : 'Fill in the details below to create a new rental record.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/60 gap-1 select-none">
                {(['rental', 'tenant', 'documents'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    let label = '';
                    let icon = null;
                    if (tab === 'rental') {
                        label = lang === 'km' ? 'ព័ត៌មានការជួល & សេវា' : 'Rental & Utilities';
                        icon = <DoorOpen className="w-4 h-4" />;
                    } else if (tab === 'tenant') {
                        label = lang === 'km' ? 'ប្រវត្តិរូប & ទំនាក់ទំនង' : 'Tenant Profile';
                        icon = <User className="w-4 h-4" />;
                    } else {
                        label = lang === 'km' ? 'ឯកសារ & អត្តសញ្ញាណប័ណ្ណ' : 'Documents & ID';
                        icon = <IdCard className="w-4 h-4" />;
                    }
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex-1 py-3 px-3 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 outline-none cursor-pointer z-0
                                ${isActive 
                                    ? 'text-indigo-600 dark:text-indigo-400' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-white dark:bg-slate-900/90 rounded-xl shadow-sm border border-gray-200/30 dark:border-slate-800/80 -z-10"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {icon}
                                <span>{label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="space-y-6"
                    >
                        {activeTab === 'rental' && (
                            <>
                                {/* Section: Rental Details */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <DoorOpen className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'ព័ត៌មានការជួល' : 'Rental Details'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Client Name */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ឈ្មោះអតិថិជន' : 'Client Name'} <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text" name="ClientName" value={formData.ClientName}
                                                    onChange={handleChange} required
                                                    placeholder={lang === 'km' ? 'បញ្ចូលឈ្មោះ...' : 'Enter client name...'}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Room Number */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'លេខបន្ទប់' : 'Room Number'} <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <DoorOpen className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text" name="roomNumber" value={formData.roomNumber}
                                                    onChange={handleChange} required
                                                    placeholder="e.g. A-101"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Member Count */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ចំនួនសមាជិក' : 'Member Count'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="memberCount"
                                                    value={formData.memberCount || 1}
                                                    onChange={handleChange}
                                                    min={1}
                                                    placeholder="1"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <CustomDropdown
                                            label={lang === 'km' ? 'ស្ថានភាព' : 'Status'}
                                            options={statusOptions}
                                            value={formData.status}
                                            onChange={(val: string) => setFormData(prev => ({ ...prev, status: val as RentalStatus }))}
                                            searchable={true}
                                            placeholder={lang === 'km' ? 'ជ្រើសរើសស្ថានភាព...' : 'Select status...'}
                                        />

                                        {/* Rent Amount */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'តម្លៃជួល' : 'Rent Amount'} <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <DollarSign className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number" name="rentAmount" value={formData.rentAmount || ''} min={0}
                                                    onChange={handleChange} required placeholder="0.00"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Deposit Amount */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ប្រាក់កក់' : 'Deposit Amount'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <DollarSign className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="depositAmount"
                                                    value={formData.depositAmount || ''}
                                                    onChange={handleChange}
                                                    min={0}
                                                    placeholder="0.00"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Deposit Status */}
                                        <CustomDropdown
                                            label={lang === 'km' ? 'ស្ថានភាពប្រាក់កក់' : 'Deposit Status'}
                                            options={depositStatusOptions}
                                            value={formData.depositStatus || 'Unpaid'}
                                            onChange={(val) => setFormData(prev => ({ ...prev, depositStatus: val }))}
                                            searchable={true}
                                            placeholder={lang === 'km' ? 'ជ្រើសរើសស្ថានភាព...' : 'Select status...'}
                                        />

                                        {/* Payment Due Day */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ថ្ងៃត្រូវបង់ប្រាក់ (ថ្ងៃទី)' : 'Payment Due Day (of month)'} <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Calendar className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="paymentDueDay"
                                                    value={formData.paymentDueDay || ''}
                                                    onChange={handleChange}
                                                    min={1}
                                                    max={31}
                                                    placeholder="5"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Start Date */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ថ្ងៃចាប់ផ្តើម' : 'Start Date'} <span className="text-red-400">*</span>
                                            </label>
                                            <button
                                                type="button" onClick={() => handleDateFieldClick('startDate')}
                                                className="w-full text-left px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl flex justify-between items-center focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer"
                                            >
                                                <span className={formData.startDate ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                                                    {formData.startDate || (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select date...')}
                                                </span>
                                                <Calendar className="text-indigo-400 w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* End Date */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ថ្ងៃបញ្ចប់' : 'End Date'} <span className="text-red-400">*</span>
                                            </label>
                                            <button
                                                type="button" onClick={() => handleDateFieldClick('endDate')}
                                                className="w-full text-left px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl flex justify-between items-center focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer"
                                            >
                                                <span className={formData.endDate ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                                                    {formData.endDate || (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select date...')}
                                                </span>
                                                <Calendar className="text-indigo-400 w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Starting Utility Readings */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'អំណានកុងទ័រទឹកភ្លើងចាប់ផ្តើម' : 'Starting Utility Readings'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Start Electricity Reading */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'អំណានកុងទ័រអគ្គិសនីចាប់ផ្តើម (kWh)' : 'Starting Electricity Reading (kWh)'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Zap className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="startElectricityReading"
                                                    value={formData.startElectricityReading !== undefined ? formData.startElectricityReading : 0}
                                                    onChange={handleChange}
                                                    min={0}
                                                    placeholder="0"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Start Water Reading */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'អំណានកុងទ័រទឹកចាប់ផ្តើម (m³)' : 'Starting Water Reading (m³)'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Droplet className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="startWaterReading"
                                                    value={formData.startWaterReading !== undefined ? formData.startWaterReading : 0}
                                                    onChange={handleChange}
                                                    min={0}
                                                    placeholder="0"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'tenant' && (
                            <>
                                {/* Section: Contact Information */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'Contact Information'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Phone className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="tel" name="clientPhone" value={formData.clientPhone}
                                                    onChange={handleChange} placeholder="+855 xx xxx xxx"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'អ៊ីមែល' : 'Email'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Mail className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="email" name="clientEmail" value={formData.clientEmail}
                                                    onChange={handleChange} placeholder="example@email.com"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'អាស័យដ្ឋាន' : 'Address'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <MapPin className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text" name="clientAddress" value={formData.clientAddress}
                                                    onChange={handleChange}
                                                    placeholder={lang === 'km' ? 'បញ្ចូលអាស័យដ្ឋាន...' : 'Enter full address...'}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <CustomDropdown
                                            label={lang === 'km' ? 'ភេទ' : 'Gender'}
                                            options={genderOptions}
                                            value={formData.gender || ''}
                                            onChange={(val: string) => setFormData(prev => ({ ...prev, gender: val }))}
                                            searchable={true}
                                            placeholder={lang === 'km' ? 'ជ្រើសរើសភេទ...' : 'Select gender...'}
                                        />

                                        {/* Occupation */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'មុខរបរ' : 'Occupation'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleChange}
                                                    placeholder={lang === 'km' ? 'បញ្ចូលមុខរបរ...' : 'Enter occupation...'}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Telegram Chat ID */}
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'លេខសម្គាល់ Telegram' : 'Telegram Chat ID'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Send className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="telegramChatId"
                                                    value={formData.telegramChatId}
                                                    onChange={handleChange}
                                                    placeholder={lang === 'km' ? 'ឧទាហរណ៍ៈ 123456789' : 'e.g. 123456789'}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 italic leading-relaxed">
                                                {lang === 'km'
                                                    ? '* ផ្ញើវិក្កយបត្រផ្ទាល់ខ្លួនទៅអតិថិជន។ ប្រាប់អតិថិជនឱ្យផ្ញើ /myid ទៅកាន់បូតរបស់អ្នកដើម្បីទទួលបានលេខសម្គាល់នេះ។'
                                                    : '* Sends personal invoices to the tenant. Ask them to send /myid to your bot to get this ID.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Emergency Contact */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'ទំនាក់ទំនងបន្ទាន់' : 'Emergency Contact'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'ឈ្មោះ' : 'Contact Name'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text" name="emergencyContactName" value={formData.emergencyContactName}
                                                    onChange={handleChange}
                                                    placeholder={lang === 'km' ? 'ឈ្មោះអ្នកទំនាក់ទំនងបន្ទាន់' : 'Full name...'}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {lang === 'km' ? 'លេខទូរស័ព្ទបន្ទាន់' : 'Emergency Phone'}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Phone className="text-gray-300 dark:text-slate-500 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone}
                                                    onChange={handleChange} placeholder="+855 xx xxx xxx"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'documents' && (
                            <>
                                {/* Section: Client Photo */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'រូបភាពអតិថិជន' : 'Client Photo'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <FileUploader
                                            label=""
                                            accept="image/*"
                                            onFileSelect={handleProfileImageChange}
                                            preview={profilePreview}
                                        />
                                    </div>
                                </div>

                                {/* Section: ID Card */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                <IdCard className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ' : 'ID Card Documents'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {lang === 'km' ? 'សញ្ជាតិ' : 'Nationality'}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nationality"
                                                    value={formData.nationality}
                                                    onChange={handleChange}
                                                    placeholder={lang === 'km' ? 'បញ្ចូលសញ្ជាតិ...' : 'Enter nationality...'}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                            <CustomDropdown
                                                label={lang === 'km' ? 'ប្រភេទអត្តសញ្ញាណប័ណ្ណ' : 'ID Card Type'}
                                                options={idCardTypeOptions}
                                                value={formData.idCardType || ''}
                                                onChange={(val: string) => setFormData(prev => ({ ...prev, idCardType: val }))}
                                                searchable={true}
                                                placeholder={lang === 'km' ? 'ជ្រើសរើសប្រភេទ...' : 'Select card type...'}
                                            />
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {lang === 'km' ? 'លេខអត្តសញ្ញាណប័ណ្ណ' : 'ID Card Number'}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="clientIDCard"
                                                    value={formData.clientIDCard}
                                                    onChange={handleChange}
                                                    placeholder={lang === 'km' ? 'បញ្ចូលលេខអត្តសញ្ញាណប័ណ្ណ...' : 'Enter ID number...'}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FileUploader
                                                label={lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ (មុខ)' : 'ID Card — Front Side'}
                                                accept="image/*"
                                                onFileSelect={(file) => handleCardImageChange('front', file)}
                                                preview={frontPreview}
                                            />
                                            <FileUploader
                                                label={lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ (ខាងក្រោយ)' : 'ID Card — Back Side'}
                                                accept="image/*"
                                                onFileSelect={(file) => handleCardImageChange('back', file)}
                                                preview={backPreview}
                                            />
                                        </div>

                                        {/* OCR Extracted Text Display */}
                                        {(isExtracting || ocrText) && (
                                            <div className="mt-6 p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 animate-fadeIn">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" /> {lang === 'km' ? 'អត្ថបទដែលបានស្រង់ចេញ (OCR)' : 'Extracted Text (OCR)'}
                                                    </h3>
                                                    {isExtracting && (
                                                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                                                            <Loader2 className="animate-spin w-3.5 h-3.5" /> {lang === 'km' ? 'កំពុងស្រង់អត្ថបទ...' : 'Extracting...'}
                                                        </div>
                                                    )}
                                                </div>
                                                <textarea
                                                    className="w-full h-32 p-4 text-sm bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all custom-scrollbar"
                                                    value={isExtracting ? (lang === 'km' ? "សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងអានអត្ថបទពីច្បាប់ចម្លង..." : "Please wait, scanning document...") : ocrText}
                                                    onChange={(e) => setOcrText(e.target.value)}
                                                    placeholder={lang === 'km' ? "អត្ថបទនឹងបង្ហាញនៅទីនេះ..." : "Extracted text will appear here..."}
                                                />
                                                <p className="text-[10px] text-gray-500 mt-2 italic flex items-start gap-1">
                                                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 w-4 h-4" />
                                                    {lang === 'km'
                                                        ? 'នេះជាអត្ថបទដែលប្រព័ន្ធអាចអានបាន អ្នកអាចចម្លង ឬកែសម្រួលវាបាន។ (ប្រហែលមិនត្រឹមត្រូវ១០០%)'
                                                        : 'This text is auto-extracted from the image using AI. You can selectively copy details. (Accuracy varies based on image quality)'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section: Lease Contract Agreement */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'កិច្ចសន្យាជួល' : 'Lease Contract Agreement'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <FileUploader
                                            label={lang === 'km' ? 'ផ្ទុកឡើងឯកសារកិច្ចសន្យាជួល (រូបភាព ឬ PDF)' : 'Upload lease contract document (Image or PDF)'}
                                            accept="image/*,application/pdf"
                                            onFileSelect={handleContractFileChange}
                                            preview={contractPreview}
                                        />
                                    </div>
                                </div>

                                {/* Section: Notes */}
                                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 animate-fadeIn">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                {lang === 'km' ? 'កំណត់សម្គាល់' : 'Notes'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <textarea
                                            name="notes" value={formData.notes} onChange={handleChange} rows={4}
                                            placeholder={lang === 'km' ? 'បញ្ចូលកំណត់សម្គាល់...' : 'Add any additional notes or remarks...'}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 resize-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-lg cursor-pointer
                        ${isSubmitting
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200/50 dark:shadow-none hover:shadow-indigo-300/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin text-gray-400 w-4 h-4" />
                            <span className="text-gray-400">{lang === 'km' ? 'កំពុងដាក់ស្នើ...' : 'Submitting...'}</span>
                        </>
                    ) : (
                        <>
                            <Home className="text-white/80 w-4 h-4" />
                            <span>{lang === 'km' ? 'ដាក់ស្នើការជួល' : 'Create Rental'}</span>
                        </>
                    )}
                </button>
            </form>

            {/* Khmer Calendar Popup */}
            {showDatePopup && editingDateField && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:border dark:border-slate-800 w-full max-w-md">
                        <KhmerCalendar
                            selectedDate={formData[editingDateField]}
                            onChange={handleDateChange}
                            lang={lang}
                            onClose={() => setShowDatePopup(false)}
                            isPopup={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalForm;