'use client';

import React, { useState } from 'react';
import { Rental } from '@/types/rents';
import { useLang } from '@/context/LangContext';
import RentalForm from '@/components/rentals/RentalForm';

const CreateRentalPage: React.FC = () => {
    const { lang } = useLang();
    const [rentals] = useState<Rental[]>([]);


    return (
        <div className="min-h-screen py-10 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {rentals.length > 0 ? (
                    <RentalForm />
                ) : (
                    <p className="text-center text-gray-500">
                        {lang === 'km' ? 'កំពុងផ្ទុកការជួល...' : 'Loading rentals...'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CreateRentalPage;
