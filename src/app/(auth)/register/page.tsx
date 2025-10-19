"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
    const handleRegister = (data: { email: string; password: string; name?: string }) => {
        console.log("Register Data:", data);
        // Call API here
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="register" onSubmit={handleRegister} />
        </div>
    );
}
