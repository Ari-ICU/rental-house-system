"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRental = exports.updateRental = exports.createRental = exports.getRentalById = exports.getAllRentals = void 0;
const rental_1 = __importDefault(require("../models/rental"));
const autoManageStatus = (rentalData) => {
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
const getAllRentals = async (options = {}) => {
    return await rental_1.default.findAll(options);
};
exports.getAllRentals = getAllRentals;
const getRentalById = async (id) => {
    const rental = await rental_1.default.findById(id);
    if (!rental) {
        throw new Error('Rental not found');
    }
    return rental;
};
exports.getRentalById = getRentalById;
const createRental = async (rentalData) => {
    const processedData = autoManageStatus({ ...rentalData });
    return await rental_1.default.create(processedData);
};
exports.createRental = createRental;
const updateRental = async (id, rentalData) => {
    try {
        const processedData = autoManageStatus({ ...rentalData });
        const rental = await rental_1.default.update(id, processedData);
        if (rental === null) {
            throw new Error('No valid fields to update');
        }
        return rental;
    }
    catch (error) {
        // Prisma error code for Record to update not found
        if (error.code === 'P2025') {
            throw new Error('Rental not found');
        }
        throw error;
    }
};
exports.updateRental = updateRental;
const deleteRental = async (id) => {
    const deleted = await rental_1.default.delete(id);
    if (!deleted) {
        throw new Error('Rental not found');
    }
    return deleted;
};
exports.deleteRental = deleteRental;
