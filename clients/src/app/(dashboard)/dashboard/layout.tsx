"use client";

import React, { useState } from "react";
import Sidebar from "@/common/Sidebar";
import Header from "@/common/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900 transition-colors">
                <Header onMobileMenuToggle={toggleMobileMenu} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                    {children}
                </main>
            </div>
        </div>
    );
}