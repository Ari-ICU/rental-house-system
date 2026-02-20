import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: "%s | Rental House Management System",
    default: "Dashboard | Rental House Management System",
  },
  description: "Manage and track rental properties effortlessly. Handle rental transactions, track bills, and streamline client management with our premium platform.",
  applicationName: "Xander Rentals",
  keywords: ["Rental", "Property Management", "Billing", "Real Estate", "House", "Cambodia"],
  authors: [{ name: "Xander" }],
  openGraph: {
    title: "Rental House Management System",
    description: "Premium rental management platform. Manage properties, bills, and clients efficiently.",
    url: "/",
    siteName: "Xander Rentals",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rental House Management Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rental House Management System",
    description: "Premium rental management platform. Manage properties, bills, and clients efficiently.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LangProvider>
          {children}
        </LangProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 1000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}