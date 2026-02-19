"use client";

import React, { useState } from "react";
import Sidebar from "@/common/Sidebar";
import Header from "@/common/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

    return (
        <div className="flex min-h-screen">
            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
                <Header onMobileMenuToggle={toggleMobileMenu} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                    {children}
                </main>
            </div>
        </div>
    );
}