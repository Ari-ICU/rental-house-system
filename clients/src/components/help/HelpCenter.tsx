// components/HelpCenter.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

interface HelpItem {
    title: string;
    description: string;
    href: string;
    linkText: string;
}

const HelpCenter: React.FC = () => {
    const { lang } = useLang();

    // Translations
    const translations = {
        en: {
            helpCenter: "Help Center",
            searchPlaceholder: "Search",
            checkLink: "Check a link's destination with the Billy Checker",
            learnMore: "Learn more",
            bestOfLinks: "Best of Links",
            createBillyCodes: "Create Billy Codes",
            organizePage: "Organize your page",
            monitorAnalyze: "Monitor and analyze",
            watchTutorials: "Watch tutorials",
        },
        km: {
            helpCenter: "មជ្ឈមណ្ឌលជំនួយ",
            searchPlaceholder: "ស្វែងរក",
            checkLink: "ពិនិត្យគោលដៅតំណដោយប្រើ Billy Checker",
            learnMore: "សិក្សាបន្ថែម",
            bestOfLinks: "តំណល្អបំផុត",
            createBillyCodes: "បង្កើតកូដ Billy",
            organizePage: "រៀបចំទំព័រ",
            monitorAnalyze: "តាមដាន និងវិភាគ",
            watchTutorials: "មើលមេរៀន",
        },
    };

    const t = translations[lang];

    // Dynamic Help Items
    const helpItems: HelpItem[] = [
        {
            title: lang === "en" ? "Getting Started" : "ការចាប់ផ្ដើម",
            description: lang === "en" ? "Learn the basics of Billy's Connections Platform" : "សិក្សាគន្លងមូលដ្ឋាននៃវេទិកា Billy's Connections",
            href: "/getting-started",
            linkText: t.learnMore,
        },
        {
            title: lang === "en" ? "Billy Links" : "តំណ Billy",
            description: lang === "en" ? "Make the most of your links" : "អនុវត្តល្អបំផុតនៃតំណរបស់អ្នក",
            href: "/billy-links",
            linkText: t.bestOfLinks,
        },
        {
            title: lang === "en" ? "Billy Codes" : "កូដ Billy",
            description: lang === "en" ? "Create, customize, and share QR Codes" : "បង្កើត ប្តូរ ទុក និងចែករំលែក QR Codes",
            href: "/billy-codes",
            linkText: t.createBillyCodes,
        },
        {
            title: lang === "en" ? "Billy Pages" : "ទំព័រ Billy",
            description: lang === "en" ? "Organize your content on a single, shareable page" : "រៀបចំមាតិការបស់អ្នកនៅលើទំព័រមួយដែលអាចចែករំលែកបាន",
            href: "/billy-pages",
            linkText: t.organizePage,
        },
        {
            title: lang === "en" ? "Billy Analytics" : "វិភាគ Billy",
            description: lang === "en" ? "Monitor and analyze link, QR Code, and Billy Page performance" : "តាមដាន និងវិភាគការសម្តែងនៃតំណ រឺ QR Code និងទំព័រ Billy",
            href: "/billy-analytics",
            linkText: t.monitorAnalyze,
        },
        {
            title: lang === "en" ? "Videos & Webinars" : "វីដេអូ & សិក្ខាសាលា",
            description: lang === "en" ? "Watch our tutorials" : "មើលមេរៀនរបស់យើង",
            href: "/videos-webinars",
            linkText: t.watchTutorials,
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Main Hero Section */}
            <section className="bg-orange-50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl">“</span>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900">{t.helpCenter}</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{t.checkLink}</span>
                    </div>
                </div>
            </section>

            {/* Grid Sections */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {helpItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                            <p className="text-gray-600 mb-4">{item.description}</p>
                            <Link href={item.href} className="text-orange-500 hover:underline">
                                {item.linkText}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HelpCenter;
