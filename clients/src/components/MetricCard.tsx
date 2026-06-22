import React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    bgColor?: string;
    trend?: string;
    trendType?: "up" | "down" | "neutral";
    trendLabel?: string;
    sparklinePoints?: number[];
    color?: "indigo" | "emerald" | "rose" | "amber" | "blue" | "slate";
}

const colorMap = {
    indigo: {
        text: "text-indigo-650 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-500/10",
        hoverBg: "group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20",
        stroke: "stroke-indigo-500 dark:stroke-indigo-400",
        fill: "fill-indigo-50 dark:fill-indigo-500/5",
        trend: "text-indigo-600 dark:text-indigo-450",
        glow: "hover:shadow-glow-indigo hover:border-indigo-400/40 dark:hover:border-indigo-500/20",
    },
    emerald: {
        text: "text-emerald-650 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
        stroke: "stroke-emerald-500 dark:stroke-emerald-400",
        fill: "fill-emerald-50 dark:fill-emerald-500/5",
        trend: "text-emerald-600 dark:text-emerald-450",
        glow: "hover:shadow-glow-emerald hover:border-emerald-400/40 dark:hover:border-emerald-500/20",
    },
    rose: {
        text: "text-rose-650 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-500/10",
        hoverBg: "group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20",
        stroke: "stroke-rose-500 dark:stroke-rose-400",
        fill: "fill-rose-50 dark:fill-rose-500/5",
        trend: "text-rose-600 dark:text-rose-450",
        glow: "hover:shadow-glow-rose hover:border-rose-400/40 dark:hover:border-rose-500/20",
    },
    amber: {
        text: "text-amber-650 dark:text-amber-455",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        hoverBg: "group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20",
        stroke: "stroke-amber-500 dark:stroke-amber-400",
        fill: "fill-amber-50 dark:fill-amber-500/5",
        trend: "text-amber-600 dark:text-amber-500",
        glow: "hover:shadow-glow-amber hover:border-amber-400/40 dark:hover:border-amber-500/20",
    },
    blue: {
        text: "text-blue-650 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        hoverBg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
        stroke: "stroke-blue-500 dark:stroke-blue-400",
        fill: "fill-blue-50 dark:fill-blue-500/5",
        trend: "text-blue-600 dark:text-blue-450",
        glow: "hover:shadow-glow-blue hover:border-blue-400/40 dark:hover:border-blue-500/20",
    },
    slate: {
        text: "text-slate-650 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-500/10",
        hoverBg: "group-hover:bg-slate-100 dark:group-hover:bg-slate-500/20",
        stroke: "stroke-slate-500 dark:stroke-slate-400",
        fill: "fill-slate-50 dark:fill-slate-500/5",
        trend: "text-slate-600 dark:text-slate-450",
        glow: "hover:shadow-premium hover:border-slate-350 dark:hover:border-slate-700",
    },
};

const MetricCard = ({
    title,
    value,
    icon,
    bgColor = "bg-white dark:bg-slate-900",
    trend,
    trendType = "up",
    trendLabel = "vs last month",
    sparklinePoints = [10, 15, 8, 22, 18, 30],
    color = "indigo",
}: MetricCardProps) => {
    const activeColor = colorMap[color] || colorMap.indigo;

    // Generate sparkline path
    const generateSparklinePath = (points: number[]) => {
        if (!points || points.length < 2) return { linePath: "", areaPath: "" };
        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = max - min === 0 ? 1 : max - min;
        const width = 80;
        const height = 24;

        const coords = points.map((p, index) => {
            const x = (index / (points.length - 1)) * width;
            const y = height - ((p - min) / range) * (height - 4) - 2;
            return { x, y };
        });

        const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
        const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

        return { linePath, areaPath };
    };

    const { linePath, areaPath } = generateSparklinePath(sparklinePoints);

    return (
        <div className={`p-5 rounded-2xl glass-panel group hover:-translate-y-1 ${activeColor.glow} flex flex-col justify-between h-36`}>
            {/* Top section */}
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <h3 className="text-slate-450 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider truncate">{title}</h3>
                    <p className="text-xl font-bold text-slate-850 dark:text-slate-50 mt-1.5 tracking-tight tabular-nums truncate">{value}</p>
                </div>
                <div className={`p-2 rounded-xl ${activeColor.bg} ${activeColor.text} ${activeColor.hoverBg} transition-all duration-300 flex-shrink-0 ml-3 shadow-sm`}>
                    {icon}
                </div>
            </div>

            {/* Bottom section (Trend & Sparkline) */}
            <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col gap-0.5">
                    {trend && (
                        <span className={`flex items-center text-xs font-bold ${
                            trendType === "up"
                                ? "text-emerald-600 dark:text-emerald-450"
                                : trendType === "down"
                                ? "text-rose-600 dark:text-rose-450"
                                : "text-slate-500"
                        }`}>
                            {trendType === "up" ? (
                                <svg className="w-3.5 h-3.5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            ) : trendType === "down" ? (
                                <svg className="w-3.5 h-3.5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>
                            ) : null}
                            {trend}
                        </span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">{trendLabel}</span>
                </div>

                {/* Sparkline Graph */}
                {sparklinePoints.length > 1 && (
                    <div className="w-20 h-6 overflow-hidden shrink-0">
                        <svg width="80" height="24" viewBox="0 0 80 24" className="overflow-visible">
                            <path
                                d={areaPath}
                                className={`${activeColor.fill} transition-all duration-300`}
                            />
                            <path
                                d={linePath}
                                fill="none"
                                className={`${activeColor.stroke} transition-all duration-300`}
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
