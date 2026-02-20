import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports",
    description: "Generate and export financial, occupancy, and analytical property management reports.",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
