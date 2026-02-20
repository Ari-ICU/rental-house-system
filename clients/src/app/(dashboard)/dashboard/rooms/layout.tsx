import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rooms",
    description: "View and manage all available and occupied rental rooms.",
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
