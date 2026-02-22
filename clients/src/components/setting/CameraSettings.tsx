// src/components/camera/CameraSettings.tsx
'use client';

import React, { useState } from 'react';
import { FaTimes, FaVideo, FaLink, FaToggleOn, FaToggleOff, FaShieldAlt, FaPlus, FaTrash, FaBuilding } from 'react-icons/fa';
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
    onAddCamera: (camera: Omit<Camera, 'id'>) => Promise<void>;
    onDeleteCamera: (id: number) => Promise<void>;
    floors: string[];
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
    onAddCamera,
    onDeleteCamera,
    floors,
}) => {
    const { lang } = useLang();
    const [isAdding, setIsAdding] = useState(false);
    const [showCustomFloor, setShowCustomFloor] = useState(false);
    const [newCam, setNewCam] = useState<Omit<Camera, 'id'>>({
        name: '',
        floor: floors[0] || 'Ground Floor',
        isActive: true,
        streamUrl: '',
    });

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!newCam.name) return;
        await onAddCamera(newCam);
        setNewCam({
            name: '',
            floor: floors[0] || 'Ground Floor',
            isActive: true,
            streamUrl: '',
        });
        setIsAdding(false);
        setShowCustomFloor(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                            <FaShieldAlt className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                                {lang === 'km' ? 'ការកំណត់កាមេរ៉ា' : 'Camera Hub Settings'}
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2">
                                {lang === 'km' ? 'គ្រប់គ្រងឧបករណ៍សុវត្ថិភាព' : 'Manage Security Devices'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {/* Permission Notice */}
                    {!hasPermission && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-6 mb-8 border border-blue-100 dark:border-blue-800/50 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <FaVideo className="text-blue-600 dark:text-blue-400 text-2xl" />
                            </div>
                            <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 mb-2">
                                {lang === 'km' ? 'ត្រូវការការអនុញ្ញាតកាមេរ៉ា' : 'Local Access Needed'}
                            </h3>
                            <p className="text-sm font-medium text-blue-700/70 dark:text-blue-300/60 mb-6 leading-relaxed">
                                {lang === 'km'
                                    ? 'សូមផ្តល់ការអនុញ្ញាតឱ្យប្រើប្រាស់កាមេរ៉ា ដើម្បីកំណត់កាមេរ៉ាក្នុងស្រុក'
                                    : 'Enable browser camera access to configure and use local video processing devices.'}
                            </p>
                            <button
                                onClick={onRequestPermission}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
                            >
                                {lang === 'km' ? 'អនុញ្ញាតការចូលប្រើ' : 'Grant Device Access'}
                            </button>
                        </div>
                    )}

                    {/* Add Camera Action */}
                    <div className="mb-8">
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-slate-600 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                                    <FaPlus className="text-xl" />
                                </div>
                                <span className="font-black text-[10px] uppercase tracking-widest">
                                    {lang === 'km' ? 'បន្ថែមប៊ូតុងកាមេរ៉ា' : 'Add New Camera Source'}
                                </span>
                            </button>
                        ) : (
                            <div className="bg-gray-50/50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[10px]">
                                        {lang === 'km' ? 'ព័ត៌មានកាមេរ៉ាថ្មី' : 'New Camera Configuration'}
                                    </h3>
                                    <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Name</label>
                                        <input
                                            type="text"
                                            value={newCam.name}
                                            onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                                            placeholder="Entrance, Lobby, etc."
                                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Floor</label>
                                                <button
                                                    onClick={() => setShowCustomFloor(!showCustomFloor)}
                                                    className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
                                                >
                                                    {showCustomFloor ? (lang === 'km' ? 'ជ្រើសរើសជាន់' : 'Select Floor') : (lang === 'km' ? 'បន្ថែមជាន់ថ្មី' : 'New Floor')}
                                                </button>
                                            </div>
                                            {showCustomFloor ? (
                                                <input
                                                    type="text"
                                                    value={newCam.floor}
                                                    onChange={(e) => setNewCam({ ...newCam, floor: e.target.value })}
                                                    placeholder="e.g. Roof Top"
                                                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                                />
                                            ) : (
                                                <CustomDropdown
                                                    options={floors.map(f => ({ value: f, label: f }))}
                                                    value={newCam.floor}
                                                    onChange={(val) => setNewCam({ ...newCam, floor: val })}
                                                    className="!rounded-2xl !border-gray-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Initial Status</label>
                                            <div
                                                onClick={() => setNewCam({ ...newCam, isActive: !newCam.isActive })}
                                                className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl cursor-pointer"
                                            >
                                                {newCam.isActive ? <FaToggleOn className="text-emerald-500 text-xl" /> : <FaToggleOff className="text-gray-300 text-xl" />}
                                                <span className="font-bold text-sm text-gray-600 dark:text-slate-400">{newCam.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Stream URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={newCam.streamUrl || ''}
                                            onChange={(e) => setNewCam({ ...newCam, streamUrl: e.target.value })}
                                            placeholder="https://.../stream.m3u8"
                                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newCam.name}
                                        className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
                                    >
                                        Save Camera Configuration
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Camera List */}
                    <div className="space-y-4">
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-[10px] ml-1 mb-6">
                            {lang === 'km' ? 'បញ្ជីកាមេរ៉ា' : 'Configured Feeds'} ({cameras.length})
                        </h3>
                        {cameras.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800">
                                <p className="text-gray-400 dark:text-slate-600 font-bold text-sm">No cameras configured yet.</p>
                            </div>
                        ) : (
                            cameras.map((cam) => (
                                <div
                                    key={cam.id}
                                    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                <FaBuilding />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{cam.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cam.floor}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <button
                                                        onClick={() => onToggleActive(cam.id)}
                                                        className={`text-[9px] font-black uppercase tracking-widest ${cam.isActive ? 'text-emerald-500' : 'text-rose-500'}`}
                                                    >
                                                        {cam.isActive ? 'Active' : 'Disabled'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDeleteCamera(cam.id)}
                                            className="p-2.5 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Source Configuration</label>
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{cam.streamUrl ? 'Remote' : 'Local'}</span>
                                            </div>
                                            {cam.streamUrl !== undefined ? (
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                                                        <FaLink size={12} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={cam.streamUrl || ''}
                                                        onChange={(e) => onUpdateStreamUrl(cam.id, e.target.value)}
                                                        placeholder="Stream URL (m3u8, mp4, etc.)"
                                                        className="w-full pl-10 pr-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/30 rounded-2xl outline-none font-bold text-sm transition-all"
                                                    />
                                                </div>
                                            ) : (
                                                <CustomDropdown
                                                    options={[
                                                        { value: '', label: 'Select device...' },
                                                        ...availableDevices.map(d => ({
                                                            value: d.deviceId,
                                                            label: d.label || `Camera ${d.deviceId.slice(0, 8)}`
                                                        }))
                                                    ]}
                                                    value={cam.deviceId || ''}
                                                    onChange={(val) => onDeviceSelect(cam.id, val)}
                                                    className="!rounded-2xl !bg-gray-50 dark:!bg-slate-800/50 !border-transparent"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
                    >
                        Close Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraSettings;