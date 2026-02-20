import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rentals",
    description: "Manage your property rentals, active tenants, new reservations, and general operations.",
};

export default function RentalsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
