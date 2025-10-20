'use client';

import React, { useState } from 'react';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';

const RentalForm: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();

    const [formData, setFormData] = useState<Omit<Rental, 'id'>>({
        ClientName: '',
        image: '', // profile image
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

    // Image previews
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);

    // Handle input fields
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'rentAmount' ? Number(value) : value,
        }));
    };

    // Handle date fields
    const handleDateFieldClick = (field: 'startDate' | 'endDate') => {
        setEditingDateField(field);
        setShowDatePopup(true);
    };

    const handleDateChange = (dateStr: string) => {
        if (editingDateField) {
            setFormData((prev) => ({ ...prev, [editingDateField]: dateStr }));
        }
    };

    // Handle profile image
    const handleProfileImageChange = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setFormData((prev) => ({ ...prev, image: base64 }));
            setProfilePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    // Handle ID card images
    const handleCardImageChange = (side: 'front' | 'back', file: File | null) => {
        if (!file) return;
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

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log('Submitting Rental Form Data:', formData);
            // TODO: Send data to your API
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 space-y-6"
        >
            {/* Back Button */}
            <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-4"
            >
                <FaArrowLeft /> {lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}
            </button>

            {/* Title */}
            <div className="text-center mb-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {lang === 'km' ? 'បន្ថែមការជួលថ្មី' : 'Add New Rental'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {lang === 'km'
                        ? 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតកំណត់ត្រាជួលថ្មី។'
                        : 'Fill in the details below to create a new rental record.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Client Profile Image */}
                <div className="relative col-span-1 md:col-span-2">
                    <label className="block text-sm text-blue-600 mb-1">
                        {lang === 'km' ? 'រូបភាពអតិថិជន' : 'Client Image'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProfileImageChange(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm border border-gray-300 rounded-lg p-2"
                    />
                    {profilePreview && (
                        <div className="mt-2">
                            <img
                                src={profilePreview}
                                alt="Client Preview"
                                className="w-40 h-40 object-cover rounded-lg border"
                            />
                        </div>
                    )}
                </div>

                {/* Client Name */}
                <div className="relative">
                    <input
                        type="text"
                        name="ClientName"
                        value={formData.ClientName}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ឈ្មោះអតិថិជន *' : 'Client Name *'}
                    </label>
                </div>

                {/* Room Number */}
                <div className="relative">
                    <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'លេខបន្ទប់ *' : 'Room Number *'}
                    </label>
                </div>

                {/* Status */}
                <div className="relative">
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                    >
                        <option value="In-Active">{lang === 'km' ? 'សកម្ម' : 'In-Active'}</option>
                        <option value="Non-Active">{lang === 'km' ? 'មិនសកម្ម' : 'Non-Active'}</option>
                        <option value="Past">{lang === 'km' ? 'កន្លងមក' : 'Past'}</option>
                    </select>
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ស្ថានភាព *' : 'Status *'}
                    </label>
                </div>

                {/* Rent Amount */}
                <div className="relative">
                    <input
                        type="number"
                        name="rentAmount"
                        value={formData.rentAmount || ''}
                        onChange={handleChange}
                        min={0}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'តម្លៃជួល ($)*' : 'Rent Amount ($)*'}
                    </label>
                </div>

                {/* Start Date */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => handleDateFieldClick('startDate')}
                        className="w-full text-left px-4 py-3 mt-2 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-blue-500"
                    >
                        <span>
                            {formData.startDate
                                ? formData.startDate
                                : lang === 'km'
                                ? 'ជ្រើសរើសថ្ងៃចាប់ផ្តើម'
                                : 'Select Start Date'}
                        </span>
                        <FaCalendarAlt className="text-gray-500" />
                    </button>
                </div>

                {/* End Date */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => handleDateFieldClick('endDate')}
                        className="w-full text-left px-4 py-3 mt-2 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-blue-500"
                    >
                        <span>
                            {formData.endDate
                                ? formData.endDate
                                : lang === 'km'
                                ? 'ជ្រើសរើសថ្ងៃបញ្ចប់'
                                : 'Select End Date'}
                        </span>
                        <FaCalendarAlt className="text-gray-500" />
                    </button>
                </div>

                {/* Client Phone */}
                <div className="relative">
                    <input
                        type="tel"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'លេខទូរស័ព្ទអតិថិជន' : 'Client Phone'}
                    </label>
                </div>

                {/* Client Email */}
                <div className="relative">
                    <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'អ៊ីមែលអតិថិជន' : 'Client Email'}
                    </label>
                </div>

                {/* Client Address */}
                <div className="relative col-span-1 md:col-span-2">
                    <input
                        type="text"
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'អាស័យដ្ឋានអតិថិជន' : 'Client Address'}
                    </label>
                </div>

                {/* ID Card Front */}
                <div>
                    <label className="block text-sm text-blue-600 mb-1">
                        {lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ (មុខ)' : 'ID Card (Front)'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCardImageChange('front', e.target.files?.[0] ?? null)}
                        className="block w-full text-sm border border-gray-300 rounded-lg p-2"
                    />
                    {frontPreview && <img src={frontPreview} alt="Front ID" className="mt-2 w-[600px] h-72 mx-auto border rounded-lg" />}
                </div>

                {/* ID Card Back */}
                <div>
                    <label className="block text-sm text-blue-600 mb-1">
                        {lang === 'km' ? 'អត្តសញ្ញាណប័ណ្ណ (ក្រោយ)' : 'ID Card (Back)'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCardImageChange('back', e.target.files?.[0] ?? null)}
                        className="block w-full text-sm border border-gray-300 rounded-lg p-2"
                    />
                    {backPreview && <img src={backPreview} alt="Back ID" className="mt-2 w-[600px] h-72 mx-auto border rounded-lg" />}
                </div>

                {/* Emergency Contact Name */}
                <div className="relative">
                    <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ឈ្មោះអ្នកទំនាក់ទំនងបន្ទាន់' : 'Emergency Contact Name'}
                    </label>
                </div>

                {/* Emergency Contact Phone */}
                <div className="relative">
                    <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km'
                            ? 'លេខទូរស័ព្ទអ្នកទំនាក់ទំនងបន្ទាន់'
                            : 'Emergency Contact Phone'}
                    </label>
                </div>

                {/* Notes */}
                <div className="relative col-span-1 md:col-span-2">
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'កំណត់សម្គាល់' : 'Notes'}
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
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

            {/* Khmer Calendar Popup */}
            {showDatePopup && editingDateField && (
                <KhmerCalendar
                    selectedDate={formData[editingDateField]}
                    onChange={handleDateChange}
                    lang={lang}
                    onClose={() => setShowDatePopup(false)}
                    isPopup={true}
                />
            )}
        </form>
    );
};

export default RentalForm;
