"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCamera = exports.updateCamera = exports.createCamera = exports.getCameraById = exports.getAllCameras = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiResponse_1 = require("../utils/apiResponse");
exports.getAllCameras = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const cameras = await prisma_1.default.camera.findMany({
            orderBy: { id: 'asc' }
        });
        return (0, apiResponse_1.successResponse)(res, cameras, 'Cameras retrieved successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to retrieve cameras', error);
    }
});
exports.getCameraById = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const id = req.params.id;
        const camera = await prisma_1.default.camera.findUnique({
            where: { id: parseInt(id) }
        });
        if (!camera) {
            return (0, apiResponse_1.notFoundResponse)(res, 'Camera not found');
        }
        return (0, apiResponse_1.successResponse)(res, camera, 'Camera retrieved successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to retrieve camera', error);
    }
});
exports.createCamera = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { name, floor, streamUrl, deviceId, isActive } = req.body;
        const camera = await prisma_1.default.camera.create({
            data: {
                name,
                floor,
                streamUrl,
                deviceId,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        return (0, apiResponse_1.createdResponse)(res, camera, 'Camera created successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to create camera', error);
    }
});
exports.updateCamera = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const id = req.params.id;
        const { name, floor, streamUrl, deviceId, isActive } = req.body;
        const camera = await prisma_1.default.camera.update({
            where: { id: parseInt(id) },
            data: {
                name,
                floor,
                streamUrl,
                deviceId,
                isActive
            }
        });
        return (0, apiResponse_1.successResponse)(res, camera, 'Camera updated successfully');
    }
    catch (error) {
        if (error.code === 'P2025') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Camera not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to update camera', error);
    }
});
exports.deleteCamera = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.camera.delete({
            where: { id: parseInt(id) }
        });
        return (0, apiResponse_1.successResponse)(res, null, 'Camera deleted successfully');
    }
    catch (error) {
        if (error.code === 'P2025') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Camera not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to delete camera', error);
    }
});
