const rentalService = require('../service/rental.service');
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
    paginatedResponse
} = require('../utils/apiResponse');

const asyncHandler = require('../utils/asyncHandler');

// ─── GET /api/rentals ───────────────────────────────────────────────────────
const getRentals = asyncHandler(async (req, res) => {
    const { search, skip, take } = req.query;
    const { data, total } = await rentalService.getAllRentals({ search, skip, take });

    return paginatedResponse(res, data, {
        total,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        limit: take ? parseInt(take) : 10
    }, 'Rentals fetched successfully');
});

// ─── GET /api/rentals/:id ───────────────────────────────────────────────────
const getRentalById = asyncHandler(async (req, res) => {
    const rental = await rentalService.getRentalById(req.params.id);
    return successResponse(res, rental, 'Rental retrieved successfully');
});

// ─── POST /api/rentals ──────────────────────────────────────────────────────
const createRental = asyncHandler(async (req, res) => {
    const rental = await rentalService.createRental(req.body);
    return createdResponse(res, rental, 'Rental agreement created');
});

// ─── PUT /api/rentals/:id ───────────────────────────────────────────────────
const updateRental = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedRental = await rentalService.updateRental(id, req.body);
    return successResponse(res, updatedRental, 'Rental information updated');
});

// ─── DELETE /api/rentals/:id ────────────────────────────────────────────────
const deleteRental = asyncHandler(async (req, res) => {
    await rentalService.deleteRental(req.params.id);
    return successResponse(res, null, 'Rental record deleted');
});

// ─── GET /api/rentals/export ─────────────────────────────────────────────────
const exportRentals = asyncHandler(async (req, res) => {
    const { data } = await rentalService.getAllRentals();
    const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        rentals: data,
    };

    const fileName = `rental_backup_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(JSON.stringify(backupData, null, 2));
});

module.exports = {
    getRentals,
    getRentalById,
    createRental,
    updateRental,
    deleteRental,
    exportRentals,
};
