'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BillForm from '@/components/bills/BillForm';
import { Bill } from '@/types/bill';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import { getBillById } from '@/services/billService';
import { getAllRentals } from '@/services/rentalService';
import { toast } from 'react-hot-toast';

const EditBillPage: React.FC = () => {
    const { id } = useParams();
    const { lang } = useLang();
    const [bill, setBill] = useState<Bill | null>(null);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch both concurrently
                const [billData, rentalsData] = await Promise.all([
                    getBillById(id as string),
                    getAllRentals()
                ]);
                setBill(billData);
                setRentals(rentalsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error(lang === 'en' ? 'Failed to load bill data' : 'មិនអាចផ្ទុកទិន្នន័យបានទេ');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, lang]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="min-h-screen flex justify-center items-center py-20">
                <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-sm">
                    <p className="text-gray-500 font-medium">
                        {lang === 'km' ? 'រកមិនឃើញវិក្កយបត្រទេ' : 'Bill not found'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <BillForm rentals={rentals} bill={bill} />
            </div>
        </div>
    );
};

export default EditBillPage;
