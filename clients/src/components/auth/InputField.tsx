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
        <div className={`space-y-2 ${className}`}>
            <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-[0.15em] ml-1.5">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-300">
                        {icon}
                    </div>
                )}
                <input
                    {...props}
                    className={`
                        w-full bg-slate-100/50 dark:bg-slate-950/30 border border-slate-250 dark:border-slate-850 rounded-2xl py-4 
                        ${icon ? 'pl-12' : 'px-6'} pr-6
                        text-slate-850 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600
                        focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 focus:border-indigo-500/60 dark:focus:border-indigo-400/60
                        hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 text-sm
                    `}
                />
            </div>
        </div>
    );
};

export default InputField;
