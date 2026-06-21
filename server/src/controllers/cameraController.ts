import { Request, Response } from 'express';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import {
    successResponse,
    createdResponse,
    notFoundResponse,
    errorResponse
} from '../utils/apiResponse';

export const getAllCameras = asyncHandler(async (req: Request, res: Response) => {
    try {
        const cameras = await prisma.camera.findMany({
            orderBy: { id: 'asc' }
        });
        return successResponse(res, cameras, 'Cameras retrieved successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to retrieve cameras', error);
    }
});

export const getCameraById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const camera = await prisma.camera.findUnique({
            where: { id: parseInt(id) }
        });
        if (!camera) {
            return notFoundResponse(res, 'Camera not found');
        }
        return successResponse(res, camera, 'Camera retrieved successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to retrieve camera', error);
    }
});

export const createCamera = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { name, floor, streamUrl, deviceId, isActive } = req.body;
        const camera = await prisma.camera.create({
            data: {
                name,
                floor,
                streamUrl,
                deviceId,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        return createdResponse(res, camera, 'Camera created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create camera', error);
    }
});

export const updateCamera = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, floor, streamUrl, deviceId, isActive } = req.body;

        const camera = await prisma.camera.update({
            where: { id: parseInt(id) },
            data: {
                name,
                floor,
                streamUrl,
                deviceId,
                isActive
            }
        });
        return successResponse(res, camera, 'Camera updated successfully');
    } catch (error: any) {
        if (error.code === 'P2025') {
            return notFoundResponse(res, 'Camera not found');
        }
        return errorResponse(res, 'Failed to update camera', error);
    }
});

export const deleteCamera = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.camera.delete({
            where: { id: parseInt(id) }
        });
        return successResponse(res, null, 'Camera deleted successfully');
    } catch (error: any) {
        if (error.code === 'P2025') {
            return notFoundResponse(res, 'Camera not found');
        }
        return errorResponse(res, 'Failed to delete camera', error);
    }
});
