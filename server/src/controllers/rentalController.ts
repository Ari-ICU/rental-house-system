import { Request, Response } from 'express';
import * as rentalService from '../service/rental.service';
import {
    successResponse,
    createdResponse,
    paginatedResponse
} from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

// ─── GET /api/rentals ───────────────────────────────────────────────────────
export const getRentals = asyncHandler(async (req: Request, res: Response) => {
    const { search, skip, take } = req.query;
    const { data, total } = await rentalService.getAllRentals({ 
        search: search as string, 
        skip: skip as string, 
        take: take as string 
    });

    const parsedSkip = skip ? parseInt(skip as string) : 0;
    const parsedTake = take ? parseInt(take as string) : 10;

    return paginatedResponse(res, data, {
        total,
        page: skip ? Math.floor(parsedSkip / parsedTake) + 1 : 1,
        limit: parsedTake
    }, 'Rentals fetched successfully');
});

// ─── GET /api/rentals/:id ───────────────────────────────────────────────────
export const getRentalById = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalService.getRentalById(req.params.id as string);
    return successResponse(res, rental, 'Rental retrieved successfully');
});

// ─── POST /api/rentals ──────────────────────────────────────────────────────
export const createRental = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalService.createRental(req.body);
    return createdResponse(res, rental, 'Rental agreement created');
});

// ─── PUT /api/rentals/:id ───────────────────────────────────────────────────
export const updateRental = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updatedRental = await rentalService.updateRental(id, req.body);
    return successResponse(res, updatedRental, 'Rental information updated');
});

// ─── DELETE /api/rentals/:id ────────────────────────────────────────────────
export const deleteRental = asyncHandler(async (req: Request, res: Response) => {
    await rentalService.deleteRental(req.params.id as string);
    return successResponse(res, null, 'Rental record deleted');
});

// ─── GET /api/rentals/export ─────────────────────────────────────────────────
export const exportRentals = asyncHandler(async (req: Request, res: Response) => {
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
