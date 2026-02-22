import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaSearch } from 'react-icons/fa';

interface Option {
    value: string;
    label: string;
    color?: string;
    bg?: string;
    border?: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    searchable?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder = 'Select an option',
    className = '',
    searchable = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const defaultBg = isOpen
        ? 'bg-white dark:bg-slate-900'
        : 'bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900';
    const bgClass = selectedOption?.bg ? selectedOption.bg : defaultBg;

    const defaultBorder = isOpen
        ? 'ring-2 ring-violet-500/20 border-violet-400'
        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600';
    const borderClass = selectedOption?.border ? selectedOption.border : defaultBorder;

    const colorClass = selectedOption?.color ? selectedOption.color : 'text-gray-800 dark:text-gray-200';

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`group w-full px-4 py-3 border rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 outline-none ${bgClass} ${borderClass} ${colorClass}`}
            >
                <span className="text-sm font-black translate-no notranslate" translate="no">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {searchable && (
                        <div className="p-2 border-b border-gray-50 dark:border-slate-800">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all dark:text-gray-200"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-center text-xs text-gray-400 font-medium italic">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors mb-0.5
                                        ${value === opt.value
                                            ? 'bg-violet-600 text-white font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-slate-800'}`}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && <FaCheck className="text-[10px]" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
