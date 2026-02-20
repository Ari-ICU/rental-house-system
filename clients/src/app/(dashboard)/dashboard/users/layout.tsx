import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users Management",
    description: "Manage system administrators and operators for the rental management platform.",
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
