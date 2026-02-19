// components/UserList.tsx
"use client";

import React, { useState, useEffect } from "react";

export type UserRole = "Admin" | "User" | "Manager" | "Guest";
export type UserStatus = "Active" | "Inactive" | "Pending" | "Suspended";

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}

interface UserListProps {
    users: User[];
    itemsPerPageOptions?: number[];
}

const roleColors: { [key in UserRole]: string } = {
    Admin: "bg-red-100 text-red-800",
    User: "bg-blue-100 text-blue-800",
    Manager: "bg-green-100 text-green-800",
    Guest: "bg-gray-100 text-gray-800",
};

const statusColors: { [key in UserStatus]: string } = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Suspended: "bg-red-100 text-red-800",
};

const allRoles: UserRole[] = ["Admin", "User", "Manager", "Guest"];
const allStatuses: UserStatus[] = ["Active", "Inactive", "Pending", "Suspended"];

const UserList: React.FC<UserListProps> = ({
    users,
    itemsPerPageOptions = [5, 10, 20],
}) => {
    const [localUsers, setLocalUsers] = useState(users);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    useEffect(() => {
        setLocalUsers(users);
    }, [users]);

    // No filters, just use all users
    const filteredUsers = localUsers;

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEditStart = (user: User) => {
        setEditingId(user.id);
        setEditForm(user);
    };

    const handleSaveEdit = (id: number) => {
        setLocalUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...editForm } : u))
        );
        setEditingId(null);
        setEditForm({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            const newUsers = localUsers.filter((u) => u.id !== id);
            setLocalUsers(newUsers);
            const newTotalPages = Math.ceil(newUsers.length / itemsPerPage);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }
        }
    };

    const updateEditForm = (field: keyof User, value: string) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Items per page selector */}
            <div className="flex justify-end gap-4">
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setCurrentPage(1); // Reset to first page on change
                    }}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {itemsPerPageOptions.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt} per page
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full border border-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Email</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Role</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Created At</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user, idx) => {
                                const isEditing = editingId === user.id;
                                return (
                                    <tr
                                        key={user.id}
                                        className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            } hover:bg-gray-100 transition`}
                                    >
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.name || ""}
                                                    onChange={(e) =>
                                                        updateEditForm("name", e.target.value)
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                user.name
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email || ""}
                                                    onChange={(e) =>
                                                        updateEditForm("email", e.target.value)
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                user.email
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <select
                                                    value={editForm.role || ""}
                                                    onChange={(e) =>
                                                        updateEditForm(
                                                            "role",
                                                            e.target.value as UserRole
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1"
                                                >
                                                    {allRoles.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <select
                                                    value={editForm.status || ""}
                                                    onChange={(e) =>
                                                        updateEditForm(
                                                            "status",
                                                            e.target.value as UserStatus
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1"
                                                >
                                                    {allStatuses.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[user.status]
                                                        }`}
                                                >
                                                    {user.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editForm.createdAt || ""}
                                                    onChange={(e) =>
                                                        updateEditForm("createdAt", e.target.value)
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                user.createdAt
                                            )}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveEdit(user.id)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEditStart(user)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-2">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded ${currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${page === currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded ${currentPage === totalPages
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserList;