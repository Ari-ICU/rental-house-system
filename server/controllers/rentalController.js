const rentalService = require('../service/rental.service');
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
} = require('../utils/apiResponse');

// ─── GET /api/rentals ───────────────────────────────────────────────────────
const getRentals = async (req, res) => {
    try {
        const rentals = await rentalService.getAllRentals();
        return successResponse(res, rentals, 'Rentals fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch rentals', error);
    }
};

// ─── GET /api/rentals/:id ───────────────────────────────────────────────────
const getRentalById = async (req, res) => {
    const { id } = req.params;
    try {
        const rental = await rentalService.getRentalById(id);
        return successResponse(res, rental, 'Rental fetched successfully');
    } catch (error) {
        if (error.message === 'Rental not found') {
            return notFoundResponse(res, 'Rental not found');
        }
        return errorResponse(res, 'Failed to fetch rental', error);
    }
};

// ─── POST /api/rentals ──────────────────────────────────────────────────────
const createRental = async (req, res) => {
    try {
        const rental = await rentalService.createRental(req.body);
        return createdResponse(res, rental, 'Rental created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create rental', error);
    }
};

// ─── PUT /api/rentals/:id ───────────────────────────────────────────────────
const updateRental = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRental = await rentalService.updateRental(id, req.body);
        return successResponse(res, updatedRental, 'Rental updated successfully');
    } catch (error) {
        if (error.message === 'No valid fields to update') {
            return validationErrorResponse(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Rental not found') {
            return notFoundResponse(res, 'Rental not found');
        }
        return errorResponse(res, 'Failed to update rental', error);
    }
};

// ─── DELETE /api/rentals/:id ────────────────────────────────────────────────
const deleteRental = async (req, res) => {
    const { id } = req.params;
    try {
        await rentalService.deleteRental(id);
        return successResponse(res, null, 'Rental deleted successfully');
    } catch (error) {
        if (error.message === 'Rental not found') {
            return notFoundResponse(res, 'Rental not found');
        }
        return errorResponse(res, 'Failed to delete rental', error);
    }
};

module.exports = {
    getRentals,
    getRentalById,
    createRental,
    updateRental,
    deleteRental,
};
