// src/components/camera/CameraSettings.tsx
'use client';

import React from 'react';
import { FaTimes, FaVideo, FaLink, FaToggleOn, FaToggleOff, FaShieldAlt } from 'react-icons/fa';
import { Camera } from '@/types/camera';
import { useLang } from '@/context/LangContext';
import CustomDropdown from '@/common/CustomDropdown';

interface CameraSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    cameras: Camera[];
    availableDevices: MediaDeviceInfo[];
    hasPermission: boolean;
    onRequestPermission: () => Promise<void>;
    onDeviceSelect: (id: number, deviceId: string) => void;
    onUpdateStreamUrl: (id: number, url: string) => void;
    onToggleActive: (id: number) => void;
}

const CameraSettings: React.FC<CameraSettingsProps> = ({
    isOpen,
    onClose,
    cameras,
    availableDevices,
    hasPermission,
    onRequestPermission,
    onDeviceSelect,
    onUpdateStreamUrl,
    onToggleActive,
}) => {
    const { lang } = useLang();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                            <FaShieldAlt className="text-white text-lg" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {lang === 'km' ? 'ការកំណត់កាមេរ៉ា' : 'Camera Settings'}
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {lang === 'km' ? 'កំណត់រចនាសម្ព័ន្ធឧបករណ៍' : 'Device Configuration'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        aria-label="Close settings"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                    {!hasPermission ? (
                        <div className="text-center py-12 px-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-blue-50 mb-6 animate-bounce-slow">
                                <FaVideo className="text-blue-600 text-3xl" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">
                                {lang === 'km' ? 'ត្រូវការការអនុញ្ញាតកាមេរ៉ា' : 'Camera Access Required'}
                            </h3>
                            <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto leading-relaxed text-sm">
                                {lang === 'km'
                                    ? 'សូមផ្តល់ការអនុញ្ញាតឱ្យប្រើប្រាស់កាមេរ៉ា ដើម្បីកំណត់រចនាសម្ព័ន្ធឧបករណ៍ក្នុងស្រុករបស់អ្នក'
                                    : 'Please grant camera permissions to configure and access your local video devices.'}
                            </p>
                            <button
                                onClick={onRequestPermission}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                            >
                                {lang === 'km' ? 'បើកការចូលប្រើកាមេរ៉ា' : 'Enable Camera Access'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {cameras.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4 border border-gray-100">
                                        <FaVideo className="text-gray-300 text-2xl" />
                                    </div>
                                    <p className="text-gray-400 font-bold text-sm">
                                        {lang === 'km' ? 'មិនមានកាមេរ៉ាត្រូវបានកំណត់ទេ' : 'No cameras configured yet'}
                                    </p>
                                </div>
                            ) : (
                                cameras.map((cam) => (
                                    <div
                                        key={cam.id}
                                        className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{cam.name}</h3>
                                                <p className="text-sm text-gray-500">{cam.floor}</p>
                                            </div>
                                            <button
                                                onClick={() => onToggleActive(cam.id)}
                                                className="flex items-center gap-1 text-sm font-medium"
                                            >
                                                {cam.isActive ? (
                                                    <>
                                                        <FaToggleOn className="text-emerald-500 text-lg" />
                                                        <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">
                                                            {lang === 'km' ? 'សកម្ម' : 'Active'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaToggleOff className="text-gray-300 text-lg group-hover:text-gray-400 transition-colors" />
                                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-wider group-hover:text-gray-500 transition-colors">
                                                            {lang === 'km' ? 'អសកម្ម' : 'Inactive'}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="mt-2">
                                            {cam.streamUrl ? (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaLink className="text-blue-500" />
                                                        <label className="text-sm font-medium text-gray-700">Stream URL</label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={cam.streamUrl}
                                                        onChange={(e) => onUpdateStreamUrl(cam.id, e.target.value)}
                                                        placeholder="https://example.com/stream.m3u8"
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder-gray-300 text-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaVideo className="text-blue-500 text-xs" />
                                                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                                                            {lang === 'km' ? 'ឧបករណ៍ក្នុងស្រុក' : 'Local Device'}
                                                        </label>
                                                    </div>
                                                    <CustomDropdown
                                                        options={[
                                                            { value: '', label: lang === 'km' ? 'ជ្រើសរើសឧបករណ៍កាមេរ៉ា' : 'Select camera device' },
                                                            ...availableDevices.map(d => ({
                                                                value: d.deviceId,
                                                                label: d.label || `Camera ${d.deviceId.slice(0, 6)}...`
                                                            }))
                                                        ]}
                                                        value={cam.deviceId || ''}
                                                        onChange={(val) => onDeviceSelect(cam.id, val)}
                                                        className="w-full !rounded-xl !border-gray-200 hover:!border-blue-400 transition-colors"
                                                        placeholder={lang === 'km' ? 'ជ្រើសរើសឧបករណ៍' : 'Select Device'}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraSettings;