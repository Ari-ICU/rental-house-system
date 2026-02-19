interface InputFieldProps {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const InputField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}: InputFieldProps) => {
    return (
        <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
            />
        </div>
    );
};

export default InputField;
