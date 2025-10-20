// app/rentals/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import BillForm from '@/components/bills/BillForm';
import { Rental } from '@/types/rents';
import { allRentals } from '@/data/rents';
import { useLang } from '@/context/LangContext';

const CreateBillPage: React.FC = () => {
    const { lang } = useLang();
    const [rentals, setRentals] = useState<Rental[]>([]);

    // Load rentals from static data
    useEffect(() => {
        setRentals(allRentals);
    }, []);

    return (
        <div className="min-h-screen ">
            <div className="max-w-6xl mx-auto">
                {rentals.length > 0 ? (
                    <BillForm rentals={rentals} />
                ) : (
                    <p className="text-center text-gray-500">
                        {lang === 'km' ? 'កំពុងផ្ទុកការជួល...' : 'Loading rentals...'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CreateBillPage;
