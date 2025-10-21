'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaFilePdf, FaFileImage } from 'react-icons/fa';
import { useLang } from '@/context/LangContext';

interface FileUploaderProps {
    label?: string;
    accept?: string;
    onFileSelect: (file: File | null) => void;
    preview?: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, accept, onFileSelect, preview }) => {
    const { lang } = useLang();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        if (!preview && inputRef.current) {
            inputRef.current.value = '';
        }
    }, [preview]);

    const handleBrowseClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onFileSelect(file);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (accept) {
                const acceptedTypes = accept.split(',').map(t => t.trim());
                const isValid = acceptedTypes.some(type => {
                    if (type === 'image/*') return file.type.startsWith('image/');
                    return file.type === type || file.name.endsWith(type.replace(/\./g, ''));
                });
                if (!isValid) return;
            }
            onFileSelect(file);
        }
    };

    const removePreview = () => {
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    // Determine icon based on file type (for non-image previews)
    const renderPreviewIcon = () => {
        if (!preview) return null;
        if (preview.startsWith('data:image') || preview.includes('/image/')) {
            return <FaFileImage className="text-4xl text-gray-500" />;
        }
        return <FaFilePdf className="text-4xl text-red-500" />;
    };

    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}

            {/* Drop Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
                    ${dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : preview
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
            >
                <FaCloudUploadAlt className={`text-3xl mb-2 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-gray-700 font-medium text-center px-4">
                    {lang === 'km' ? 'ទាញ​យក​ឯកសារ ឬ ចុចដើម្បីជ្រើសរើស' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1 px-4 text-center">
                    {lang === 'km' ? 'ទម្រង់ដែលគាំទ្រ៖ PNG, JPG, PDF' : 'Supported formats: PNG, JPG, PDF'}
                </p>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleBrowseClick();
                    }}
                    className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition shadow-sm"
                >
                    {lang === 'km' ? 'រុករក' : 'Browse Files'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Preview */}
            {preview && (
                <div className="mt-3 relative inline-block group">
                    {preview.startsWith('data:image') || preview.includes('/image/') ? (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-xl border shadow-sm"
                        />
                    ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-xl border shadow-sm">
                            {renderPreviewIcon()}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removePreview();
                        }}
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={lang === 'km' ? 'លុបឯកសារ' : 'Remove file'}
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;