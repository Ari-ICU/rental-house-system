'use client';

import React, { useState } from 'react';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';
import FileUploader from '@/common/FileUploader';

const RentalForm: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();

    const [formData, setFormData] = useState<Omit<Rental, 'id'>>({
        ClientName: '',
        image: '',
        roomNumber: '',
        status: 'In-Active',
        rentAmount: 0,
        startDate: '',
        endDate: '',
        notes: '',
        clientPhone: '',
        clientEmail: '',
        clientAddress: '',
        clientIDCard: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        clientImageCard: {
            front: '',
            back: '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [editingDateField, setEditingDateField] = useState<'startDate' | 'endDate' | null>(null);

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'rentAmount' ? Number(value) : value,
        }));
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
        reader.onload = () => {
            const base64 = reader.result as string;
            setFormData((prev) => ({
                ...prev,
                clientImageCard: { ...prev.clientImageCard, [side]: base64 },
            }));
            if (side === 'front') setFrontPreview(base64);
            if (side === 'back') setBackPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            console.log('Submitting Rental Form Data:', formData);
            // TODO: API call
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Status options with correct translations
    const statusOptions = [
        { value: 'In-Active', label: lang === 'km' ? 'សកម្ម' : 'Active' },
        { value: 'Non-Active', label: lang === 'km' ? 'មិនសកម្ម' : 'Inactive' },
        { value: 'Past', label: lang === 'km' ? 'កន្លងផុត' : 'Past' },
    ];

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-8"
        >
            {/* Back Button */}
            <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-2 transition"
                aria-label={lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Go back'}
            >
                <FaArrowLeft />
                <span>{lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
            </button>

            {/* Header */}
            <div className="text-center mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                    {lang === 'km' ? 'បន្ថែមការជួលថ្មី' : 'Add New Rental'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {lang === 'km'
                        ? 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតកំណត់ត្រាជួលថ្មី។'
                        : 'Fill in the details below to create a new rental record.'}
                </p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div className="md:col-span-2">
                    <FileUploader
                        label={lang === 'km' ? 'រូបភាពអតិថិជន' : 'Client Photo'}
                        accept="image/*"
                        onFileSelect={handleProfileImageChange}
                        preview={profilePreview}
                    />
                </div>

                {/* Client Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'ឈ្មោះអតិថិជន *' : 'Client Name *'}
                    </label>
                    <input
                        type="text"
                        name="ClientName"
                        value={formData.ClientName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                    />
                </div>

                {/* Room Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'លេខបន្ទប់ *' : 'Room Number *'}
                    </label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'ស្ថានភាព *' : 'Status *'}
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
                        required
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rent Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'តម្លៃជួល ($)*' : 'Rent Amount ($)*'}
                    </label>
                    <input
                        type="number"
                        name="rentAmount"
                        value={formData.rentAmount || ''}
                        onChange={handleChange}
                        min={0}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                    />
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'ថ្ងៃចាប់ផ្តើម *' : 'Start Date *'}
                    </label>
                    <button
                        type="button"
                        onClick={() => handleDateFieldClick('startDate')}
                        className="w-full text-left px-4 py-2.5 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                        <span className={formData.startDate ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.startDate ||
                                (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select date')}
                        </span>
                        <FaCalendarAlt className="text-gray-500" />
                    </button>
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'ថ្ងៃបញ្ចប់ *' : 'End Date *'}
                    </label>
                    <button
                        type="button"
                        onClick={() => handleDateFieldClick('endDate')}
                        className="w-full text-left px-4 py-2.5 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                        <span className={formData.endDate ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.endDate ||
                                (lang === 'km' ? 'ជ្រើសរើសថ្ងៃ' : 'Select date')}
                        </span>
                        <FaCalendarAlt className="text-gray-500" />
                    </button>
                </div>

                {/* Phone & Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                    </label>
                    <input
                        type="tel"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'អ៊ីមែល' : 'Email'}
                    </label>
                    <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'អាស័យដ្ឋាន' : 'Address'}
                    </label>
                    <input
                        type="text"
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                {/* ID Card Images */}
                <div>
                    <FileUploader
                        label={lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ (មុខ)' : 'ID Card (Front)'}
                        accept="image/*"
                        onFileSelect={(file) => handleCardImageChange('front', file)}
                        preview={frontPreview}
                    />
                </div>

                <div>
                    <FileUploader
                        label={lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ (ខាងក្រោយ)' : 'ID Card (Back)'}
                        accept="image/*"
                        onFileSelect={(file) => handleCardImageChange('back', file)}
                        preview={backPreview}
                    />
                </div>

                {/* Emergency Contact */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'ឈ្មោះអ្នកទំនាក់ទំនងបន្ទាន់' : 'Emergency Contact'}
                    </label>
                    <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'លេខទូរស័ព្ទបន្ទាន់' : 'Emergency Phone'}
                    </label>
                    <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'km' ? 'កំណត់សម្គាល់' : 'Notes'}
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all
                        ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
                        }`}
                >
                    {isSubmitting
                        ? lang === 'km'
                            ? 'កំពុងដាក់ស្នើ...'
                            : 'Submitting...'
                        : lang === 'km'
                            ? 'ដាក់ស្នើការជួល'
                            : 'Submit Rental'}
                </button>
            </div>

            {/* Khmer Calendar Popup */}
            {showDatePopup && editingDateField && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
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
        </form>
    );
};

export default RentalForm;