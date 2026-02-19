// src/components/camera/CameraSettings.tsx
'use client';

import React from 'react';
import { FaTimes, FaVideo, FaLink, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Camera } from '@/types/camera';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FaVideo className="text-blue-600 text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Camera Settings</h2>
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
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                <FaVideo className="text-blue-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Access Required</h3>
                            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                                Grant camera permission to configure your local devices
                            </p>
                            <button
                                onClick={onRequestPermission}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Enable Camera Access
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {cameras.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        <FaVideo className="text-gray-400 text-xl" />
                                    </div>
                                    <p className="text-gray-500">No cameras configured yet</p>
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
                                                        <FaToggleOn className="text-green-500" />
                                                        <span className="text-green-600">Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaToggleOff className="text-gray-400" />
                                                        <span className="text-gray-500">Inactive</span>
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
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaVideo className="text-blue-500" />
                                                        <label className="text-sm font-medium text-gray-700">Local Device</label>
                                                    </div>
                                                    <select
                                                        value={cam.deviceId || ''}
                                                        onChange={(e) => onDeviceSelect(cam.id, e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                    >
                                                        <option value="">Select camera device</option>
                                                        {availableDevices.map((device) => (
                                                            <option key={device.deviceId} value={device.deviceId}>
                                                                {device.label || `Camera ${device.deviceId.slice(0, 6)}...`}
                                                            </option>
                                                        ))}
                                                    </select>
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