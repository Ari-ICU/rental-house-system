"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllRentals, updateRental, createRental } from "@/services/rentalService";
import { Rental, RentalStatus } from "@/types/rents";
import { 
    Building, 
    LayoutGrid, 
    Columns, 
    List, 
    User, 
    Trash2, 
    Edit2, 
    Plus, 
    X,
    Search
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Room } from "@/types/room";
import { getAllRooms, createRoom, updateRoom, deleteRoom } from "@/services/roomService";
import { toast } from "react-hot-toast";

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

function RoomsPageContent() {
    const { lang } = useLang();
    const router = useRouter();
    const searchParams = useSearchParams();
    const actionParam = searchParams.get("action");

    const [rentals, setRentals] = useState<Rental[]>([]);
    const [dbRooms, setDbRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"visual" | "kanban" | "table">("visual");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // Modal forms states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [actionRoom, setActionRoom] = useState<RoomInstance | null>(null);

    // Add Room Form
    const [addRoomNumber, setAddRoomNumber] = useState("");
    const [addRentAmount, setAddRentAmount] = useState("100");
    const [addNotes, setAddNotes] = useState("");

    // Edit Room Form
    const [editRoomNumber, setEditRoomNumber] = useState("");
    const [editRentAmount, setEditRentAmount] = useState("100");
    const [editNotes, setEditNotes] = useState("");

    // Handle Quick Action Trigger from query parameters
    useEffect(() => {
        if (actionParam === "create") {
            setShowAddModal(true);
        }
    }, [actionParam]);

    // Fetch rentals & rooms from backend
    const fetchRoomsData = useCallback(async () => {
        try {
            setLoading(true);
            const [rentalsData, roomsData] = await Promise.all([
                getAllRentals(),
                getAllRooms()
            ]);
            setRentals(rentalsData || []);
            setDbRooms(roomsData || []);
        } catch (error) {
            console.error("Failed to fetch rooms and rentals data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoomsData();
    }, [fetchRoomsData]);

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!addRoomNumber || !addRentAmount) {
                toast.error("Please fill in all required fields.");
                return;
            }
            await createRoom({
                roomNumber: addRoomNumber.trim(),
                rentAmount: Number(addRentAmount),
                notes: addNotes.trim() || undefined
            });
            toast.success("Room created successfully!");
            setShowAddModal(false);
            setAddRoomNumber("");
            setAddRentAmount("100");
            setAddNotes("");
            fetchRoomsData();
            // Clear parameter in route
            router.replace('/dashboard/rooms');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Failed to create room.");
        }
    };

    const handleEditRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionRoom) return;
        try {
            const dbRoom = dbRooms.find(r => r.roomNumber === actionRoom.roomNumber);
            if (!dbRoom) {
                toast.error("Room not found in database.");
                return;
            }
            await updateRoom(dbRoom.id, {
                roomNumber: editRoomNumber.trim(),
                rentAmount: Number(editRentAmount),
                notes: editNotes.trim() || undefined
            });
            toast.success("Room updated successfully!");
            setShowEditModal(false);
            setActionRoom(null);
            fetchRoomsData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Failed to update room.");
        }
    };

    const handleDeleteRoom = async () => {
        if (!actionRoom) return;
        if (!confirm(lang === "en" ? `Are you sure you want to delete Room ${actionRoom.roomNumber}?` : `តើអ្នកប្រាកដជាចង់លុបបន្ទប់ ${actionRoom.roomNumber} មែនទេ?`)) return;
        try {
            const dbRoom = dbRooms.find(r => r.roomNumber === actionRoom.roomNumber);
            if (!dbRoom) {
                toast.error("Room not found in database.");
                return;
            }
            await deleteRoom(dbRoom.id);
            toast.success("Room deleted successfully!");
            setShowActionMenu(false);
            setActionRoom(null);
            fetchRoomsData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Failed to delete room.");
        }
    };

    const buildRoomsList = (): RoomInstance[] => {
        const roomsMap = new Map<string, RoomInstance>();

        // Initialize with database rooms (Vacant)
        dbRooms.forEach(room => {
            roomsMap.set(room.roomNumber, {
                roomNumber: room.roomNumber,
                status: "Vacant",
                clientName: "",
                rentalId: null,
                rentAmount: Number(room.rentAmount),
                notes: room.notes || "Standard Single",
            });
        });

        // Scan database rentals to overlay statuses
        const sortedRentals = [...rentals].sort((a, b) => a.id - b.id);
        sortedRentals.forEach(r => {
            const roomNo = r.roomNumber;
            if ((r.status === "Active" || r.status === "Reserved" || r.status === "Maintenance") && roomsMap.has(roomNo)) {
                const currentRoom = roomsMap.get(roomNo)!;
                roomsMap.set(roomNo, {
                    ...currentRoom,
                    status: r.status === "Active" ? "Occupied" : (r.status as "Reserved" | "Maintenance"),
                    clientName: r.ClientName,
                    rentalId: r.id,
                    rentAmount: r.rentAmount,
                    notes: r.notes || currentRoom.notes,
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

        const floorsList: FloorGroup[] = [];
        floorsMap.forEach((rooms, floorName) => {
            rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
            floorsList.push({ floorName, rooms });
        });

        floorsList.sort((a, b) => a.floorName.localeCompare(b.floorName));
        return floorsList;
    };

    const floors = getFloors();

    // Move room/rental to another status in Kanban
    const handleMoveStatus = async (room: RoomInstance, targetStatus: RentalStatus) => {
        try {
            setLoading(true);
            if (room.rentalId) {
                if (targetStatus === "Completed") {
                    await updateRental(room.rentalId, {
                        status: "Completed",
                        endDate: new Date().toISOString().split("T")[0]
                    });
                } else {
                    await updateRental(room.rentalId, { status: targetStatus });
                }
            } else {
                if (targetStatus === "Maintenance") {
                    await createRental({
                        ClientName: "Maintenance Placeholder",
                        roomNumber: room.roomNumber,
                        status: "Maintenance",
                        rentAmount: 0,
                        startDate: new Date().toISOString().split("T")[0],
                    });
                } else {
                    router.push(`/dashboard/rentals/create?roomNumber=${room.roomNumber}&status=${targetStatus}`);
                    return;
                }
            }
            await fetchRoomsData();
        } catch (error) {
            console.error("Failed to move status:", error);
            toast.error("Failed to update status.");
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

    const t = {
        en: {
            title: "Properties & Rooms Layout",
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

    // 2026 SaaS HSL Color Scheme Styling
    const getStatusStyle = (status: RoomInstance["status"]) => {
        switch (status) {
            case "Occupied": // Success Green
                return "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 hover:shadow-glow-emerald hover:border-emerald-500/80";
            case "Reserved": // Warning Yellow/Amber
                return "bg-amber-50/40 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900 text-amber-800 dark:text-amber-400 hover:shadow-glow-amber hover:border-amber-500/80";
            case "Maintenance": // Danger Red/Rose
                return "bg-rose-50/40 dark:bg-rose-950/20 border-rose-250 dark:border-rose-900 text-rose-800 dark:text-rose-450 hover:shadow-glow-rose hover:border-rose-500/80";
            case "Vacant": // Primary Blue
            default:
                return "bg-blue-50/40 dark:bg-blue-950/20 border-blue-250 dark:border-blue-900 text-blue-800 dark:text-blue-400 hover:shadow-glow-blue hover:border-blue-500/80";
        }
    };

    const getStatusDotColor = (status: RoomInstance["status"]) => {
        switch (status) {
            case "Occupied": return "bg-emerald-500";
            case "Reserved": return "bg-amber-500";
            case "Maintenance": return "bg-rose-500";
            default: return "bg-blue-500";
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
                        {lang === "en" ? "Manage and view room occupancies across visual grids and status boards." : "គ្រប់គ្រង និងមើលស្ថានភាពបន្ទប់តាមប្លង់ជាន់ និងផ្ទាំងកាងបាង។"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    >
                        <Building className="w-3.5 h-3.5" />
                        {lang === "en" ? "Add Room" : "បន្ថែមបន្ទប់"}
                    </button>

                    {/* View switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("visual")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "visual"
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" /> {t[activeLang].visualTab}
                        </button>
                        <button
                            onClick={() => setActiveTab("kanban")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "kanban"
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                            }`}
                        >
                            <Columns className="w-3.5 h-3.5" /> {t[activeLang].kanbanTab}
                        </button>
                        <button
                            onClick={() => setActiveTab("table")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "table"
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                            }`}
                        >
                            <List className="w-3.5 h-3.5" /> {t[activeLang].tableTab}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel rounded-2xl p-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder={t[activeLang].searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl outline-none bg-slate-50/50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {t[activeLang].statusLabel}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
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
                                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/85 pb-2">
                                            <Building className="text-slate-400 dark:text-slate-500 w-4 h-4" />
                                            <h3 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-widest">
                                                {floor.floorName}
                                            </h3>
                                            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 bg-slate-100 dark:bg-slate-900 rounded px-1.5 py-0.5">
                                                {roomsInFloor.length} {lang === "en" ? "rooms" : "បន្ទប់"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {roomsInFloor.map((room) => (
                                                <div
                                                    key={room.roomNumber}
                                                    className={`border-2 rounded-2xl p-4 flex flex-col justify-between h-36 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer ${getStatusStyle(room.status)}`}
                                                    onClick={() => {
                                                        if (room.rentalId) {
                                                            router.push(`/dashboard/rentals/${room.rentalId}`);
                                                        } else {
                                                            setActionRoom(room);
                                                            setEditRoomNumber(room.roomNumber);
                                                            setEditRentAmount(String(room.rentAmount));
                                                            setEditNotes(room.notes || "");
                                                            setShowActionMenu(true);
                                                        }
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-lg font-bold tracking-tight">{room.roomNumber}</span>
                                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${getStatusDotColor(room.status)}`} />
                                                    </div>

                                                    {/* Room occupant/type */}
                                                    <div className="my-2 min-w-0">
                                                        {room.clientName ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <p className="truncate">{room.clientName}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] italic opacity-60">
                                                                {lang === "en" ? "Vacant" : "បន្ទប់ទំនេរ"}
                                                            </p>
                                                        )}
                                                        <p className="text-[9px] opacity-70 truncate mt-1">{room.notes}</p>
                                                    </div>

                                                    {/* Footer price & action links */}
                                                    <div className="flex justify-between items-end border-t border-current/10 pt-2 text-[10px] font-bold">
                                                        <span>${room.rentAmount}/mo</span>
                                                        <span className="underline decoration-dotted flex items-center gap-0.5">
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
                                    Vacant: "border-t-blue-500 bg-blue-50/5 dark:bg-blue-500/5",
                                    Occupied: "border-t-emerald-500 bg-emerald-50/5 dark:bg-emerald-500/5",
                                    Reserved: "border-t-amber-500 bg-amber-50/5 dark:bg-amber-500/5",
                                    Maintenance: "border-t-rose-500 bg-rose-50/5 dark:bg-rose-500/5",
                                };

                                const badgeColors = {
                                    Vacant: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
                                    Occupied: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",
                                    Reserved: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
                                    Maintenance: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-450",
                                };

                                return (
                                    <div key={status} className={`border border-slate-250/60 dark:border-slate-850/60 border-t-4 rounded-2xl ${colColors[status]} flex flex-col h-full overflow-hidden shadow-sm`}>
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
                                                    className="bg-white dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-900/60 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:shadow-sm rounded-2xl p-4 space-y-3.5 transition-all duration-300"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Room {room.roomNumber}</span>
                                                        <span className="text-xs font-bold text-slate-650 dark:text-slate-400">${room.rentAmount}</span>
                                                    </div>

                                                    {room.clientName && (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <p className="truncate">{room.clientName}</p>
                                                            </div>
                                                            {room.startDate && (
                                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
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
                                                                    className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 rounded"
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
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
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
                                                <td colSpan={6} className="text-center py-20 text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/50">
                                                    <Building className="w-8 h-8 opacity-20 mx-auto mb-2" />
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
                                                            setActionRoom(room);
                                                            setEditRoomNumber(room.roomNumber);
                                                            setEditRentAmount(String(room.rentAmount));
                                                            setEditNotes(room.notes || "");
                                                            setShowActionMenu(true);
                                                        }
                                                    }}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">Room {room.roomNumber}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-650 dark:text-slate-350">{room.clientName || "—"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold leading-tight ${
                                                            room.status === "Occupied"
                                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-450"
                                                                : room.status === "Reserved"
                                                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-450"
                                                                : room.status === "Maintenance"
                                                                ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-450"
                                                                : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-450"
                                                        }`}>
                                                            {t[activeLang][room.status.toLowerCase() as keyof typeof t["en"]]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-50">${room.rentAmount}</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-450">{room.startDate || "—"}</td>
                                                    <td className="px-6 py-4 text-slate-550 dark:text-slate-450 truncate max-w-xs">{room.notes}</td>
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

            {/* Modal: Action Menu for Vacant Room */}
            {showActionMenu && actionRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider">
                                {lang === "en" ? `Room ${actionRoom.roomNumber} Options` : `ជម្រើសបន្ទប់ ${actionRoom.roomNumber}`}
                            </h3>
                            <button onClick={() => setShowActionMenu(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2.5 pt-2">
                            <button
                                onClick={() => {
                                    setShowActionMenu(false);
                                    router.push(`/dashboard/rentals/create?roomNumber=${actionRoom.roomNumber}`);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> {lang === "en" ? "Assign Tenant" : "ជួលបន្ទប់នេះ"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowActionMenu(false);
                                    handleMoveStatus(actionRoom, "Maintenance");
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                {lang === "en" ? "Send to Maintenance" : "ប្ដូរទៅបន្ទប់ជួសជុល"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowActionMenu(false);
                                    setShowEditModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> {lang === "en" ? "Edit Room Details" : "កែប្រែបន្ទប់"}
                            </button>
                            <button
                                onClick={handleDeleteRoom}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> {lang === "en" ? "Delete Room" : "លុបបន្ទប់នេះ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Add Room */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
                    <form onSubmit={handleAddRoom} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider">
                                {lang === "en" ? "Add New Room" : "បន្ថែមបន្ទប់ថ្មី"}
                            </h3>
                            <button type="button" onClick={() => { setShowAddModal(false); router.replace('/dashboard/rooms'); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3.5 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{lang === "en" ? "Room Number" : "លេខបន្ទប់"}</label>
                                <input
                                    type="text"
                                    required
                                    value={addRoomNumber}
                                    onChange={(e) => setAddRoomNumber(e.target.value)}
                                    placeholder="e.g. 101"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{lang === "en" ? "Default Rent ($)" : "ថ្លៃជួលលំនាំដើម ($)"}</label>
                                <input
                                    type="number"
                                    required
                                    value={addRentAmount}
                                    onChange={(e) => setAddRentAmount(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{lang === "en" ? "Description / Notes" : "ការពិពណ៌នា / កំណត់សម្គាល់"}</label>
                                <textarea
                                    value={addNotes}
                                    onChange={(e) => setAddNotes(e.target.value)}
                                    placeholder="e.g. Standard Single Room"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[70px] resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => { setShowAddModal(false); router.replace('/dashboard/rooms'); }}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                {lang === "en" ? "Cancel" : "បោះបង់"}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                            >
                                {lang === "en" ? "Create Room" : "បង្កើតបន្ទប់"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Edit Room */}
            {showEditModal && actionRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
                    <form onSubmit={handleEditRoom} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider">
                                {lang === "en" ? `Edit Room ${actionRoom.roomNumber}` : `កែប្រែបន្ទប់ ${actionRoom.roomNumber}`}
                            </h3>
                            <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3.5 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{lang === "en" ? "Room Number" : "លេខបន្ទប់"}</label>
                                <input
                                    type="text"
                                    required
                                    value={editRoomNumber}
                                    onChange={(e) => setEditRoomNumber(e.target.value)}
                                    placeholder="e.g. 101"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{lang === "en" ? "Default Rent ($)" : "ថ្លៃជួលលំនាំដើម ($)"}</label>
                                <input
                                    type="number"
                                    required
                                    value={editRentAmount}
                                    onChange={(e) => setEditRentAmount(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{lang === "en" ? "Description / Notes" : "ការពិពណ៌នា / កំណត់សម្គាល់"}</label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="e.g. Standard Single Room"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[70px] resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                {lang === "en" ? "Cancel" : "បោះបង់"}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                            >
                                {lang === "en" ? "Save Changes" : "រក្សាទុក"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function RoomsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <RoomsPageContent />
        </Suspense>
    );
}
