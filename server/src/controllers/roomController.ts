import { Request, Response } from 'express';
import Room from '../models/room';
import { successResponse, errorResponse, notFoundResponse, conflictResponse } from '../utils/apiResponse';

export const getRooms = async (req: Request, res: Response): Promise<any> => {
    try {
        const rooms = await Room.getAll();
        return successResponse(res, rooms, 'Rooms fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch rooms', error);
    }
};

export const getRoomById = async (req: Request, res: Response): Promise<any> => {
    try {
        const room = await Room.findById(Number(req.params.id));
        if (!room) {
            return notFoundResponse(res, 'Room not found');
        }
        return successResponse(res, room, 'Room fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch room', error);
    }
};

export const createRoom = async (req: Request, res: Response): Promise<any> => {
    try {
        const { roomNumber, rentAmount, notes } = req.body;

        // Check if room number already exists
        const existing = await Room.findByRoomNumber(roomNumber);
        if (existing) {
            return conflictResponse(res, `Room ${roomNumber} already exists`);
        }

        const room = await Room.create({
            roomNumber,
            rentAmount: Number(rentAmount),
            notes
        });

        return successResponse(res, room, 'Room created successfully', 201);
    } catch (error) {
        return errorResponse(res, 'Failed to create room', error);
    }
};

export const updateRoom = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = Number(req.params.id);
        const { roomNumber, rentAmount, notes } = req.body;

        // Check if room exists
        const room = await Room.findById(id);
        if (!room) {
            return notFoundResponse(res, 'Room not found');
        }

        // Check if new room number already exists under a different ID
        if (roomNumber && roomNumber !== room.roomNumber) {
            const existing = await Room.findByRoomNumber(roomNumber);
            if (existing && existing.id !== id) {
                return conflictResponse(res, `Room ${roomNumber} already exists`);
            }
        }

        const updatedRoom = await Room.update(id, {
            roomNumber,
            rentAmount: rentAmount !== undefined ? Number(rentAmount) : undefined,
            notes
        });

        return successResponse(res, updatedRoom, 'Room updated successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to update room', error);
    }
};

export const deleteRoom = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = Number(req.params.id);

        const room = await Room.findById(id);
        if (!room) {
            return notFoundResponse(res, 'Room not found');
        }

        await Room.delete(id);
        return successResponse(res, null, 'Room deleted successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to delete room', error);
    }
};
