// components/Header.tsx
import React from "react";

const Header: React.FC = () => {
    return (
        <header className=" p-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600">Manage users in the dashboard</p>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                Add New User
            </button>
        </header>
    );
};

export default Header;