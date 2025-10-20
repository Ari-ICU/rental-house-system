'use client';
import { useParams } from 'next/navigation';
import RentalView from '@/components/rentals/RentalView';
import { Rental } from '@/types/rents';

const RentalDetailsPage = () => {
    const { id } = useParams();

    // Example fetching logic (replace with API call)
    const rental: Rental = {
        id: Number(id),
        ClientName: 'Sok Dara',
        image: '/uploads/clients/sokdara.jpg',
        roomNumber: 'A102',
        status: 'In-Active',
        rentAmount: 250,
        startDate: '2025-10-01',
        endDate: '2025-12-01',
        clientPhone: '0961234567',
        clientEmail: 'sokdara@gmail.com',
        clientAddress: 'Phnom Penh, Cambodia',
        clientImageCard: {
            front: '/uploads/id-front.jpg',
            back: '/uploads/id-back.jpg',
        },
        emergencyContactName: 'Chan Borey',
        emergencyContactPhone: '098654321',
        notes: 'Client prefers monthly payment on the 5th.',
    };

    return <RentalView rental={rental} />;
};

export default RentalDetailsPage;
