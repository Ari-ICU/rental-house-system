import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
}

const InputField = ({
    label,
    icon,
    className = "",
    ...props
}: InputFieldProps) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                        {icon}
                    </div>
                )}
                <input
                    {...props}
                    className={`
                        w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 
                        ${icon ? 'pl-12' : 'px-6'} pr-6
                        text-slate-900 font-medium placeholder:text-slate-400
                        focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50
                        hover:border-slate-300 transition-all duration-300
                    `}
                />
            </div>
        </div>
    );
};

export default InputField;
