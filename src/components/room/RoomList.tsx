"use client";

import React from "react";

interface Room {
    id: number;
    name: string;
    type: string;
    status: "Available" | "Booked" | "Maintenance";
    price: number;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

interface RoomListProps {
    rooms: Room[];
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

const statusColors: { [key in Room["status"]]: string } = {
    Available: "bg-green-100 text-green-800",
    Booked: "bg-yellow-100 text-yellow-800",
    Maintenance: "bg-red-100 text-red-800",
};

const RoomList: React.FC<RoomListProps> = ({ rooms, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
                <thead className="bg-gray-200">
                    <tr className="*:font-bold">
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">Name</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">Type</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">Status</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">Price</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => (
                        <tr key={room.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">{room.name}</td>
                            <td className="py-3 px-4">{room.type}</td>
                            <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[room.status]}`}>
                                    {room.status}
                                </span>
                            </td>
                            <td className="py-3 px-4">${room.price}</td>
                            <td className="py-3 px-4 flex gap-2">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(room.id)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                    >
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(room.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomList;
