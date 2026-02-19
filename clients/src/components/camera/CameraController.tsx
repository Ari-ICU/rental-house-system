// src/components/camera/CameraController.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaStop, FaExpand, FaCamera, FaBuilding, FaCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import Hls from 'hls.js';
import CameraSettings from '@/components/setting/CameraSettings';
import { Camera } from '@/types/camera';
import { toast } from 'react-hot-toast'; // npm install react-hot-toast

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
    const [cameras, setCameras] = useState<Camera[]>(initialCameras);
    const [streams, setStreams] = useState<Record<number, MediaStream | null>>({});
    const [cameraStates, setCameraStates] = useState<Record<number, { loading: boolean; error: string | null }>>({});
    const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
    const hlsRefs = useRef<Record<number, Hls | null>>({});

    const updateCameraState = (id: number, updates: Partial<{ loading: boolean; error: string | null }>) => {
        setCameraStates(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    };

    const requestCameraPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            setAvailableDevices(videoDevices);
            toast.dismiss();
            toast.success('Camera permission granted');
        } catch (err) {
            console.error('Permission denied for camera access:', err);
            setHasPermission(false);
            toast.dismiss();
            toast.error('Camera permission denied');
        }
    };

    const handleDeviceSelect = (id: number, deviceId: string) => {
        setCameras(prev => prev.map(cam => 
            cam.id === id ? { ...cam, deviceId: deviceId || undefined, streamUrl: undefined } : cam
        ));
        toast.dismiss();
        toast.success('Device selected successfully');
    };

    const handleUpdateStreamUrl = (id: number, url: string) => {
        setCameras(prev => prev.map(cam => 
            cam.id === id ? { ...cam, streamUrl: url || undefined, deviceId: undefined } : cam
        ));
        toast.dismiss();
        toast.success('Stream URL updated');
    };

    const handleToggleActive = (id: number) => {
        setCameras(prev => prev.map(cam => 
            cam.id === id ? { ...cam, isActive: !cam.isActive } : cam
        ));
        const newActive = !cameras.find(c => c.id === id)?.isActive;
        toast.dismiss();
        toast.success(`Camera ${newActive ? 'activated' : 'deactivated'}`);
        // Optionally stop or start based on new state
        if (newActive) {
            handleStart(id);
        } else {
            handleStop(id);
        }
    };

    const handleStart = async (id: number) => {
        const cam = cameras.find((c) => c.id === id);
        if (!cam) {
            toast.dismiss();
            toast.error('Camera not found');
            return;
        }

        const video = videoRefs.current[id];
        if (!video) {
            toast.dismiss();
            toast.error('Video element not found');
            return;
        }

        updateCameraState(id, { loading: true, error: null });

        if (cam.streamUrl) {
            console.log(`Attempting to load remote stream: ${cam.streamUrl}`); // For debugging
            if (Hls.isSupported() && cam.streamUrl.toLowerCase().endsWith('.m3u8')) {
                // Use HLS.js for HLS streams
                try {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90,
                    });
                    hls.loadSource(cam.streamUrl);
                    hls.attachMedia(video);
                    hlsRefs.current[id] = hls;
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        updateCameraState(id, { loading: false });
                        video.play().catch((err) => {
                            console.error('Error playing HLS stream:', err);
                            updateCameraState(id, { error: 'Failed to play HLS stream' });
                            toast.dismiss();
                            toast.error('Failed to play HLS stream');
                        });
                        toast.dismiss();
                        toast.success('HLS stream started');
                    });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error('HLS Error:', data);
                        updateCameraState(id, { loading: false, error: `HLS Error: ${data.details || 'Unknown'}` });
                        toast.dismiss();
                        toast.error(`HLS Error: ${data.details || 'Unknown'}`);
                    });
                } catch (err) {
                    console.error('Error setting up HLS:', err);
                    updateCameraState(id, { loading: false, error: 'Failed to set up HLS stream' });
                    toast.dismiss();
                    toast.error('Failed to set up HLS stream');
                }
            } else {
                // Fallback to native video src
                video.src = cam.streamUrl;
                video.load();

                const onLoadedMetadata = () => {
                    updateCameraState(id, { loading: false });
                    video.play().catch((err) => {
                        console.error('Error playing remote stream:', err);
                        updateCameraState(id, { error: 'Unsupported stream format or invalid URL' });
                        toast.dismiss();
                        toast.error('Unsupported stream format or invalid URL');
                    });
                    toast.dismiss();
                    toast.success('Remote stream started');
                };

                const onError = (e: Event) => {
                    updateCameraState(id, { loading: false, error: 'Failed to load stream: Invalid or unsupported source' });
                    toast.dismiss();
                    toast.error('Failed to load stream: Invalid or unsupported source');
                };

                video.addEventListener('loadedmetadata', onLoadedMetadata);
                video.addEventListener('error', onError);

                // Cleanup listeners after a timeout or on stop
                setTimeout(() => {
                    video.removeEventListener('loadedmetadata', onLoadedMetadata);
                    video.removeEventListener('error', onError);
                }, 10000); // Arbitrary timeout
            }
        } else if (cam.deviceId) {
            // For local camera devices
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: cam.deviceId } },
                });
                video.srcObject = stream;
                setStreams((prev) => ({ ...prev, [id]: stream }));
                updateCameraState(id, { loading: false });
                video.play().catch((err) => {
                    console.error('Error playing local stream:', err);
                    updateCameraState(id, { error: 'Failed to play local camera' });
                    toast.dismiss();
                    toast.error('Failed to play local camera');
                });
                toast.dismiss();
                toast.success('Local camera started');
            } catch (err) {
                console.error('Error accessing camera device:', err);
                updateCameraState(id, { loading: false, error: 'Permission denied or camera not available' });
                toast.dismiss();
                toast.error('Permission denied or camera not available');
            }
        } else {
            updateCameraState(id, { loading: false, error: 'No stream URL or device ID configured' });
            toast.dismiss();
            toast.error('No stream URL or device ID configured');
        }
    };

    const handleStop = (id: number) => {
        const video = videoRefs.current[id];
        if (!video) {
            toast.dismiss();
            toast.error('Video element not found');
            return;
        }

        const hls = hlsRefs.current[id];
        if (hls) {
            // Cleanup HLS
            hls.destroy();
            hlsRefs.current[id] = null;
            video.src = '';
        } else if (video.srcObject) {
            // For local streams
            const stream = streams[id];
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
                setStreams((prev) => ({ ...prev, [id]: null }));
            }
            video.srcObject = null;
        } else {
            // For remote native streams
            video.pause();
            video.src = '';
            video.load();
        }
        updateCameraState(id, { loading: false, error: null });
        toast.dismiss();
        toast.success('Stream stopped');
    };

    const handleCapture = (id: number) => {
        const video = videoRefs.current[id];
        const state = cameraStates[id];
        if (!video || video.readyState === 0 || state?.error) {
            toast.dismiss();
            toast.error('Cannot capture: Stream not ready');
            return;
        }
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
            toast.dismiss();
            toast.success('Snapshot captured and downloaded');
        } else {
            toast.dismiss();
            toast.error('Failed to capture snapshot');
        }
    };

    const handleFullscreen = (id: number) => {
        const video = videoRefs.current[id];
        if (video?.requestFullscreen) {
            video.requestFullscreen().catch((err) => {
                console.error('Error entering fullscreen:', err);
                toast.dismiss();
                toast.error('Failed to enter fullscreen');
            });
            toast.dismiss();
            toast.success('Entered fullscreen');
        } else {
            toast.dismiss();
            toast.error('Fullscreen not supported');
        }
    };

    // Auto-connect active cameras on mount
    useEffect(() => {
        const connectActiveCameras = async () => {
            for (const cam of cameras) {
                if (cam.isActive) {
                    await handleStart(cam.id);
                }
            }
        };

        connectActiveCameras();

        // Cleanup on unmount
        return () => {
            // Cleanup local streams
            Object.entries(streams).forEach(([idStr, stream]) => {
                if (stream) {
                    const id = Number(idStr);
                    const video = videoRefs.current[id];
                    if (video) {
                        video.srcObject = null;
                    }
                    stream.getTracks().forEach((track) => track.stop());
                }
            });
            // Cleanup HLS instances
            Object.keys(hlsRefs.current).forEach((idStr) => {
                const id = Number(idStr);
                const hls = hlsRefs.current[id];
                if (hls) {
                    hls.destroy();
                }
                const video = videoRefs.current[id];
                if (video) {
                    video.src = '';
                    video.srcObject = null;
                    video.load();
                }
            });
            setStreams({});
            hlsRefs.current = {};
            setCameraStates({});
        };
    }, [cameras]);

    const getCameraState = (id: number) => cameraStates[id] || { loading: false, error: null };

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

                <div className="flex items-center gap-3">
                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                        <option value="All Floors">All Floors</option>
                        {floors.map((floor) => (
                            <option key={floor} value={floor}>
                                {floor}
                            </option>
                        ))}
                    </select>
                    <Tooltip text="Settings">
                        <button
                            onClick={async () => {
                                if (!hasPermission && availableDevices.length === 0) {
                                    await requestCameraPermission();
                                }
                                setIsSettingsOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                            aria-label="Open settings"
                        >
                            <FaCog className="text-lg" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Camera Grid */}
            {filteredCameras.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No cameras available for this selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredCameras.map((cam) => {
                        const state = getCameraState(cam.id);
                        return (
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
                                        className="w-full h-full object-cover"
                                        controls={false}
                                        muted
                                        playsInline
                                        autoPlay={false}
                                    />
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                                        <FaCircle
                                            className={`text-xs ${cam.isActive ? 'text-green-400' : 'text-red-400'}`}
                                        />
                                        <span className="text-white text-xs font-medium">
                                            {cam.isActive ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                    {/* Loading Overlay */}
                                    {state.loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="text-white text-sm">Loading...</div>
                                        </div>
                                    )}
                                    {/* Error Overlay */}
                                    {state.error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center p-4">
                                            <FaExclamationTriangle className="text-yellow-400 text-2xl mb-2" />
                                            <p className="text-sm font-medium mb-2">Stream Error</p>
                                            <p className="text-xs opacity-90">{state.error}</p>
                                            <button
                                                onClick={() => handleStart(cam.id)}
                                                className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}
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
                                                disabled={!cam.isActive || state.loading}
                                                className="p-2.5 rounded-xl bg-green-50 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed text-green-700 transition-colors"
                                                aria-label="Start stream"
                                            >
                                                <FaVideo className="text-lg" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Stop">
                                            <button
                                                onClick={() => handleStop(cam.id)}
                                                disabled={!cam.isActive || state.loading}
                                                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 transition-colors"
                                                aria-label="Stop stream"
                                            >
                                                <FaStop className="text-lg" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Capture">
                                            <button
                                                onClick={() => handleCapture(cam.id)}
                                                disabled={!cam.isActive || state.loading || state.error !== null}
                                                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 transition-colors"
                                                aria-label="Capture snapshot"
                                            >
                                                <FaCamera className="text-lg" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Fullscreen">
                                            <button
                                                onClick={() => handleFullscreen(cam.id)}
                                                disabled={!cam.isActive || state.loading || state.error !== null}
                                                className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors"
                                                aria-label="View fullscreen"
                                            >
                                                <FaExpand className="text-lg" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <CameraSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                cameras={cameras}
                availableDevices={availableDevices}
                hasPermission={hasPermission}
                onRequestPermission={requestCameraPermission}
                onDeviceSelect={handleDeviceSelect}
                onUpdateStreamUrl={handleUpdateStreamUrl}
                onToggleActive={handleToggleActive}
            />
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