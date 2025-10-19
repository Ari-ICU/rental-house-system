// app/dashboard/help/page.tsx
"use client";

import React from "react";
import HelpCenter from "@/components/help/HelpCenter";

const HelpPage: React.FC = () => {

    return (
        <div className="min-h-screen">
            
            <main className="container mx-auto">
                <HelpCenter />
            </main>
        </div>
    );
};

export default HelpPage;