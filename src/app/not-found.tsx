"use client";

import Link from "next/link";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

const PageNotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800 px-4">
            <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
            <h1 className="text-5xl font-bold mb-2">404</h1>
            <p className="text-xl mb-6">Oops! Page Not Found</p>
            <p className="text-center text-gray-600 mb-6">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
                <FaHome />
                Go Back to Dashboard
            </Link>
        </div>
    );
};

export default PageNotFound;
