"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
    const handleLogin = (data: { email: string; password: string }) => {
        console.log("Login Data:", data);
        // Call API here
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="login" onSubmit={handleLogin} />
        </div>
    );
}
