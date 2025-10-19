import React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode; 
    bgColor?: string;
}

const MetricCard = ({ title, value, icon, bgColor = "bg-white" }: MetricCardProps) => {
    return (
        <div className={`p-6 rounded-lg shadow ${bgColor} flex items-center justify-between`}>
            <div>
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            {icon && <div className="text-gray-400">{icon}</div>}
        </div>
    );
};

export default MetricCard;
