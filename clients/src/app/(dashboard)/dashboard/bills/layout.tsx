import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bills",
    description: "Manage monthly bills, track water and electricity charges, and oversee payment statuses.",
};

export default function BillsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
