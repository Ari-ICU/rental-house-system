const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    errorResponse
} = require('../utils/apiResponse');

const getAllCameras = asyncHandler(async (req, res) => {
    try {
        const cameras = await prisma.camera.findMany({
            orderBy: { id: 'asc' }
        });
        return successResponse(res, cameras, 'Cameras retrieved successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to retrieve cameras', error);
    }
});

const getCameraById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
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

const createCamera = asyncHandler(async (req, res) => {
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

const updateCamera = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
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
    } catch (error) {
        if (error.code === 'P2025') {
            return notFoundResponse(res, 'Camera not found');
        }
        return errorResponse(res, 'Failed to update camera', error);
    }
});

const deleteCamera = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.camera.delete({
            where: { id: parseInt(id) }
        });
        return successResponse(res, null, 'Camera deleted successfully');
    } catch (error) {
        if (error.code === 'P2025') {
            return notFoundResponse(res, 'Camera not found');
        }
        return errorResponse(res, 'Failed to delete camera', error);
    }
});

module.exports = {
    getAllCameras,
    getCameraById,
    createCamera,
    updateCamera,
    deleteCamera
};
