'use client';

import React, { useEffect } from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled Dashboard Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                <FaExclamationTriangle size={32} />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Something went wrong</h2>
                <p className="text-slate-500 font-medium max-w-md">
                    The requested page encountered an unexpected error. Don&apos;t worry, your data is safe.
                </p>
                {error.digest && (
                    <code className="block mt-4 text-[10px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg">
                        Error ID: {error.digest}
                    </code>
                )}
            </div>

            <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
            >
                <FaRedo className="group-hover:rotate-180 transition-transform duration-500" />
                Try Again
            </button>
        </div>
    );
}
