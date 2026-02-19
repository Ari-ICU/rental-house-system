import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

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
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder = 'Select an option',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`group w-full px-4 py-3 border rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 outline-none
                    ${isOpen ? 'ring-2 ring-violet-500/20 border-violet-400 bg-white' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'}
                    ${selectedOption?.bg || ''} ${selectedOption?.color || 'text-gray-800'} ${selectedOption?.border || ''}`}
            >
                <span className="text-sm font-black translate-no notranslate" translate="no">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto p-1">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors mb-0.5
                                    ${value === opt.value
                                        ? 'bg-violet-600 text-white font-semibold'
                                        : 'text-gray-700 hover:bg-violet-50'}`}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <FaCheck className="text-[10px]" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
