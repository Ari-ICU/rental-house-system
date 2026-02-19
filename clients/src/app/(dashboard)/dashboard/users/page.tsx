// app/dashboard/users/page.tsx
"use client";

import React from "react";
import Header from "@/components/user/UserHeader";
import UserList, { User } from "@/components/user/UserList";

const UsersPage: React.FC = () => {
    // Mock data - replace with actual data fetching
    const mockUsers: User[] = [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "Admin",
            status: "Active",
            createdAt: "2023-10-01",
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "User",
            status: "Active",
            createdAt: "2023-10-02",
        },
        // Add more mock users as needed
    ];

    return (
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto">
                <UserList users={mockUsers} />
            </main>
        </div>
    );
};

export default UsersPage;