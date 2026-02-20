import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Camera Integration",
    description: "Monitor properties via integrated camera and security tools efficiently.",
};

export default function CameraLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
