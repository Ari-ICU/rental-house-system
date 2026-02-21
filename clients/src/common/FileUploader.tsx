'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaFilePdf, FaImage, FaCheckCircle } from 'react-icons/fa';
import { useLang } from '@/context/LangContext';
import Image from 'next/image';

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
        if (file) {
            onFileSelect(file);
        }
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
        if (preview.startsWith('data:image') || preview.match(/\.(jpeg|jpg|gif|png)$/i) || preview.includes('/image/')) {
            return <FaImage className="text-2xl text-blue-500" />;
        }
        return <FaFilePdf className="text-2xl text-red-500" />;
    };

    return (
        <div className="space-y-3 w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                className={`relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden group
                    ${dragOver
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20'
                        : preview
                            ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/10 dark:border-emerald-500/30'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-gray-800/50 bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
            >
                <div className="flex flex-col items-center justify-center p-6 space-y-4 pointer-events-none">
                    <div className={`p-4 rounded-full transition-transform duration-300 group-hover:scale-110 
                        ${dragOver
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <FaCloudUploadAlt className="text-3xl" />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="text-blue-600 dark:text-blue-400 hover:underline pointer-events-auto">
                                {lang === 'km' ? 'ចុចដើម្បីជ្រើសរើស' : 'Click to select'}
                            </span>
                            {' '}
                            {lang === 'km' ? 'ឬទាញយកឯកសារមកទីនេះ' : 'or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            {lang === 'km' ? 'ទម្រង់ដែលគាំទ្រ៖ PNG, JPG, PDF' : 'Supported formats: PNG, JPG, PDF'}
                        </p>
                    </div>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Preview Card */}
            {preview && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
                    <div className="relative flex items-center p-3 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        {/* Left Thumbnail */}
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                            {preview.startsWith('data:image') || preview.match(/\.(jpeg|jpg|gif|png)$/i) || preview.includes('/image/') ? (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                renderPreviewIcon()
                            )}
                        </div>

                        {/* File Info */}
                        <div className="ml-4 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {lang === 'km' ? 'ឯកសារត្រូវបានភ្ជាប់' : 'File attached'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <FaCheckCircle className="text-green-500 text-xs" />
                                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                    {lang === 'km' ? 'រួចរាល់' : 'Ready'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removePreview();
                            }}
                            className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none"
                            title={lang === 'km' ? 'លុបឯកសារ' : 'Remove file'}
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;