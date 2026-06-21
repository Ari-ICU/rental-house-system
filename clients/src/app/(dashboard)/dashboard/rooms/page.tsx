"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllRentals, updateRental, createRental } from "@/services/rentalService";
import { Rental, RentalStatus } from "@/types/rents";
import { FaBuilding, FaThLarge, FaInbox, FaColumns, FaList, FaUser } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import TableSkeleton from "@/components/common/TableSkeleton";

interface RoomInstance {
    roomNumber: string;
    status: "Vacant" | "Occupied" | "Reserved" | "Maintenance";
    clientName: string;
    rentalId: number | null;
    rentAmount: number;
    notes: string;
    startDate?: string;
    clientPhone?: string;
}

interface FloorGroup {
    floorName: string;
    rooms: RoomInstance[];
}

export default function RoomsPage() {
    const { lang } = useLang();
    const router = useRouter();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"visual" | "kanban" | "table">("visual");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // Fetch rentals from backend
    const fetchRoomsData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllRentals();
            setRentals(data || []);
        } catch (error) {
            console.error("Failed to fetch room rentals:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoomsData();
    }, [fetchRoomsData]);

    // Predefined baseline rooms (15 rooms across 3 floors)
    const baseRoomNumbers = [
        "101", "102", "103", "104", "105",
        "201", "202", "203", "204", "205",
        "301", "302", "303", "304", "305"
    ];

    // Combine predefined rooms and rooms from rentals dynamically
    const buildRoomsList = (): RoomInstance[] => {
        const roomsMap = new Map<string, RoomInstance>();

        // 1. Initialize with predefined rooms (Vacant)
        baseRoomNumbers.forEach(roomNo => {
            roomsMap.set(roomNo, {
                roomNumber: roomNo,
                status: "Vacant",
                clientName: "",
                rentalId: null,
                rentAmount: 100, // Default price
                notes: "Standard Single",
            });
        });

        // 2. Scan database rentals to overlay statuses
        // We sort by id ascending so the latest status overlays
        const sortedRentals = [...rentals].sort((a, b) => a.id - b.id);
        sortedRentals.forEach(r => {
            const roomNo = r.roomNumber;
            // Only capture active, reserved, or maintenance statuses
            if (r.status === "Active" || r.status === "Reserved" || r.status === "Maintenance") {
                roomsMap.set(roomNo, {
                    roomNumber: roomNo,
                    status: r.status === "Active" ? "Occupied" : (r.status as "Reserved" | "Maintenance"),
                    clientName: r.ClientName,
                    rentalId: r.id,
                    rentAmount: r.rentAmount,
                    notes: r.notes || "Standard Unit",
                    startDate: r.startDate,
                    clientPhone: r.clientPhone,
                });
            }
        });

        return Array.from(roomsMap.values());
    };

    const allRooms = buildRoomsList();

    // Group rooms by Floor
    const getFloors = (): FloorGroup[] => {
        const floorsMap = new Map<string, RoomInstance[]>();

        allRooms.forEach(room => {
            let floorKey = "Other Floor";
            const firstDigit = room.roomNumber.trim().charAt(0);
            
            if (firstDigit === "1") floorKey = lang === "en" ? "Floor 1" : "ជាន់ទី ១";
            else if (firstDigit === "2") floorKey = lang === "en" ? "Floor 2" : "ជាន់ទី ២";
            else if (firstDigit === "3") floorKey = lang === "en" ? "Floor 3" : "ជាន់ទី ៣";
            else if (!isNaN(Number(firstDigit))) floorKey = lang === "en" ? `Floor ${firstDigit}` : `ជាន់ទី ${firstDigit}`;

            if (!floorsMap.has(floorKey)) {
                floorsMap.set(floorKey, []);
            }
            floorsMap.get(floorKey)!.push(room);
        });

        // Sort rooms within floor by room number alphabetically/numerically
        const floorsList: FloorGroup[] = [];
        floorsMap.forEach((rooms, floorName) => {
            rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
            floorsList.push({ floorName, rooms });
        });

        // Sort floors (e.g. Floor 1 first, etc.)
        floorsList.sort((a, b) => a.floorName.localeCompare(b.floorName));
        return floorsList;
    };

    const floors = getFloors();

    // Move room/rental to another status in Kanban
    const handleMoveStatus = async (room: RoomInstance, targetStatus: RentalStatus) => {
        try {
            setLoading(true);
            if (room.rentalId) {
                // If moving to vacant, we mark the rental as Completed and record endDate
                if (targetStatus === "Completed") {
                    await updateRental(room.rentalId, {
                        status: "Completed",
                        endDate: new Date().toISOString().split("T")[0]
                    });
                } else {
                    await updateRental(room.rentalId, { status: targetStatus });
                }
            } else {
                // If it was vacant and moving to occupied/reserved/maintenance
                if (targetStatus === "Maintenance") {
                    // Create a placeholder maintenance rental
                    await createRental({
                        ClientName: "Maintenance Placeholder",
                        roomNumber: room.roomNumber,
                        status: "Maintenance",
                        rentAmount: 0,
                        startDate: new Date().toISOString().split("T")[0],
                    });
                } else {
                    // Redirect to create rental form with parameters
                    router.push(`/dashboard/rentals/create?roomNumber=${room.roomNumber}&status=${targetStatus}`);
                    return;
                }
            }
            await fetchRoomsData();
        } catch (error) {
            console.error("Failed to move status:", error);
            alert("Failed to update status.");
        } finally {
            setLoading(false);
        }
    };

    // Filters for room instances
    const filteredRooms = allRooms.filter(room => {
        const query = search.toLowerCase().trim();
        const matchesSearch = room.roomNumber.toLowerCase().includes(query) ||
            room.clientName.toLowerCase().includes(query) ||
            room.notes.toLowerCase().includes(query);
        
        const matchesStatus = statusFilter === "All" || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Translation Labels
    const t = {
        en: {
            title: "Properties & Rooms Visual Board",
            visualTab: "Floor Layout",
            kanbanTab: "Status Kanban",
            tableTab: "List View",
            searchPlaceholder: "Search room, occupant...",
            vacant: "Vacant",
            occupied: "Occupied",
            reserved: "Reserved",
            maintenance: "Maintenance",
            rentRoom: "Rent Room",
            viewRental: "View Tenant",
            makeMaintenance: "Maintenance",
            release: "Complete Lease",
            makeReserved: "Reserve",
            statusLabel: "Status Filter",
        },
        km: {
            title: "ផ្ទាំងគ្រប់គ្រងបន្ទប់ និងស្ថានភាព",
            visualTab: "ប្លង់តាមជាន់",
            kanbanTab: "ផ្ទាំងកាងបាង (Kanban)",
            tableTab: "បញ្ជីលម្អិត",
            searchPlaceholder: "ស្វែងរកលេខបន្ទប់, ឈ្មោះអ្នកស្នាក់នៅ...",
            vacant: "បន្ទប់ទំនេរ",
            occupied: "កំពុងស្នាក់នៅ",
            reserved: "បានកក់ទុក",
            maintenance: "កំពុងជួសជុល",
            rentRoom: "ជួលបន្ទប់",
            viewRental: "មើលអ្នកជួល",
            makeMaintenance: "ជួសជុល",
            release: "បញ្ចប់ការជួល",
            makeReserved: "កក់ទុក",
            statusLabel: "តម្រងស្ថានភាព",
        }
    };

    const activeLang = lang === "km" ? "km" : "en";

    const getStatusStyle = (status: RoomInstance["status"]) => {
        switch (status) {
            case "Occupied":
                return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-250 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400";
            case "Reserved":
                return "bg-blue-50 dark:bg-blue-500/10 border-blue-250 dark:border-blue-800 text-blue-800 dark:text-blue-400";
            case "Maintenance":
                return "bg-rose-50 dark:bg-rose-500/10 border-rose-250 dark:border-rose-800 text-rose-800 dark:text-rose-400";
            default:
                return "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400";
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                        {t[activeLang].title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        {lang === "en" ? "Manage and view occupancy visually across floor grids and Kanban boards." : "គ្រប់គ្រង និងមើលស្ថានភាពបន្ទប់តាមប្លង់ជាន់ និងផ្ទាំងកាងបាង។"}
                    </p>
                </div>

                {/* View switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("visual")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === "visual"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                        }`}
                    >
                        <FaThLarge /> {t[activeLang].visualTab}
                    </button>
                    <button
                        onClick={() => setActiveTab("kanban")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === "kanban"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                        }`}
                    >
                        <FaColumns /> {t[activeLang].kanbanTab}
                    </button>
                    <button
                        onClick={() => setActiveTab("table")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === "table"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                        }`}
                    >
                        <FaList /> {t[activeLang].tableTab}
                    </button>
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <input
                    type="text"
                    placeholder={t[activeLang].searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-xs px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-lg outline-none bg-slate-50/50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {t[activeLang].statusLabel}:
                    </span>
                    <div className="flex gap-1.5">
                        {["All", "Vacant", "Occupied", "Reserved", "Maintenance"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                    statusFilter === status
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                            >
                                {status === "All" ? (lang === "en" ? "All" : "ទាំងអស់") : t[activeLang][status.toLowerCase() as keyof typeof t["en"]]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content views */}
            {loading ? (
                <TableSkeleton rows={8} cols={4} />
            ) : (
                <>
                    {/* VIEW 1: VISUAL FLOOR GRID */}
                    {activeTab === "visual" && (
                        <div className="space-y-8">
                            {floors.map((floor) => {
                                // Filter rooms in floor based on text search & status selectors
                                const roomsInFloor = floor.rooms.filter(room => {
                                    const query = search.toLowerCase().trim();
                                    const matchesSearch = room.roomNumber.toLowerCase().includes(query) ||
                                        room.clientName.toLowerCase().includes(query);
                                    const matchesStatus = statusFilter === "All" || room.status === statusFilter;
                                    return matchesSearch && matchesStatus;
                                });

                                if (roomsInFloor.length === 0) return null;

                                return (
                                    <div key={floor.floorName} className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                                            <FaBuilding className="text-slate-400 dark:text-slate-500 text-sm" />
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                                                {floor.floorName}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 rounded px-1.5 py-0.5">
                                                {roomsInFloor.length} {lang === "en" ? "rooms" : "បន្ទប់"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {roomsInFloor.map((room) => (
                                                <div
                                                    key={room.roomNumber}
                                                    className={`border rounded-xl p-4 flex flex-col justify-between h-36 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${getStatusStyle(room.status)}`}
                                                    onClick={() => {
                                                        if (room.rentalId) {
                                                            router.push(`/dashboard/rentals/${room.rentalId}`);
                                                        } else {
                                                            router.push(`/dashboard/rentals/create?roomNumber=${room.roomNumber}`);
                                                        }
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-lg font-bold tracking-tight">{room.roomNumber}</span>
                                                        <span className="w-2.5 h-2.5 rounded-full bg-current shrink-0 mt-1" />
                                                    </div>

                                                    {/* Room occupant/type */}
                                                    <div className="my-2 min-w-0">
                                                        {room.clientName ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                                <FaUser className="text-[10px] shrink-0 text-slate-400" />
                                                                <p className="truncate">{room.clientName}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] italic opacity-60">
                                                                {lang === "en" ? "Vacant Room" : "បន្ទប់ទំនេរ"}
                                                            </p>
                                                        )}
                                                        <p className="text-[9px] opacity-70 truncate mt-1">{room.notes}</p>
                                                    </div>

                                                    {/* Footer price & action links */}
                                                    <div className="flex justify-between items-end border-t border-current/10 pt-2 text-[10px] font-bold">
                                                        <span>${room.rentAmount}/mo</span>
                                                        <span className="underline decoration-dotted">
                                                            {room.rentalId ? t[activeLang].viewRental : t[activeLang].rentRoom} &rarr;
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* VIEW 2: STATUS KANBAN BOARD */}
                    {activeTab === "kanban" && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[560px] overflow-hidden">
                            {(["Vacant", "Occupied", "Reserved", "Maintenance"] as const).map((status) => {
                                const roomsInCol = allRooms.filter(r => r.status === status && (
                                    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
                                    r.clientName.toLowerCase().includes(search.toLowerCase())
                                ));
                                
                                const colColors = {
                                    Vacant: "border-t-slate-400 bg-slate-50/50 dark:bg-slate-900/50",
                                    Occupied: "border-t-emerald-500 bg-emerald-50/5 dark:bg-emerald-500/5",
                                    Reserved: "border-t-blue-500 bg-blue-50/5 dark:bg-blue-500/5",
                                    Maintenance: "border-t-rose-500 bg-rose-50/5 dark:bg-rose-500/5",
                                };

                                const badgeColors = {
                                    Vacant: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
                                    Occupied: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",
                                    Reserved: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
                                    Maintenance: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-450",
                                };

                                return (
                                    <div key={status} className={`border border-slate-200 dark:border-slate-800 border-t-4 rounded-xl ${colColors[status]} flex flex-col h-full overflow-hidden shadow-sm`}>
                                        {/* Column Header */}
                                        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                                {t[activeLang][status.toLowerCase() as keyof typeof t["en"]]}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColors[status]}`}>
                                                {roomsInCol.length}
                                            </span>
                                        </div>

                                        {/* Column Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                            {roomsInCol.map((room) => (
                                                <div
                                                    key={room.roomNumber}
                                                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700 rounded-xl p-3.5 shadow-sm space-y-3 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Room {room.roomNumber}</span>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">${room.rentAmount}</span>
                                                    </div>

                                                    {room.clientName && (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                                                <FaUser className="text-[9px] text-slate-400" />
                                                                <p className="truncate">{room.clientName}</p>
                                                            </div>
                                                            {room.startDate && (
                                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">
                                                                    Since: {room.startDate}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Kanban state transitions controller */}
                                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-900 text-[9px] font-bold">
                                                        {status === "Vacant" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Active")}
                                                                    className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 rounded"
                                                                >
                                                                    {t[activeLang].rentRoom}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Reserved")}
                                                                    className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 rounded"
                                                                >
                                                                    {t[activeLang].makeReserved}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Maintenance")}
                                                                    className="px-2 py-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 rounded"
                                                                >
                                                                    {t[activeLang].makeMaintenance}
                                                                </button>
                                                            </>
                                                        )}
                                                        {status === "Occupied" && (
                                                            <>
                                                                <button
                                                                    onClick={() => router.push(`/dashboard/rentals/${room.rentalId}`)}
                                                                    className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 rounded"
                                                                >
                                                                    {t[activeLang].viewRental}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Completed")}
                                                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded"
                                                                >
                                                                    {t[activeLang].release}
                                                                </button>
                                                            </>
                                                        )}
                                                        {status === "Reserved" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Active")}
                                                                    className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 rounded animate-pulse"
                                                                >
                                                                    Check In
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Completed")}
                                                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded"
                                                                >
                                                                    {t[activeLang].release}
                                                                </button>
                                                            </>
                                                        )}
                                                        {status === "Maintenance" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMoveStatus(room, "Completed")}
                                                                    className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 rounded"
                                                                >
                                                                    Complete Repair
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* VIEW 3: TABLE LIST VIEW */}
                    {activeTab === "table" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Room</th>
                                            <th className="px-6 py-3.5">Occupant</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Rent Amount</th>
                                            <th className="px-6 py-3.5">Start Date</th>
                                            <th className="px-6 py-3.5">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                                        {filteredRooms.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-20 text-slate-400 dark:text-slate-600">
                                                    <FaInbox className="text-3xl opacity-20 mx-auto mb-2" />
                                                    <p className="font-semibold">{lang === "en" ? "No rooms match search criteria" : "រកមិនឃើញបន្ទប់ស្របតាមតម្រងឡើយ"}</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRooms.map((room) => (
                                                <tr
                                                    key={room.roomNumber}
                                                    onClick={() => {
                                                        if (room.rentalId) {
                                                            router.push(`/dashboard/rentals/${room.rentalId}`);
                                                        } else {
                                                            router.push(`/dashboard/rentals/create?roomNumber=${room.roomNumber}`);
                                                        }
                                                    }}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">Room {room.roomNumber}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-350">{room.clientName || "—"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold leading-tight ${
                                                            room.status === "Occupied"
                                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                                : room.status === "Reserved"
                                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                                : room.status === "Maintenance"
                                                                ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-450"
                                                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                                        }`}>
                                                            {t[activeLang][room.status.toLowerCase() as keyof typeof t["en"]]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-50">${room.rentAmount}</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{room.startDate || "—"}</td>
                                                    <td className="px-6 py-4 text-slate-550 dark:text-slate-400 truncate max-w-xs">{room.notes}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
