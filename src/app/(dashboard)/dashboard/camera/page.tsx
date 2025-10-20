import CameraController, { Camera } from "@/components/camera/CameraController";

const cameras: Camera[] = [
    { id: 1, name: 'Entrance Camera', floor: 'Ground Floor', streamUrl: '/demo/entrance.mp4', isActive: true },
    { id: 2, name: 'Hallway Camera', floor: '1st Floor', streamUrl: '/demo/hallway.mp4', isActive: false },
    { id: 3, name: 'Lobby Camera', floor: '2st Floor', streamUrl: '/demo/lobby.mp4', isActive: false },
    { id: 4, name: 'Roof Camera', floor: '3rd Floor', streamUrl: '/demo/roof.mp4', isActive: true },
];

const CameraPage = () => {
    return (
        <div className="">
            <CameraController cameras={cameras} />
        </div>
    );
};

export default CameraPage;
