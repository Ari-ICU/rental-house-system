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
        w-full max-w-md p-4 border border-gray-200 rounded-xl shadow-lg bg-white transition-all duration-200 ease-in-out
        ${isPopup ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ring-1 ring-black/5 shadow-2xl' : 'relative shadow-md'}
    `;
    const overlayClasses = isPopup ? "fixed inset-0 bg-black/50 z-40" : "";

    const dropdownItemClasses = "px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors duration-150 text-gray-700 hover:text-blue-600 first:rounded-t last:rounded-b";

    return (
        <>
            {isPopup && <div className={overlayClasses} onClick={onClose} />}
            <div className={containerClasses} ref={containerRef}>
                {/* Header with Month & Year */}
                <div className="flex justify-between items-center mb-4 mt-6 pb-3 border-b border-gray-100 relative">
                    {/* Month selector */}
                    <div className="relative" ref={monthRef}>
                        <button
                            onClick={() => setMonthDropdown(!monthDropdown)}
                            className="flex items-center text-lg font-semibold px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`Select month: ${months[month]}`}
                        >
                            {months[month]}
                            <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${monthDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {monthDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
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
                        )}
                    </div>

                    {/* Year selector */}
                    <div className="relative" ref={yearRef}>
                        <button
                            onClick={() => setYearDropdown(!yearDropdown)}
                            className="flex items-center text-lg font-semibold px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`Select year: ${year}`}
                        >
                            {lang === "km" ? toKhmerDigits(year) : year}
                            <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${yearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {yearDropdown && (
                            <div className="absolute top-full right-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
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
                        )}
                    </div>

                    {/* Close button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute -top-8 -right-3 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md z-10"
                            aria-label={lang === "en" ? "Close calendar" : "បិទកាលបរិច្ឆេទ"}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Calendar Table */}
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-gray-500">
                            {weekdays.map((d, i) => (
                                <th key={i} className="py-3 px-2 text-center border-b border-gray-200 text-xs font-semibold uppercase tracking-wide">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {calendarGrid.map((week, i) => (
                            <tr key={i} className="transition-colors duration-150">
                                {week.map((day, j) => {
                                    const isSelected = day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
                                    const isTodayFlag = day !== null && isToday(day);
                                    return (
                                        <td
                                            key={j}
                                            className={`py-3 px-2 text-center border border-gray-100 cursor-pointer hover:bg-blue-50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${day === null
                                                    ? 'invisible'
                                                    : isSelected
                                                        ? 'bg-blue-600 text-white font-bold shadow-md scale-[1.02]'
                                                        : isTodayFlag
                                                            ? 'border-2 border-blue-300 bg-blue-50 text-blue-600 font-semibold'
                                                            : 'text-gray-700 hover:text-blue-700'
                                                }`}
                                            onClick={() => day && handleDayClick(day)}
                                            tabIndex={day ? 0 : -1}
                                            role={day ? "button" : undefined}
                                            aria-label={day ? `${months[month]} ${day}, ${year}` : undefined}
                                            aria-selected={isSelected}
                                        >
                                            {day !== null ? (lang === "km" ? toKhmerDigits(day) : day) : ""}
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