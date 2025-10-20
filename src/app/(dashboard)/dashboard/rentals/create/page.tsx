// app/rentals/create/page.tsx
'use client';

import RentalForm from '@/components/rentals/RentalForm';

const CreateRentalPage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <div className=" mx-auto ">
                <RentalForm />
            </div>
        </div>
    );
};

export default CreateRentalPage;
