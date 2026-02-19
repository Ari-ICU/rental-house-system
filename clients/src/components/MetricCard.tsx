import React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    bgColor?: string;
}

const MetricCard = ({ title, value, icon, bgColor = "bg-white" }: MetricCardProps) => {
    return (
        <div className={`relative overflow-hidden p-6 rounded-2xl shadow-sm border border-gray-100 ${bgColor} group hover:shadow-md transition-shadow duration-300`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
                {/* Background Decor Icon */}
                <div className="text-gray-900 group-hover:text-purple-600 transition-colors">
                    {icon}
                </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{title}</h3>
                    <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-green-600">
                <span className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    +2.5%
                </span>
                <span className="text-gray-400 ml-2">from last month</span>
            </div>
        </div>
    );
};

export default MetricCard;
