'use client';

import { useState, useEffect } from 'react';
import CameraController from "@/components/camera/CameraController";
import { Camera } from "@/types/camera";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const CameraPage = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

    const fetchCameras = async () => {
        try {
            setLoading(true);
            const response = await api.get<Camera[]>('/api/cameras');
            setCameras(response.data || []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch cameras:', err);
            setError('Failed to load cameras. Please try again later.');
            toast.error('Failed to load cameras');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Initializing Camera Hub...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center border border-rose-100 dark:border-rose-800">
                    <span className="text-4xl text-rose-500">!</span>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{error}</h2>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Please check your connection and try refreshing.</p>
                </div>
                <button
                    onClick={fetchCameras}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <CameraController cameras={cameras} floors={floors} />
        </div>
    );
};

export default CameraPage;