import CameraController from "@/components/camera/CameraController";
import { Camera } from "@/types/camera";

const cameras: Camera[] = [
    { id: 1, name: 'Entrance Camera', floor: 'Ground Floor', streamUrl: '/demo/entrance.mp4', isActive: true },
    { id: 2, name: 'Hallway Camera', floor: '1st Floor', streamUrl: '/demo/hallway.mp4', isActive: false },
    { id: 3, name: 'Lobby Camera', floor: '2nd Floor', streamUrl: '/demo/lobby.mp4', isActive: false },
    { id: 4, name: 'Roof Camera', floor: '3rd Floor', streamUrl: '/demo/roof.mp4', isActive: true },
    // Example local camera (no streamUrl, configure deviceId via settings)
    { id: 5, name: 'Webcam', floor: 'Ground Floor', isActive: true },
];

const floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

const CameraPage = () => {
    return (
        <div className="min-h-screen">
            <CameraController cameras={cameras} floors={floors} />
        </div>
    );
};

export default CameraPage;