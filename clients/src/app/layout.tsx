import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: "%s | RentFlow",
    default: "RentFlow | Professional Rental Management",
  },
  description: "Advanced rental management ecosystem for modern landlords. Streamline client onboarding, automated billing, and real-time security monitoring in one premium dashboard.",
  applicationName: "RentFlow Premium",
  keywords: ["Rental Management", "PropTech", "SaaS", "Real Estate Dashboard", "Automated Billing", "Cambodia Property"],
  authors: [{ name: "RentFlow Team" }],
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "RentFlow | Professional Rental Management",
    description: "The most advanced dashboard for managing your rental properties. Professional, secure, and intuitive.",
    url: "https://rentflow.io",
    siteName: "RentFlow Premium",
    images: [
      {
        url: "/logo.png",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <LangProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
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