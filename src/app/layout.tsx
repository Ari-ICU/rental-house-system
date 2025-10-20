import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";


export const metadata: Metadata = {
  title: "Rental House Management",
  description: "Manage and browse rental houses easily, find your ideal home, and handle rental transactions efficiently.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
