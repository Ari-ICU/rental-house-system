import React from 'react';

export default function Loading() {
    return (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center space-y-6">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2 text-center">
                <div className="h-4 w-32 bg-slate-100 rounded-full mx-auto animate-pulse" />
                <div className="h-3 w-48 bg-slate-50 rounded-full mx-auto animate-pulse" />
            </div>
        </div>
    );
}
