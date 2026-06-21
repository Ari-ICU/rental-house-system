// app/rentals/create/page.tsx
'use client';

import { Suspense } from 'react';
import RentalForm from '@/components/rentals/RentalForm';

const CreateRentalPage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <div className=" mx-auto ">
                <Suspense fallback={
                    <div className="min-h-[40vh] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                }>
                    <RentalForm />
                </Suspense>
            </div>
        </div>
    );
};

export default CreateRentalPage;
