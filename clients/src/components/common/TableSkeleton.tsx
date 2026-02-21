'use client';

import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 5 }) => {
    return (
        <div className="w-full bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
            <div className="bg-slate-50/50 h-12 border-b border-slate-100 flex items-center px-6 gap-4">
                {[...Array(cols)].map((_, i) => (
                    <div key={i} className="h-3 bg-slate-200 rounded-full flex-1" />
                ))}
            </div>
            <div className="divide-y divide-slate-50">
                {[...Array(rows)].map((_, rowIndex) => (
                    <div key={rowIndex} className="px-6 py-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                            <div className="h-2 bg-slate-50 rounded-full w-1/2" />
                        </div>
                        {[...Array(cols - 1)].map((_, colIndex) => (
                            <div key={colIndex} className="h-3 bg-slate-50 rounded-full flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
