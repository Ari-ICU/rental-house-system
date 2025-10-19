"use client";

import React, { useState } from "react";
import RoomList from "@/components/room/RoomList";
import RoomsHeader from "@/components/room/RoomsHeader";

interface Room {
    id: number;
    name: string;
    type: string;
    status: "Available" | "Booked" | "Maintenance";
    price: number;
}

const RoomsPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([
        { id: 1, name: "Room 101", type: "Single", status: "Available", price: 100 },
        { id: 2, name: "Room 102", type: "Double", status: "Booked", price: 150 },
        { id: 3, name: "Room 103", type: "Suite", status: "Maintenance", price: 300 },
    ]);

    const [search, setSearch] = useState("");

    const handleAddRoom = () => console.log("Add Room clicked");
    const handleEdit = (id: number) => console.log("Edit Room", id);
    const handleDelete = (id: number) => setRooms(prev => prev.filter(room => room.id !== id));

    const filteredRooms = rooms.filter(
        room =>
            room.name.toLowerCase().includes(search.toLowerCase()) ||
            room.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="">
            <RoomsHeader onAddRoom={handleAddRoom} searchQuery={search} setSearchQuery={setSearch} />

            {filteredRooms.length > 0 ? (
                <RoomList rooms={filteredRooms} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
                <p className="text-gray-500 mt-4">No rooms found.</p>
            )}
        </div>
    );
};

export default RoomsPage;
