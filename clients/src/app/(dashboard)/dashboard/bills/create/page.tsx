'use client';

import React, { useState, useEffect } from 'react';
import BillForm from '@/components/bills/BillForm';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import { getAllRentals } from '@/services/rentalService';

const CreateBillPage: React.FC = () => {
    const { lang } = useLang();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRentals = async () => {
            setIsLoading(true);
            try {
                const data = await getAllRentals();
                console.log("Fetched rentals:", data);
                setRentals(data);
            } catch (error) {
                console.error('Failed to fetch rentals:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRentals();
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 dark:border-violet-400"></div>
                    </div>
                ) : rentals.length > 0 ? (
                    <BillForm rentals={rentals} />
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                            {lang === 'km' ? 'មិនមានទិន្នន័យការជួលទេ' : 'No rental data found'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateBillPage;
