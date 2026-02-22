'use client';

import React, { useState } from 'react';
import {
    FaCalendarAlt, FaArrowLeft, FaUser, FaDoorOpen, FaPhone, FaEnvelope,
    FaMapMarkerAlt, FaIdCard, FaExclamationTriangle, FaStickyNote,
    FaDollarSign, FaCheckCircle, FaTimesCircle, FaSpinner, FaSave, FaTelegramPlane
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Rental, RentalStatus } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';
import FileUploader from '@/common/FileUploader';
import { updateRental, RentalPayload } from '@/services/rentalService';
import { ApiError } from '@/lib/api';
import CustomDropdown from '@/common/CustomDropdown';

interface RentalEditFormProps {
    rental: Rental;
    id: number | string;
}

const RentalEditForm: React.FC<RentalEditFormProps> = ({ rental, id }) => {
    const { lang } = useLang();
    const router = useRouter();

    const [formData, setFormData] = useState<Omit<Rental, 'id'>>({
        ClientName: rental.ClientName ?? '',
        image: rental.image ?? '',
        roomNumber: rental.roomNumber ?? '',
        status: rental.status ?? 'Active',
        rentAmount: rental.rentAmount ?? 0,
        depositAmount: rental.depositAmount ?? 0,
        startDate: rental.startDate ?? '',
        endDate: rental.endDate ?? '',
        notes: rental.notes ?? '',
        clientPhone: rental.clientPhone ?? '',
        clientEmail: rental.clientEmail ?? '',
        clientAddress: rental.clientAddress ?? '',
        nationality: rental.nationality ?? '',
        gender: rental.gender ?? '',
        occupation: rental.occupation ?? '',
        idCardType: rental.idCardType ?? '',
        memberCount: rental.memberCount ?? 1,
        clientIDCard: rental.clientIDCard ?? '',
        emergencyContactName: rental.emergencyContactName ?? '',
        emergencyContactPhone: rental.emergencyContactPhone ?? '',
        telegramChatId: rental.telegramChatId ?? '',
        clientImageCard: {
            front: rental.clientImageCard?.front ?? '',
            back: rental.clientImageCard?.back ?? '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [editingDateField, setEditingDateField] = useState<'startDate' | 'endDate' | null>(null);

    const [profilePreview, setProfilePreview] = useState<string | null>(rental.image ?? null);
    const [frontPreview, setFrontPreview] = useState<string | null>(rental.clientImageCard?.front ?? null);
    const [backPreview, setBackPreview] = useState<string | null>(rental.clientImageCard?.back ?? null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const numericFields = ['rentAmount', 'depositAmount', 'memberCount'];
        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value,
        }));
    };

    const handleDateFieldClick = (field: 'startDate' | 'endDate') => {
        setEditingDateField(field);
        setShowDatePopup(true);
    };

    const handleDateChange = (dateStr: string) => {
        if (editingDateField) {
            setFormData(prev => ({ ...prev, [editingDateField]: dateStr }));
            setShowDatePopup(false);
        }
    };

    const handleProfileImageChange = (file: File | null) => {
        if (!file) { setFormData(prev => ({ ...prev, image: '' })); setProfilePreview(null); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({ ...prev, image: base64 }));
            setProfilePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleCardImageChange = (side: 'front' | 'back', file: File | null) => {
        if (!file) {
            setFormData(prev => ({ ...prev, clientImageCard: { ...prev.clientImageCard, [side]: '' } }));
            if (side === 'front') setFrontPreview(null);
            if (side === 'back') setBackPreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({ ...prev, clientImageCard: { ...prev.clientImageCard, [side]: base64 } }));
            if (side === 'front') setFrontPreview(base64);
            if (side === 'back') setBackPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            await updateRental(id, rest as RentalPayload);


            setToast({
                type: 'success',
                message: lang === 'km' ? 'ការជួលត្រូវបានធ្វើបច្ចុប្បន្នភាព!' : 'Rental updated successfully!',
            });
            setTimeout(() => router.push('/dashboard/rentals'), 1500);
        } catch (error) {
            const msg =
                error instanceof ApiError
                    ? error.message
                    : lang === 'km'
                        ? 'មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព'
                        : 'Failed to update rental';
            setToast({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: lang === 'km' ? 'កំពុងជួល' : 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
        { value: 'Reserved', label: lang === 'km' ? 'កក់ទុក' : 'Reserved', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
        { value: 'Completed', label: lang === 'km' ? 'បានបញ្ចប់' : 'Completed', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-300' },
        { value: 'Maintenance', label: lang === 'km' ? 'កំពុងជួសជុល' : 'Maintenance', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300' },
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
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold shadow-lg border animate-fadeIn ${toast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100'
                    : 'bg-red-50 text-red-700 border-red-200 shadow-red-100'
                    }`}>
                    {toast.type === 'success'
                        ? <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                        : <FaTimesCircle className="text-red-500 text-lg flex-shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-xl shadow-purple-200">
                <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-all hover:-translate-x-1 w-fit"
                    aria-label={lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Go back'}
                >
                    <FaArrowLeft className="text-sm" />
                    <span className="text-sm">{lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                        <FaSave className="text-white text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {lang === 'km' ? 'កែប្រែការជួល' : 'Edit Rental'}
                        </h1>
                        <p className="text-purple-200 text-sm mt-1">
                            {lang === 'km'
                                ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានការជួល'
                                : `Editing rental for ${rental.ClientName} — Room ${rental.roomNumber}`}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section: Client Photo */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                <FaUser className="text-violet-600 text-xs" />
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

                {/* Section: Rental Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FaDoorOpen className="text-blue-600 text-xs" />
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
                                    <FaUser className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="text" name="ClientName" value={formData.ClientName}
                                    onChange={handleChange} required
                                    placeholder={lang === 'km' ? 'បញ្ចូលឈ្មោះ...' : 'Enter client name...'}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
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
                                    <FaDoorOpen className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="text" name="roomNumber" value={formData.roomNumber}
                                    onChange={handleChange} required
                                    placeholder="e.g. A-101"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
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
                                    <FaUser className="text-gray-300 text-xs" />
                                </div>
                                <input
                                    type="number"
                                    name="memberCount"
                                    value={formData.memberCount || 1}
                                    onChange={handleChange}
                                    min={1}
                                    placeholder="1"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <CustomDropdown
                            label={lang === 'km' ? 'ស្ថានភាព' : 'Status'}
                            options={statusOptions}
                            value={formData.status}
                            onChange={(val: string) => setFormData(prev => ({ ...prev, status: val as RentalStatus }))}
                        />

                        {/* Rent Amount */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {lang === 'km' ? 'តម្លៃជួល' : 'Rent Amount'} <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FaDollarSign className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="number" name="rentAmount" value={formData.rentAmount || ''} min={0}
                                    onChange={handleChange} required placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
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
                                    <FaDollarSign className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="number"
                                    name="depositAmount"
                                    value={formData.depositAmount || ''}
                                    onChange={handleChange}
                                    min={0}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
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
                                className="w-full text-left px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl flex justify-between items-center focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                            >
                                <span className={formData.startDate ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                                    {formData.startDate || (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select date...')}
                                </span>
                                <FaCalendarAlt className="text-violet-400 text-sm" />
                            </button>
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {lang === 'km' ? 'ថ្ងៃបញ្ចប់' : 'End Date'} <span className="text-red-400">*</span>
                            </label>
                            <button
                                type="button" onClick={() => handleDateFieldClick('endDate')}
                                className="w-full text-left px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl flex justify-between items-center focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                            >
                                <span className={formData.endDate ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                                    {formData.endDate || (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select date...')}
                                </span>
                                <FaCalendarAlt className="text-violet-400 text-sm" />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Section: Contact Information */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                <FaPhone className="text-sky-600 text-xs" />
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
                                    <FaPhone className="text-gray-300 text-xs" />
                                </div>
                                <input
                                    type="tel" name="clientPhone" value={formData.clientPhone}
                                    onChange={handleChange} placeholder="+855 xx xxx xxx"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {lang === 'km' ? 'អ៊ីមែល' : 'Email'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="email" name="clientEmail" value={formData.clientEmail}
                                    onChange={handleChange} placeholder="example@email.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {lang === 'km' ? 'អាស័យដ្ឋាន' : 'Address'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FaMapMarkerAlt className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="text" name="clientAddress" value={formData.clientAddress}
                                    onChange={handleChange}
                                    placeholder={lang === 'km' ? 'បញ្ចូលអាស័យដ្ឋាន...' : 'Enter full address...'}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                        </div>
                        {/* Gender */}
                        <CustomDropdown
                            label={lang === 'km' ? 'ភេទ' : 'Gender'}
                            options={genderOptions}
                            value={formData.gender || ''}
                            onChange={(val: string) => setFormData(prev => ({ ...prev, gender: val }))}
                        />

                        {/* Occupation */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {lang === 'km' ? 'មុខរបរ' : 'Occupation'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    placeholder={lang === 'km' ? 'បញ្ចូលមុខរបរ...' : 'Enter occupation...'}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
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
                                    <FaTelegramPlane className="text-gray-300 text-sm" />
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

                {/* Section: ID Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <FaIdCard className="text-amber-600 text-xs" />
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
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                            <CustomDropdown
                                label={lang === 'km' ? 'ប្រភេទអត្តសញ្ញាណប័ណ្ណ' : 'ID Card Type'}
                                options={idCardTypeOptions}
                                value={formData.idCardType || ''}
                                onChange={(val: string) => setFormData(prev => ({ ...prev, idCardType: val }))}
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
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
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
                    </div>
                </div>

                {/* Section: Emergency Contact */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <FaExclamationTriangle className="text-red-500 text-xs" />
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
                                    <FaUser className="text-gray-300 text-sm" />
                                </div>
                                <input
                                    type="text" name="emergencyContactName" value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    placeholder={lang === 'km' ? 'ឈ្មោះអ្នកទំនាក់ទំនងបន្ទាន់' : 'Full name...'}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {lang === 'km' ? 'លេខទូរស័ព្ទបន្ទាន់' : 'Emergency Phone'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FaPhone className="text-gray-300 text-xs" />
                                </div>
                                <input
                                    type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone}
                                    onChange={handleChange} placeholder="+855 xx xxx xxx"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                                />
                            </div>
                        </div>
                    </div>
                </div >

                {/* Section: Notes */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <FaStickyNote className="text-green-600 text-xs" />
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
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 resize-none"
                        />
                    </div>
                </div >

                {/* Submit */}
                <button
                    type="submit" disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-lg
                        ${isSubmitting
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-200 hover:shadow-violet-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                >
                    {
                        isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin text-gray-400" />
                                <span className="text-gray-400">{lang === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="text-white/80" />
                                <span>{lang === 'km' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes'}</span>
                            </>
                        )}
                </button>

            </form>

            {/* Khmer Calendar Popup */}
            {
                showDatePopup && editingDateField && (
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
                )
            }
        </div>
    );
};

export default RentalEditForm;
