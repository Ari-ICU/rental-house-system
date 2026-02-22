"use client";

import React, { useState, useEffect, useRef } from "react";

interface KhmerCalendarProps {
    selectedDate?: string;
    onChange: (dateStr: string) => void;
    lang?: "en" | "km";
    onClose?: () => void;
    isPopup?: boolean;
}

const khMonths = ["មករា", "កម្ភៈ", "មិនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const khWeekdays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const enWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function KhmerCalendar({ selectedDate, onChange, lang = "km", onClose, isPopup = false }: KhmerCalendarProps) {
    const [currentDate, setCurrentDate] = useState<Date>(selectedDate ? new Date(selectedDate) : new Date());
    const [month, setMonth] = useState(currentDate.getMonth());
    const [year, setYear] = useState(currentDate.getFullYear());
    const [calendarGrid, setCalendarGrid] = useState<(number | null)[][]>([]);
    const [monthDropdown, setMonthDropdown] = useState(false);
    const [yearDropdown, setYearDropdown] = useState(false);
    const monthRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const toKhmerDigits = (num: number) => num.toString().replace(/\d/g, d => "០១២៣៤៥៦៧៨៩"[+d]);
    const months = lang === "km" ? khMonths : enMonths;
    const weekdays = lang === "km" ? khWeekdays : enWeekdays;

    useEffect(() => {
        if (selectedDate) {
            const date = new Date(selectedDate);
            setCurrentDate(date);
            setMonth(date.getMonth());
            setYear(date.getFullYear());
        }
    }, [selectedDate]);

    useEffect(() => {
        generateCalendar(month, year);
    }, [month, year]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
                setMonthDropdown(false);
            }
            if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
                setYearDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const generateCalendar = (m: number, y: number) => {
        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const weeks: (number | null)[][] = [];
        let week: (number | null)[] = Array(firstDay).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if (week.length === 7) { weeks.push(week); week = []; }
        }
        if (week.length > 0) while (week.length < 7) week.push(null); weeks.push(week);
        setCalendarGrid(weeks);
    };

    const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0'); // +1 because month is 0-based
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(year, month, day);
        setCurrentDate(newDate);
        onChange(formatDateLocal(newDate));
        if (onClose) onClose();
    };


    const handleMonthSelect = (m: number) => { setMonth(m); setMonthDropdown(false); };
    const handleYearSelect = (y: number) => { setYear(y); setYearDropdown(false); };

    const isToday = (day: number) => year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

    const containerClasses = `
        w-full max-w-md p-6 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out
        ${isPopup ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]' : 'relative shadow-xl shadow-indigo-500/5'}
    `;
    const overlayClasses = isPopup ? "fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 transition-opacity animate-in fade-in duration-300" : "";

    const dropdownItemClasses = "w-full text-left px-4 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors duration-150 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm first:rounded-t-2xl last:rounded-b-2xl";

    return (
        <>
            {isPopup && <div className={overlayClasses} onClick={onClose} />}
            <div className={containerClasses} ref={containerRef}>
                {/* Header with Month & Year */}
                <div className="flex justify-between items-center mb-6 pt-2 pb-4 border-b border-gray-50 dark:border-slate-800 relative">
                    <div className="flex gap-2">
                        {/* Month selector */}
                        <div className="relative" ref={monthRef}>
                            <button
                                onClick={() => setMonthDropdown(!monthDropdown)}
                                className="flex items-center text-xl font-black text-slate-900 dark:text-white px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                aria-label={`Select month: ${months[month]}`}
                            >
                                {months[month]}
                                <svg className={`w-4 h-4 ml-2 transition-transform duration-300 text-indigo-500 ${monthDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {monthDropdown && (
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
                                    <div className="py-2">
                                        {months.map((mName, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleMonthSelect(idx)}
                                                className={dropdownItemClasses}
                                                aria-label={`Select ${mName}`}
                                            >
                                                {mName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Year selector */}
                        <div className="relative" ref={yearRef}>
                            <button
                                onClick={() => setYearDropdown(!yearDropdown)}
                                className="flex items-center text-xl font-black text-slate-900 dark:text-white px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                aria-label={`Select year: ${year}`}
                            >
                                {lang === "km" ? toKhmerDigits(year) : year}
                                <svg className={`w-4 h-4 ml-2 transition-transform duration-300 text-indigo-500 ${yearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {yearDropdown && (
                                <div className="absolute top-full left-0 mt-3 w-32 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
                                    <div className="py-2">
                                        {Array.from({ length: 21 }, (_, i) => year - 10 + i).map(y => (
                                            <button
                                                key={y}
                                                onClick={() => handleYearSelect(y)}
                                                className={dropdownItemClasses}
                                                aria-label={`Select year ${y}`}
                                            >
                                                {lang === "km" ? toKhmerDigits(y) : y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Close button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="bg-slate-100 dark:bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10"
                            aria-label={lang === "en" ? "Close calendar" : "បិទកាលបរិច្ឆេទ"}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Calendar Table */}
                <table className="w-full border-separate border-spacing-1">
                    <thead>
                        <tr>
                            {weekdays.map((d, i) => (
                                <th key={i} className="py-3 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {calendarGrid.map((week, i) => (
                            <tr key={i}>
                                {week.map((day, j) => {
                                    const isSelected = day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
                                    const isTodayFlag = day !== null && isToday(day);
                                    return (
                                        <td
                                            key={j}
                                            className="p-0"
                                        >
                                            {day !== null ? (
                                                <button
                                                    onClick={() => handleDayClick(day)}
                                                    className={`
                                                        w-full aspect-square flex items-center justify-center text-sm font-bold rounded-2xl transition-all duration-200
                                                        ${isSelected
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 scale-105 z-10'
                                                            : isTodayFlag
                                                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                        }
                                                    `}
                                                    aria-label={day ? `${months[month]} ${day}, ${year}` : undefined}
                                                    aria-selected={isSelected}
                                                >
                                                    {lang === "km" ? toKhmerDigits(day) : day}
                                                </button>
                                            ) : (
                                                <div className="w-full aspect-square" />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}