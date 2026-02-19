// types/camera.ts
export type Camera = {
    id: number;
    name: string;
    floor: string;
    streamUrl?: string;
    deviceId?: string;
    isActive: boolean;
};