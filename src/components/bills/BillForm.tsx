'use client';

import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { Bill } from '@/types/bill';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import KhmerCalendar from '@/utils/KhmerCalendar';
import { useRouter } from 'next/navigation';

interface BillFormProps {
    rentals: Rental[];
    bill?: Bill; // Optional: for editing existing bill
}

const BillForm: React.FC<BillFormProps> = ({ rentals, bill }) => {
    const { lang } = useLang();
    const router = useRouter();

    // Filter out non-active rentals
    const activeRentals = rentals.filter(r => r.status !== 'Non-Active');

    // Initialize form data (use existing bill if editing)
    const [formData, setFormData] = useState<Omit<Bill, 'id'>>({
        rental: bill?.rental || activeRentals[0] || ({} as Rental),
        month: bill?.month || '',
        electricityAmount: bill?.electricityAmount || 0,
        waterAmount: bill?.waterAmount || 0,
        electricityStatus: bill?.electricityStatus || 'Unpaid',
        waterStatus: bill?.waterStatus || 'Unpaid',
        notes: bill?.notes || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMonthPopup, setShowMonthPopup] = useState(false);

    // Update formData when bill changes (for edit)
    useEffect(() => {
        if (bill) {
            setFormData({
                rental: bill.rental,
                month: bill.month,
                electricityAmount: bill.electricityAmount,
                waterAmount: bill.waterAmount,
                electricityStatus: bill.electricityStatus,
                waterStatus: bill.waterStatus,
                notes: bill.notes || '',
            });
        }
    }, [bill]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]:
                name === 'electricityAmount' || name === 'waterAmount'
                    ? Number(value)
                    : value,
        }));
    };

    const handleRentalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rentalId = Number(e.target.value);
        const selectedRental = activeRentals.find(r => r.id === rentalId);
        if (selectedRental) {
            setFormData(prev => ({ ...prev, rental: selectedRental }));
        }
    };

    const handleMonthSelect = (monthStr: string) => {
        setFormData(prev => ({ ...prev, month: monthStr }));
        setShowMonthPopup(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (bill) {
                // Update existing bill
                console.log('Updating Bill:', { id: bill.id, ...formData });
                // TODO: Call API PUT / PATCH for updating
            } else {
                // Create new bill
                console.log('Creating Bill:', formData);
                // TODO: Call API POST for creating
            }
            router.back();
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

            <div className="text-center mb-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {lang === 'km'
                        ? bill
                            ? 'កែប្រែវិក័យប័ត្រ'
                            : 'បង្កើតវិក័យប័ត្រ'
                        : bill
                        ? 'Edit Bill'
                        : 'Create Bill'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {lang === 'km'
                        ? bill
                            ? 'កែប្រែព័ត៌មានវិក័យប័ត្រនេះ។'
                            : 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតវិក័យប័ត្រថ្មី។'
                        : bill
                        ? 'Edit the bill details below.'
                        : 'Fill in the details below to create a new bill.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Rental Selection */}
                <div className="relative">
                    <select
                        name="rental"
                        value={formData.rental.id}
                        onChange={handleRentalChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        required
                    >
                        {activeRentals.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.ClientName} - {r.roomNumber}
                            </option>
                        ))}
                    </select>
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ជ្រើសរើសការជួល *' : 'Select Rental *'}
                    </label>
                </div>

                {/* Month */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowMonthPopup(true)}
                        className="w-full text-left px-4 py-3 mt-2 border border-gray-300 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span>
                            {formData.month
                                ? formData.month
                                : lang === 'km'
                                ? 'ជ្រើសរើសខែ'
                                : 'Select Month'}
                        </span>
                        <FaCalendarAlt className="text-gray-500" />
                    </button>
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ខែ *' : 'Month *'}
                    </label>
                </div>

                {/* Electricity & Water Inputs */}
                <div className="relative">
                    <input
                        type="number"
                        name="electricityAmount"
                        value={formData.electricityAmount || ''}
                        onChange={handleChange}
                        min={0}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'វិភាគអគ្គិសនី ($) *' : 'Electricity Amount ($) *'}
                    </label>
                </div>

                <div className="relative">
                    <input
                        type="number"
                        name="waterAmount"
                        value={formData.waterAmount || ''}
                        onChange={handleChange}
                        min={0}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'វិភាគទឹក ($) *' : 'Water Amount ($) *'}
                    </label>
                </div>

                {/* Status Selects */}
                <div className="relative">
                    <select
                        name="electricityStatus"
                        value={formData.electricityStatus}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        required
                    >
                        <option value="Paid">{lang === 'km' ? 'បានបង់' : 'Paid'}</option>
                        <option value="Unpaid">{lang === 'km' ? 'មិនទាន់បង់' : 'Unpaid'}</option>
                    </select>
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ស្ថានភាពអគ្គិសនី *' : 'Electricity Status *'}
                    </label>
                </div>

                <div className="relative">
                    <select
                        name="waterStatus"
                        value={formData.waterStatus}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        required
                    >
                        <option value="Paid">{lang === 'km' ? 'បានបង់' : 'Paid'}</option>
                        <option value="Unpaid">{lang === 'km' ? 'មិនទាន់បង់' : 'Unpaid'}</option>
                    </select>
                    <label className="absolute -top-2 left-3 text-xs text-blue-600 bg-white px-1">
                        {lang === 'km' ? 'ស្ថានភាពទឹក *' : 'Water Status *'}
                    </label>
                </div>

                {/* Notes */}
                <div className="relative col-span-1 md:col-span-2">
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows={3}
                        className="peer w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                    : bill
                    ? lang === 'km'
                        ? 'កែប្រែវិក័យប័ត្រ'
                        : 'Update Bill'
                    : lang === 'km'
                    ? 'បង្កើតវិក័យប័ត្រ'
                    : 'Create Bill'}
            </button>

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
        </form>
    );
};

export default BillForm;
