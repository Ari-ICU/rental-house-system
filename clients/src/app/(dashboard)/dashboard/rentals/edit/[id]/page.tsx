'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Rental } from '@/types/rents';
import { getRentalById } from '@/services/rentalService';
import RentalEditForm from '@/components/rentals/RentalEditForm';
import { useLang } from '@/context/LangContext';
import { FaHome, FaTimesCircle } from 'react-icons/fa';

const EditRentalPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { lang } = useLang();
    const [rental, setRental] = useState<Rental | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await getRentalById(id);
                setRental(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load rental');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 animate-pulse">
                        <FaHome className="text-white text-lg" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                            {lang === 'km' ? 'កំពុងផ្ទុក...' : 'Loading rental...'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {lang === 'km' ? 'សូមរង់ចាំ' : 'Please wait a moment'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !rental) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
                    <FaTimesCircle className="text-red-400 flex-shrink-0 text-xl" />
                    <div>
                        <p className="font-semibold">
                            {lang === 'km' ? 'មិនអាចផ្ទុកការជួល' : 'Could not load rental'}
                        </p>
                        <p className="text-xs text-red-400 mt-0.5">{error ?? 'Rental not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <RentalEditForm rental={rental} id={id} />
        </div>
    );
};

export default EditRentalPage;
