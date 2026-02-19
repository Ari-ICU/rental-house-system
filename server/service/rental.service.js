const Rental = require('../models/rental');

const getAllRentals = async () => {
    return await Rental.findAll();
};

const getRentalById = async (id) => {
    const rental = await Rental.findById(id);
    if (!rental) {
        throw new Error('Rental not found');
    }
    return rental;
};

const createRental = async (rentalData) => {
    return await Rental.create(rentalData);
};

const updateRental = async (id, rentalData) => {
    try {
        const rental = await Rental.update(id, rentalData);
        if (rental === null) {
            throw new Error('No valid fields to update');
        }
        return rental;
    } catch (error) {
        // Prisma error code for Record to update not found
        if (error.code === 'P2025') {
            throw new Error('Rental not found');
        }
        throw error;
    }
};

const deleteRental = async (id) => {
    const deleted = await Rental.delete(id);
    if (!deleted) {
        throw new Error('Rental not found');
    }
    return deleted;
};

module.exports = {
    getAllRentals,
    getRentalById,
    createRental,
    updateRental,
    deleteRental
};
