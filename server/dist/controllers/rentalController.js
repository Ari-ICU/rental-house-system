"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRentals = exports.deleteRental = exports.updateRental = exports.createRental = exports.getRentalById = exports.getRentals = void 0;
const rentalService = __importStar(require("../service/rental.service"));
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// ─── GET /api/rentals ───────────────────────────────────────────────────────
exports.getRentals = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, skip, take } = req.query;
    const { data, total } = await rentalService.getAllRentals({
        search: search,
        skip: skip,
        take: take
    });
    const parsedSkip = skip ? parseInt(skip) : 0;
    const parsedTake = take ? parseInt(take) : 10;
    return (0, apiResponse_1.paginatedResponse)(res, data, {
        total,
        page: skip ? Math.floor(parsedSkip / parsedTake) + 1 : 1,
        limit: parsedTake
    }, 'Rentals fetched successfully');
});
// ─── GET /api/rentals/:id ───────────────────────────────────────────────────
exports.getRentalById = (0, asyncHandler_1.default)(async (req, res) => {
    const rental = await rentalService.getRentalById(req.params.id);
    return (0, apiResponse_1.successResponse)(res, rental, 'Rental retrieved successfully');
});
// ─── POST /api/rentals ──────────────────────────────────────────────────────
exports.createRental = (0, asyncHandler_1.default)(async (req, res) => {
    const rental = await rentalService.createRental(req.body);
    return (0, apiResponse_1.createdResponse)(res, rental, 'Rental agreement created');
});
// ─── PUT /api/rentals/:id ───────────────────────────────────────────────────
exports.updateRental = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const updatedRental = await rentalService.updateRental(id, req.body);
    return (0, apiResponse_1.successResponse)(res, updatedRental, 'Rental information updated');
});
// ─── DELETE /api/rentals/:id ────────────────────────────────────────────────
exports.deleteRental = (0, asyncHandler_1.default)(async (req, res) => {
    await rentalService.deleteRental(req.params.id);
    return (0, apiResponse_1.successResponse)(res, null, 'Rental record deleted');
});
// ─── GET /api/rentals/export ─────────────────────────────────────────────────
exports.exportRentals = (0, asyncHandler_1.default)(async (req, res) => {
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
