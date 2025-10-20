'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaStop, FaExpand, FaCamera, FaBuilding, FaCircle } from 'react-icons/fa';

export interface Camera {
    id: number;
    name: string;
    floor: string;
    streamUrl: string;
    isActive: boolean;
}

interface CameraControllerProps {
    cameras?: Camera[];
    floors?: string[];
}

const defaultFloors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

const CameraController: React.FC<CameraControllerProps> = ({
    cameras: initialCameras = [],
    floors = defaultFloors,
}) => {
    const [selectedFloor, setSelectedFloor] = useState('All Floors');
    const [cameras] = useState<Camera[]>(initialCameras);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});



    const handleStart = (id: number) => videoRefs.current[id]?.play?.();
    const handleStop = (id: number) => videoRefs.current[id]?.pause?.();

    const handleCapture = (id: number) => {
        const video = videoRefs.current[id];
        if (!video || video.readyState === 0) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `camera_${id}_snapshot.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFullscreen = (id: number) => {
        const video = videoRefs.current[id];
        if (video?.requestFullscreen) {
            video.requestFullscreen();
        }
    };

    const filteredCameras =
        selectedFloor === 'All Floors'
            ? cameras
            : cameras.filter((cam) => cam.floor === selectedFloor);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <FaBuilding className="text-blue-600 text-xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Camera Center</h1>
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                        <option value="All Floors">All Floors</option>
                        {floors.map((floor) => (
                            <option key={floor} value={floor}>
                                {floor}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Camera Grid */}
            {filteredCameras.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No cameras available for this selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredCameras.map((cam) => (
                        <div
                            key={cam.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                            {/* Video Container */}
                            <div className="relative bg-gray-900 aspect-video">
                                <video
                                    ref={(el: HTMLVideoElement | null) => {
                                        videoRefs.current[cam.id] = el;
                                    }}
                                    src={cam.streamUrl}
                                    className="w-full h-full object-cover"
                                    controls={false}
                                    muted
                                />
                                {/* Status Badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                                    <FaCircle
                                        className={`text-xs ${cam.isActive ? 'text-green-400' : 'text-red-400'
                                            }`}
                                    />
                                    <span className="text-white text-xs font-medium">
                                        {cam.isActive ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            {/* Info & Controls */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="font-semibold text-gray-800">{cam.name}</h2>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {cam.floor}
                                    </span>
                                </div>

                                <div className="flex justify-center gap-2 pt-2">
                                    <Tooltip text="Start">
                                        <button
                                            onClick={() => handleStart(cam.id)}
                                            disabled={!cam.isActive}
                                            className="p-2.5 rounded-xl bg-green-50 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed text-green-700 transition-colors"
                                            aria-label="Start stream"
                                        >
                                            <FaVideo className="text-lg" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip text="Stop">
                                        <button
                                            onClick={() => handleStop(cam.id)}
                                            disabled={!cam.isActive}
                                            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 transition-colors"
                                            aria-label="Stop stream"
                                        >
                                            <FaStop className="text-lg" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip text="Capture">
                                        <button
                                            onClick={() => handleCapture(cam.id)}
                                            disabled={!cam.isActive}
                                            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 transition-colors"
                                            aria-label="Capture snapshot"
                                        >
                                            <FaCamera className="text-lg" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip text="Fullscreen">
                                        <button
                                            onClick={() => handleFullscreen(cam.id)}
                                            disabled={!cam.isActive}
                                            className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors"
                                            aria-label="View fullscreen"
                                        >
                                            <FaExpand className="text-lg" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Simple Tooltip Component
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    return (
        <div className="group relative inline-block">
            {children}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {text}
            </span>
        </div>
    );
};

export default CameraController;