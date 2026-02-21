import React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    bgColor?: string;
}

const MetricCard = ({ title, value, icon, bgColor = "bg-white" }: MetricCardProps) => {
    return (
        <div className={`p-5 rounded-lg shadow-sm border border-slate-200 ${bgColor} group hover:shadow-md transition-shadow duration-200 flex flex-col justify-between`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100 transition-colors">
                    {icon}
                </div>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-600">
                <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    2.5%
                </span>
                <span className="text-slate-500 font-normal ml-1.5">vs last month</span>
            </div>
        </div>
    );
};

export default MetricCard;
