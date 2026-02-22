// src/components/camera/CameraController.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaVideo, FaStop, FaExpand, FaCamera, FaBuilding, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import Hls from 'hls.js';
import CameraSettings from '@/components/setting/CameraSettings';
import { Camera } from '@/types/camera';
import { useLang } from '@/context/LangContext';
import CustomDropdown from '@/common/CustomDropdown';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

interface CameraControllerProps {
    cameras?: Camera[];
    floors?: string[];
}

const defaultFloors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

const CameraController: React.FC<CameraControllerProps> = ({
    cameras: initialCameras = [],
    floors = defaultFloors,
}) => {
    const { lang } = useLang();
    const [selectedFloor, setSelectedFloor] = useState('All Floors');
    const [cameras, setCameras] = useState<Camera[]>(initialCameras);
    const streamsRef = useRef<Record<number, MediaStream | null>>({});
    const [cameraStates, setCameraStates] = useState<Record<number, { loading: boolean; error: string | null }>>({});
    const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
    const hlsRefs = useRef<Record<number, Hls | null>>({});

    const updateCameraState = useCallback((id: number, updates: Partial<{ loading: boolean; error: string | null }>) => {
        setCameraStates(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    }, []);

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

    const handleDeviceSelect = async (id: number, deviceId: string) => {
        try {
            const cam = cameras.find(c => c.id === id);
            if (!cam) return;

            const updatedCam = { ...cam, deviceId: deviceId || null, streamUrl: null };
            await api.put(`/api/cameras/${id}`, updatedCam);

            setCameras(prev => prev.map(c =>
                c.id === id ? { ...c, deviceId: deviceId || undefined, streamUrl: undefined } : c
            ));
            toast.dismiss();
            toast.success(lang === 'km' ? 'បានជ្រើសរើសឧបករណ៍ដោយជោគជ័យ' : 'Device selected successfully');
        } catch (err) {
            console.error('Failed to update camera device:', err);
            toast.error('Failed to update camera device');
        }
    };

    const handleUpdateStreamUrl = async (id: number, url: string) => {
        try {
            const cam = cameras.find(c => c.id === id);
            if (!cam) return;

            const updatedCam = { ...cam, streamUrl: url || null, deviceId: null };
            await api.put(`/api/cameras/${id}`, updatedCam);

            setCameras(prev => prev.map(c =>
                c.id === id ? { ...c, streamUrl: url || undefined, deviceId: undefined } : c
            ));
            toast.dismiss();
            toast.success(lang === 'km' ? 'បានធ្វើបច្ចុប្បន្នភាពតំណភ្ជាប់ស្ទ្រីម' : 'Stream URL updated');
        } catch (err) {
            console.error('Failed to update stream URL:', err);
            toast.error('Failed to update stream URL');
        }
    };

    const handleToggleActive = async (id: number) => {
        const cam = cameras.find(c => c.id === id);
        if (!cam) return;

        const newActive = !cam.isActive;
        try {
            await api.put(`/api/cameras/${id}`, { ...cam, isActive: newActive });

            setCameras(prev => prev.map(c =>
                c.id === id ? { ...c, isActive: newActive } : c
            ));

            toast.dismiss();
            toast.success(lang === 'km'
                ? `កាមេរ៉ា ${newActive ? 'ត្រូវបានបើក' : 'ត្រូវបានបិទ'}`
                : `Camera ${newActive ? 'activated' : 'deactivated'}`);

            if (newActive) {
                handleStart(id);
            } else {
                handleStop(id);
            }
        } catch (err) {
            console.error('Failed to toggle camera status:', err);
            toast.error('Failed to update camera status');
        }
    };

    const handleAddCamera = async (newCamera: Omit<Camera, 'id'>) => {
        try {
            const response = await api.post<Camera>('/api/cameras', newCamera);
            if (response.data) {
                setCameras(prev => [...prev, response.data!]);
                toast.success(lang === 'km' ? 'បានបន្ថែមលកាមេរ៉ាដោយជោគជ័យ' : 'Camera added successfully');
            }
        } catch (err) {
            console.error('Failed to add camera:', err);
            toast.error('Failed to add camera');
        }
    };

    const handleDeleteCamera = async (id: number) => {
        if (!confirm(lang === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបកាមេរ៉ានេះមែនទេ?' : 'Are you sure you want to delete this camera?')) return;

        try {
            await api.delete(`/api/cameras/${id}`);
            handleStop(id);
            setCameras(prev => prev.filter(c => c.id !== id));
            toast.success(lang === 'km' ? 'បានលុបកាមេរ៉ាដោយជោគជ័យ' : 'Camera deleted successfully');
        } catch (err) {
            console.error('Failed to delete camera:', err);
            toast.error('Failed to delete camera');
        }
    };

    const handleStart = useCallback(async (id: number) => {
        const cam = cameras.find((c) => c.id === id);
        if (!cam) {
            toast.dismiss();
            toast.error(lang === 'km' ? 'រកមិនឃើញកាមេរ៉ា' : 'Camera not found');
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
                        toast.error(lang === 'km' ? `កំហុស HLS: ${data.details || 'មិនស្គាល់'}` : `HLS Error: ${data.details || 'Unknown'}`);
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

                const onError = () => {
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
                streamsRef.current = { ...streamsRef.current, [id]: stream };
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
    }, [cameras, updateCameraState, lang]);

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
            const stream = streamsRef.current[id];
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
                streamsRef.current = { ...streamsRef.current, [id]: null };
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
        const currentVideoRefs = videoRefs.current;
        const currentHlsRefs = hlsRefs.current;

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
            Object.entries(streamsRef.current).forEach(([idStr, stream]) => {
                if (stream) {
                    const id = Number(idStr);
                    const video = currentVideoRefs[id];
                    if (video) {
                        video.srcObject = null;
                    }
                    stream.getTracks().forEach((track) => track.stop());
                }
            });
            // Cleanup HLS instances
            Object.keys(currentHlsRefs).forEach((idStr) => {
                const id = Number(idStr);
                const hls = currentHlsRefs[id];
                if (hls) {
                    hls.destroy();
                }
                const video = currentVideoRefs[id];
                if (video) {
                    video.src = '';
                    video.srcObject = null;
                    video.load();
                }
            });
            streamsRef.current = {};
            hlsRefs.current = {};
            setCameraStates({});
        };
    }, [cameras, handleStart]);

    const getCameraState = (id: number) => cameraStates[id] || { loading: false, error: null };

    const filteredCameras =
        selectedFloor === 'All Floors'
            ? cameras
            : cameras.filter((cam) => cam.floor === selectedFloor);

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="relative z-20 flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-none">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30">
                        <FaVideo size={10} />
                        {lang === 'km' ? 'ប្រព័ន្ធត្រួតពិនិត្យសុវត្ថិភាព' : 'Security Monitoring System'}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50">
                            <FaBuilding className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                {lang === 'km' ? 'មជ្ឈមណ្ឌលកាមេរ៉ា' : 'Camera Center'}
                            </h1>
                            <p className="text-gray-500 dark:text-slate-400 font-bold text-sm">
                                {lang === 'km' ? 'ការផ្សាយបន្តផ្ទាល់ និងការគ្រប់គ្រងផ្នែកសន្តិសុខ' : 'Live stream surveillance and security management'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-[1.5rem] border border-white dark:border-slate-800 shadow-inner dark:shadow-none">
                    <div className="w-56">
                        <CustomDropdown
                            options={[
                                { value: 'All Floors', label: lang === 'km' ? 'គ្រប់ជាន់' : 'All Floors' },
                                ...floors.map(f => {
                                    let label = f;
                                    if (lang === 'km') {
                                        if (f === 'Ground Floor') label = 'ជាន់ផ្ទាល់ដី';
                                        else if (f === '1st Floor') label = 'ជាន់ទី ១';
                                        else if (f === '2nd Floor') label = 'ជាន់ទី ២';
                                        else if (f === '3rd Floor') label = 'ជាន់ទី ៣';
                                    }
                                    return { value: f, label };
                                })
                            ]}
                            value={selectedFloor}
                            onChange={(val) => setSelectedFloor(val)}
                            className="!rounded-2xl !bg-white dark:!bg-slate-800 !border-gray-100/50 dark:!border-slate-700 !shadow-sm hover:!border-blue-400 dark:hover:!border-blue-500 transition-all font-bold text-sm"
                        />
                    </div>
                    <Tooltip text={lang === 'km' ? 'ការកំណត់' : 'Settings'}>
                        <button
                            onClick={async () => {
                                if (!hasPermission && availableDevices.length === 0) {
                                    await requestCameraPermission();
                                }
                                setIsSettingsOpen(true);
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all shadow-sm active:scale-90"
                            aria-label="Open settings"
                        >
                            <FaCog className="text-xl" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Camera Grid */}
            {filteredCameras.length === 0 ? (
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-24 text-center border border-white dark:border-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-none flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-white dark:ring-slate-800">
                        <FaVideo size={36} className="text-gray-300 dark:text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                        {lang === 'km' ? 'មិនមានកាមេរ៉ា' : 'No Cameras Found'}
                    </h3>
                    <p className="text-gray-400 dark:text-slate-500 font-medium text-sm max-w-md mx-auto leading-relaxed">
                        {lang === 'km'
                            ? 'មិនមានកាមេរ៉ាសម្រាប់ជម្រើសនេះទេ។ សូមជ្រើសរើសជាន់ផ្សេង ឬបន្ថែមឧបករណ៍ថ្មី។'
                            : 'There are no active camera feeds available for the selected floor. Please check your device configuration.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredCameras.map((cam) => {
                        const state = getCameraState(cam.id);
                        return (
                            <div
                                key={cam.id}
                                className="group bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-blue-900/5 dark:shadow-none border border-white dark:border-slate-800 overflow-hidden hover:shadow-blue-500/10 dark:hover:border-slate-700 transition-all duration-500 hover:-translate-y-1 animate-in fade-in zoom-in-95 duration-500"
                            >
                                {/* Video Container */}
                                <div className="relative bg-[#0b0e14] aspect-video">
                                    <video
                                        ref={(el: HTMLVideoElement | null) => {
                                            videoRefs.current[cam.id] = el;
                                        }}
                                        className="w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-90"
                                        controls={false}
                                        muted
                                        playsInline
                                        autoPlay={false}
                                    />

                                    {/* Live Status Indicators */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 shadow-lg ${cam.isActive ? 'bg-red-500/80 text-white' : 'bg-black/60 text-gray-400'}`}>
                                            <div className={`w-2 h-2 rounded-full ${cam.isActive ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                {cam.isActive ? 'LIVE' : 'OFFLINE'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        {cam.isActive && (
                                            <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                <span className="text-[9px] font-mono tracking-wider opacity-90">REC</span>
                                            </div>
                                        )}
                                        <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white">
                                            <span className="text-[9px] font-mono tracking-wider opacity-80">{cam.floor}</span>
                                        </div>
                                    </div>

                                    {/* Loading Overlay */}
                                    {state.loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e14]/40 backdrop-blur-sm">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-[3px] border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
                                                <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
                                                    {lang === 'km' ? 'កំពុងផ្ទុក...' : 'Loading Stream'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Overlay */}
                                    {state.error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/20 backdrop-blur-md text-white text-center p-8">
                                            <div className="bg-rose-500/40 p-4 rounded-3xl mb-4 border border-rose-500/30">
                                                <FaExclamationTriangle className="text-white text-3xl" />
                                            </div>
                                            <p className="text-lg font-black tracking-tight mb-1">
                                                {lang === 'km' ? 'កំហុសស្ទ្រីម' : 'Stream Interrupted'}
                                            </p>
                                            <p className="text-[11px] font-medium opacity-80 max-w-[200px] mb-6 leading-relaxed">
                                                {lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុកស្ទ្រីម: ប្រភពមិនត្រឹមត្រូវ' : 'Failed to synchronize with the remote video source'}
                                            </p>
                                            <button
                                                onClick={() => handleStart(cam.id)}
                                                className="px-8 py-2.5 bg-white text-[#0b0e14] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-black/20"
                                            >
                                                {lang === 'km' ? 'ព្យាយាមម្តងទៀត' : 'Retry Connection'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Info & Controls */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${cam.isActive ? 'bg-gradient-to-b from-blue-500 to-indigo-600' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                                            <div>
                                                <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {cam.name}
                                                </h2>
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1.5">
                                                    {lang === 'km' ? 'កាមេរ៉ាសុវត្ថិភាព IP' : 'IP Security Camera'}
                                                </p>
                                            </div>
                                        </div>
                                        {cam.isActive && (
                                            <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center animate-pulse">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Control Toolbar */}
                                    <div className="flex items-center justify-between bg-gray-50/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-1">
                                            <Tooltip text={lang === 'km' ? 'ចាប់ផ្តើម' : "Start"}>
                                                <button
                                                    onClick={() => handleStart(cam.id)}
                                                    disabled={!cam.isActive || state.loading}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all active:scale-90"
                                                >
                                                    <FaVideo size={14} />
                                                </button>
                                            </Tooltip>
                                            <Tooltip text={lang === 'km' ? 'បញ្ឈប់' : "Stop"}>
                                                <button
                                                    onClick={() => handleStop(cam.id)}
                                                    disabled={!cam.isActive || state.loading}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-rose-600 dark:text-rose-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all active:scale-90"
                                                >
                                                    <FaStop size={14} />
                                                </button>
                                            </Tooltip>
                                        </div>

                                        <div className="w-px h-6 bg-gray-200 dark:bg-slate-700"></div>

                                        <div className="flex items-center gap-1">
                                            <Tooltip text={lang === 'km' ? 'ថតរូប' : "Capture"}>
                                                <button
                                                    onClick={() => handleCapture(cam.id)}
                                                    disabled={!cam.isActive || state.loading || state.error !== null}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 dark:text-blue-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all active:scale-90"
                                                >
                                                    <FaCamera size={14} />
                                                </button>
                                            </Tooltip>
                                            <Tooltip text={lang === 'km' ? 'ពេញអេក្រង់' : "Fullscreen"}>
                                                <button
                                                    onClick={() => handleFullscreen(cam.id)}
                                                    disabled={!cam.isActive || state.loading || state.error !== null}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all active:scale-90"
                                                >
                                                    <FaExpand size={14} />
                                                </button>
                                            </Tooltip>
                                        </div>
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
                onAddCamera={handleAddCamera}
                onDeleteCamera={handleDeleteCamera}
                floors={floors}
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