import Rental from '../models/rental';

const autoManageStatus = (rentalData: any) => {
    if (rentalData.endDate && ['Active', 'Reserved'].includes(rentalData.status)) {
        const endDate = new Date(rentalData.endDate);
        if (!isNaN(endDate.getTime())) {
            endDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (endDate < today) {
                rentalData.status = 'Completed';
            }
        }
    }
    return rentalData;
};

export const getAllRentals = async (options: any = {}) => {
    return await Rental.findAll(options);
};

export const getRentalById = async (id: number | string) => {
    const rental = await Rental.findById(id);
    if (!rental) {
        throw new Error('Rental not found');
    }
    return rental;
};

export const createRental = async (rentalData: any) => {
    const processedData = autoManageStatus({ ...rentalData });
    return await Rental.create(processedData);
};

export const updateRental = async (id: number | string, rentalData: any) => {
    try {
        const processedData = autoManageStatus({ ...rentalData });
        const rental = await Rental.update(id, processedData);
        if (rental === null) {
            throw new Error('No valid fields to update');
        }
        return rental;
    } catch (error: any) {
        // Prisma error code for Record to update not found
        if (error.code === 'P2025') {
            throw new Error('Rental not found');
        }
        throw error;
    }
};

export const deleteRental = async (id: number | string) => {
    const deleted = await Rental.delete(id);
    if (!deleted) {
        throw new Error('Rental not found');
    }
    return deleted;
};
